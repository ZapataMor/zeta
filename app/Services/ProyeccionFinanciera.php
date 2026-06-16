<?php

namespace App\Services;

use App\Models\Anualidad;
use App\Models\FinanzaConfig;
use App\Models\Movimiento;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

/**
 * Motor de proyección de capital.
 *
 * Construye una línea de tiempo mensual a partir de:
 *  - un capital inicial situado en una fecha base,
 *  - anualidades (rentas que suman / suscripciones que restan) que se repiten
 *    entre su fecha de inicio y fin según su periodicidad, con interés opcional,
 *  - movimientos puntuales (ingresos/gastos esporádicos) con una fecha.
 *
 * Convención: el capital inicial representa el capital que existe en la fecha
 * base. La proyección parte de esa fecha hacia adelante; las ocurrencias previas
 * a la fecha base se consideran ya reflejadas en el capital inicial y no se grafican.
 *
 * Cuando una anualidad tiene tasa de interés anual, su aporte se acumula en un
 * fondo que capitaliza con interés compuesto mensual (valor futuro de una
 * anualidad): saldo = saldo * (1 + tasa/12) + aporte. Esto modela fondos de
 * ahorro destinados a préstamos futuros (o deuda que crece, si es suscripción).
 */
class ProyeccionFinanciera
{
    /** Número de meses entre ocurrencias según la periodicidad. */
    private const PASO_MESES = [
        'mensual' => 1,
        'trimestral' => 3,
        'semestral' => 6,
        'anual' => 12,
    ];

    /**
     * @param  Collection<int, Anualidad>  $anualidades
     * @param  Collection<int, Movimiento>  $movimientos
     * @return array{
     *     puntos: list<array{mes: string, etiqueta: string, capital: float, ingresos: float, egresos: float, interes: float, neto: float}>,
     *     resumen: array{capital_inicial: float, capital_final: float, total_ingresos: float, total_egresos: float, interes_generado: float}
     * }
     */
    public function generar(
        float $capitalInicial,
        CarbonImmutable $fechaBase,
        int $horizonteMeses,
        Collection $anualidades,
        Collection $movimientos,
    ): array {
        $horizonteMeses = max(1, min($horizonteMeses, 120));
        $inicio = $fechaBase->startOfMonth();

        $capital = $capitalInicial;

        // Saldo acumulado de cada anualidad con interés (id => saldo del fondo).
        $saldos = [];

        $puntos = [];
        $totalIngresos = 0.0;
        $totalEgresos = 0.0;
        $totalInteres = 0.0;

        for ($i = 0; $i < $horizonteMeses; $i++) {
            $mes = $inicio->addMonths($i);

            $ingresosMes = 0.0;
            $egresosMes = 0.0;
            $interesMes = 0.0;

            foreach ($anualidades as $anualidad) {
                $signo = $anualidad->tipo === 'renta' ? 1 : -1;
                $monto = (float) $anualidad->monto;
                $tasa = $anualidad->tasa_interes_anual !== null
                    ? (float) $anualidad->tasa_interes_anual
                    : null;

                // Interés sobre el fondo acumulado (antes del aporte del mes).
                if ($tasa !== null) {
                    $tasaMensual = ($tasa / 100) / 12;
                    $saldoPrevio = $saldos[$anualidad->id] ?? 0.0;
                    $interes = $saldoPrevio * $tasaMensual;
                    $saldos[$anualidad->id] = $saldoPrevio + $interes;
                    $capital += $interes;
                    $interesMes += $interes;
                }

                // Aporte del periodo, si una ocurrencia cae en este mes.
                if ($this->ocurreEn($anualidad, $mes)) {
                    $flujo = $signo * $monto;
                    $capital += $flujo;

                    if ($tasa !== null) {
                        // El bloque de interés anterior ya inicializó el saldo de esta anualidad.
                        $saldos[$anualidad->id] += $flujo;
                    }

                    if ($signo > 0) {
                        $ingresosMes += $monto;
                    } else {
                        $egresosMes += $monto;
                    }
                }
            }

            foreach ($movimientos as $movimiento) {
                foreach ($this->impactosMovimiento($movimiento) as [$fechaImpacto, $monto]) {
                    if (! $fechaImpacto->isSameMonth($mes)) {
                        continue;
                    }

                    if ($monto >= 0) {
                        $capital += $monto;
                        $ingresosMes += $monto;
                    } else {
                        $capital += $monto;
                        $egresosMes += abs($monto);
                    }
                }
            }

            $totalIngresos += $ingresosMes;
            $totalEgresos += $egresosMes;
            $totalInteres += $interesMes;

            $puntos[] = [
                'mes' => $mes->format('Y-m'),
                'etiqueta' => $this->etiqueta($mes),
                'capital' => round($capital, 2),
                'ingresos' => round($ingresosMes, 2),
                'egresos' => round($egresosMes, 2),
                'interes' => round($interesMes, 2),
                'neto' => round($ingresosMes - $egresosMes + $interesMes, 2),
            ];
        }

        return [
            'puntos' => $puntos,
            'resumen' => [
                'capital_inicial' => round($capitalInicial, 2),
                'capital_final' => round($capital, 2),
                'total_ingresos' => round($totalIngresos, 2),
                'total_egresos' => round($totalEgresos, 2),
                'interes_generado' => round($totalInteres, 2),
            ],
        ];
    }

    /**
     * Construye la proyección a partir de la configuración y datos guardados.
     *
     * @return array{puntos: list<array<string, mixed>>, resumen: array<string, float>}
     */
    public function desdeConfig(FinanzaConfig $config, int $horizonteMeses): array
    {
        return $this->generar(
            (float) $config->capital_inicial,
            CarbonImmutable::parse($config->fecha_base),
            $horizonteMeses,
            Anualidad::all(),
            Movimiento::all(),
        );
    }

    /**
     * ¿Cae una ocurrencia de la anualidad dentro del mes calendario indicado?
     */
    private function ocurreEn(Anualidad $anualidad, CarbonImmutable $mes): bool
    {
        $inicio = CarbonImmutable::parse($anualidad->fecha_inicio)->startOfMonth();

        $diffMeses = ($mes->year - $inicio->year) * 12 + ($mes->month - $inicio->month);

        if ($diffMeses < 0) {
            return false;
        }

        $paso = self::PASO_MESES[$anualidad->periodicidad] ?? 1;

        if ($diffMeses % $paso !== 0) {
            return false;
        }

        // Sin fecha de fin (anualidad indefinida): aporta durante todo el horizonte.
        if ($anualidad->fecha_fin === null) {
            return true;
        }

        // La ocurrencia no debe sobrepasar la fecha de fin.
        $ocurrencia = CarbonImmutable::parse($anualidad->fecha_inicio)->addMonths($diffMeses);
        $fin = CarbonImmutable::parse($anualidad->fecha_fin);

        return $ocurrencia->lessThanOrEqualTo($fin->endOfMonth());
    }

    /**
     * Expande un movimiento en sus impactos de caja [fecha, monto con signo].
     * Préstamos generan dos piernas: desembolso/recepción y devolución.
     *
     * @return list<array{0: CarbonImmutable, 1: float}>
     */
    private function impactosMovimiento(Movimiento $movimiento): array
    {
        $fecha = CarbonImmutable::parse($movimiento->fecha);
        $monto = (float) $movimiento->monto;

        if ($movimiento->tipo === 'ingreso') {
            return [[$fecha, $monto]];
        }

        if ($movimiento->tipo === 'gasto') {
            return [[$fecha, -$monto]];
        }

        // Préstamo: pierna inicial (en su fecha) + pierna de devolución (al vencimiento).
        $liquidacion = $movimiento->montoLiquidacion();
        $vencimiento = $movimiento->fecha_vencimiento !== null
            ? CarbonImmutable::parse($movimiento->fecha_vencimiento)
            : null;

        if ($movimiento->direccion === 'otorgado') {
            // La empresa presta: sale el capital hoy, regresa la devolución después.
            $impactos = [[$fecha, -$monto]];
            if ($vencimiento !== null) {
                $impactos[] = [$vencimiento, $liquidacion];
            }

            return $impactos;
        }

        // Préstamo recibido: entra el capital hoy, se devuelve después.
        $impactos = [[$fecha, $monto]];
        if ($vencimiento !== null) {
            $impactos[] = [$vencimiento, -$liquidacion];
        }

        return $impactos;
    }

    private function etiqueta(CarbonImmutable $mes): string
    {
        $meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        return $meses[$mes->month - 1].' '.$mes->format('y');
    }
}
