<?php

namespace App\Http\Controllers;

use App\Models\Anualidad;
use App\Models\FinanzaConfig;
use App\Models\Movimiento;
use App\Services\ProyeccionFinanciera;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FinanzasController extends Controller
{
    /** Horizontes de proyección permitidos, en meses. */
    private const HORIZONTES = [12, 24, 36, 60];

    public function index(Request $request, ProyeccionFinanciera $proyeccion): Response
    {
        $config = FinanzaConfig::singleton();

        $horizonte = (int) $request->integer('horizonte', 24);
        if (! in_array($horizonte, self::HORIZONTES, true)) {
            $horizonte = 24;
        }

        $cuentas = $this->cuentasPendientes();

        return Inertia::render('finanzas/index', [
            'config' => $config,
            'horizonte' => $horizonte,
            'horizontes' => self::HORIZONTES,
            'proyeccion' => $proyeccion->desdeConfig($config, $horizonte),
            'cuentas_por_cobrar' => $cuentas['cobrar'],
            'cuentas_por_pagar' => $cuentas['pagar'],
            'anualidades_por_renovar' => $this->anualidadesPorRenovar(),
            'totales' => [
                'anualidades' => Anualidad::count(),
                'rentas' => Anualidad::where('tipo', 'renta')->count(),
                'suscripciones' => Anualidad::where('tipo', 'suscripcion')->count(),
                'movimientos' => Movimiento::count(),
            ],
        ]);
    }

    /**
     * Movimientos pendientes agrupados en cuentas por cobrar (entra dinero) y por
     * pagar (sale dinero), ordenados por su fecha relevante y marcando vencidas/próximas.
     *
     * @return array{cobrar: array<int, array<string, mixed>>, pagar: array<int, array<string, mixed>>}
     */
    private function cuentasPendientes(): array
    {
        $hoy = CarbonImmutable::now()->startOfDay();

        $cuentas = Movimiento::query()
            ->where('estado', 'pendiente')
            ->get()
            ->map(function (Movimiento $m) use ($hoy) {
                $fechaRel = $m->tipo === 'prestamo' && $m->fecha_vencimiento !== null
                    ? CarbonImmutable::parse($m->fecha_vencimiento)
                    : CarbonImmutable::parse($m->fecha);

                $dias = (int) $hoy->diffInDays($fechaRel, false);

                return [
                    'id' => $m->id,
                    'concepto' => $m->concepto,
                    'tipo' => $m->tipo,
                    'direccion' => $m->direccion,
                    'monto' => round($m->montoLiquidacion(), 2),
                    'fecha' => $fechaRel->toDateString(),
                    'estado' => $m->estado,
                    'entra' => $m->entraDinero(),
                    'dias' => $dias,
                    'vencida' => $dias < 0,
                    'proxima' => $dias >= 0 && $dias <= 30,
                ];
            })
            ->sortBy('fecha')
            ->values();

        return [
            'cobrar' => $cuentas->where('entra', true)->values()->all(),
            'pagar' => $cuentas->where('entra', false)->values()->all(),
        ];
    }

    /**
     * Anualidades marcadas para renovar cuya fecha de fin está dentro de ~60 días.
     *
     * @return array<int, array<string, mixed>>
     */
    private function anualidadesPorRenovar(): array
    {
        $hoy = CarbonImmutable::now()->startOfDay();

        return Anualidad::query()
            ->where('renovar', true)
            ->whereNotNull('fecha_fin')
            ->whereBetween('fecha_fin', [$hoy->toDateString(), $hoy->addDays(60)->toDateString()])
            ->orderBy('fecha_fin')
            ->get()
            ->map(fn (Anualidad $a) => [
                'id' => $a->id,
                'nombre' => $a->nombre,
                'fecha_fin' => CarbonImmutable::parse($a->fecha_fin)->toDateString(),
            ])
            ->all();
    }

    public function updateConfig(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'capital_inicial' => ['required', 'numeric'],
            'fecha_base' => ['required', 'date'],
        ]);

        FinanzaConfig::singleton()->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Configuración actualizada.']);

        return back();
    }
}
