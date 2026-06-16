<?php

use App\Models\Anualidad;
use App\Models\FinanzaConfig;
use App\Models\Movimiento;
use App\Services\ProyeccionFinanciera;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Collection;

uses(RefreshDatabase::class);

function proyectar(int $horizonte, float $capital = 0.0): array
{
    return app(ProyeccionFinanciera::class)->generar(
        $capital,
        CarbonImmutable::parse('2026-01-01'),
        $horizonte,
        Anualidad::all(),
        Movimiento::all(),
    );
}

test('sin flujos el capital se mantiene constante', function () {
    $resultado = proyectar(12, 1000);

    expect($resultado['puntos'])->toHaveCount(12)
        ->and($resultado['puntos'][0]['capital'])->toBe(1000.0)
        ->and($resultado['resumen']['capital_final'])->toBe(1000.0)
        ->and($resultado['resumen']['total_ingresos'])->toBe(0.0);
});

test('una renta mensual suma su monto cada mes', function () {
    Anualidad::create([
        'nombre' => 'Mantenimiento',
        'tipo' => 'renta',
        'monto' => 100,
        'periodicidad' => 'mensual',
        'fecha_inicio' => '2026-01-01',
        'fecha_fin' => '2026-12-31',
    ]);

    $resultado = proyectar(12);

    expect($resultado['resumen']['total_ingresos'])->toBe(1200.0)
        ->and($resultado['resumen']['capital_final'])->toBe(1200.0)
        ->and($resultado['puntos'][0]['ingresos'])->toBe(100.0);
});

test('una suscripcion resta del capital', function () {
    Anualidad::create([
        'nombre' => 'Licencia',
        'tipo' => 'suscripcion',
        'monto' => 50,
        'periodicidad' => 'mensual',
        'fecha_inicio' => '2026-01-01',
        'fecha_fin' => '2026-12-31',
    ]);

    $resultado = proyectar(12, 1000);

    expect($resultado['resumen']['total_egresos'])->toBe(600.0)
        ->and($resultado['resumen']['capital_final'])->toBe(400.0);
});

test('una anualidad trimestral solo aporta cada tres meses', function () {
    Anualidad::create([
        'nombre' => 'Trimestral',
        'tipo' => 'renta',
        'monto' => 300,
        'periodicidad' => 'trimestral',
        'fecha_inicio' => '2026-01-01',
        'fecha_fin' => '2026-12-31',
    ]);

    $resultado = proyectar(12);

    // Ocurre en ene, abr, jul, oct => 4 aportes de 300.
    expect($resultado['resumen']['total_ingresos'])->toBe(1200.0)
        ->and($resultado['puntos'][0]['ingresos'])->toBe(300.0)
        ->and($resultado['puntos'][1]['ingresos'])->toBe(0.0);
});

test('un movimiento puntual futuro impacta en su mes', function () {
    Movimiento::create([
        'concepto' => 'Anticipo',
        'tipo' => 'ingreso',
        'monto' => 500,
        'fecha' => '2026-04-15',
    ]);

    $resultado = proyectar(12);

    expect($resultado['puntos'][2]['capital'])->toBe(0.0)   // marzo
        ->and($resultado['puntos'][3]['ingresos'])->toBe(500.0) // abril
        ->and($resultado['resumen']['capital_final'])->toBe(500.0);
});

test('una anualidad con interes capitaliza por encima de los aportes', function () {
    Anualidad::create([
        'nombre' => 'Fondo',
        'tipo' => 'renta',
        'monto' => 1000,
        'periodicidad' => 'mensual',
        'fecha_inicio' => '2026-01-01',
        'fecha_fin' => '2026-12-31',
        'tasa_interes_anual' => 12, // 1% mensual
    ]);

    $resultado = proyectar(12);

    // Valor futuro de anualidad ordinaria: 1000 * ((1.01^12 - 1) / 0.01) = 12682.50
    expect($resultado['resumen']['capital_final'])->toEqualWithDelta(12682.50, 0.5)
        ->and($resultado['resumen']['interes_generado'])->toBeGreaterThan(0.0)
        ->and($resultado['resumen']['total_ingresos'])->toBe(12000.0);
});

test('respeta la fecha de fin y no aporta despues', function () {
    Anualidad::create([
        'nombre' => 'Corta',
        'tipo' => 'renta',
        'monto' => 100,
        'periodicidad' => 'mensual',
        'fecha_inicio' => '2026-01-01',
        'fecha_fin' => '2026-03-31',
    ]);

    $resultado = proyectar(12);

    // Solo ene, feb, mar => 300.
    expect($resultado['resumen']['total_ingresos'])->toBe(300.0)
        ->and($resultado['puntos'][3]['ingresos'])->toBe(0.0);
});

test('desdeConfig usa la configuracion guardada', function () {
    $config = FinanzaConfig::create([
        'capital_inicial' => 5000,
        'fecha_base' => '2026-01-01',
    ]);

    $resultado = app(ProyeccionFinanciera::class)->desdeConfig($config, 12);

    expect($resultado['resumen']['capital_inicial'])->toBe(5000.0)
        ->and($resultado['puntos'])->toHaveCount(12);
});

test('una anualidad indefinida aporta durante todo el horizonte', function () {
    Anualidad::create([
        'nombre' => 'Indefinida',
        'tipo' => 'renta',
        'monto' => 100,
        'periodicidad' => 'mensual',
        'fecha_inicio' => '2026-01-01',
        'fin_tipo' => 'indefinida',
        'fecha_fin' => null,
    ]);

    $resultado = proyectar(24);

    // 24 meses de aportes de 100.
    expect($resultado['resumen']['total_ingresos'])->toBe(2400.0)
        ->and($resultado['puntos'][23]['ingresos'])->toBe(100.0);
});

test('un préstamo otorgado sale hoy y regresa al vencimiento', function () {
    Movimiento::create([
        'concepto' => 'Préstamo',
        'tipo' => 'prestamo',
        'direccion' => 'otorgado',
        'monto' => 1000,
        'fecha' => '2026-01-15',
        'fecha_vencimiento' => '2026-07-15',
        'estado' => 'pendiente',
    ]);

    $resultado = proyectar(12);

    // Sale 1000 en enero (egreso), vuelven 1000 en julio (ingreso). Neto 0.
    expect($resultado['puntos'][0]['egresos'])->toBe(1000.0)
        ->and($resultado['puntos'][6]['ingresos'])->toBe(1000.0)
        ->and($resultado['resumen']['capital_final'])->toBe(0.0);
});

test('un préstamo otorgado con interés deja ganancia', function () {
    Movimiento::create([
        'concepto' => 'Préstamo con interés',
        'tipo' => 'prestamo',
        'direccion' => 'otorgado',
        'monto' => 1000,
        'tasa_interes_anual' => 24, // 6 meses => +12%
        'fecha' => '2026-01-15',
        'fecha_vencimiento' => '2026-07-15',
        'estado' => 'pendiente',
    ]);

    $resultado = proyectar(12);

    // -1000 + 1120 = 120 de ganancia por el interés.
    expect($resultado['resumen']['capital_final'])->toEqualWithDelta(120.0, 0.5);
});

test('un préstamo recibido entra hoy y se paga al vencimiento', function () {
    Movimiento::create([
        'concepto' => 'Préstamo recibido',
        'tipo' => 'prestamo',
        'direccion' => 'recibido',
        'monto' => 2000,
        'fecha' => '2026-02-01',
        'fecha_vencimiento' => '2026-08-01',
        'estado' => 'pendiente',
    ]);

    $resultado = proyectar(12);

    expect($resultado['puntos'][1]['ingresos'])->toBe(2000.0)
        ->and($resultado['puntos'][7]['egresos'])->toBe(2000.0)
        ->and($resultado['resumen']['capital_final'])->toBe(0.0);
});

test('limita el horizonte a un maximo razonable', function () {
    $resultado = app(ProyeccionFinanciera::class)->generar(
        0.0,
        CarbonImmutable::parse('2026-01-01'),
        999,
        new Collection,
        new Collection,
    );

    expect($resultado['puntos'])->toHaveCount(120);
});
