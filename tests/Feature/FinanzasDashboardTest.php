<?php

use App\Models\Movimiento;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;

uses(RefreshDatabase::class);

test('el dashboard agrupa las cuentas por cobrar y por pagar', function () {
    $this->actingAs(User::factory()->create());

    // Por cobrar: ingreso pendiente.
    Movimiento::create([
        'concepto' => 'Factura cliente',
        'tipo' => 'ingreso',
        'monto' => 500,
        'fecha' => now()->addDays(10)->toDateString(),
        'estado' => 'pendiente',
    ]);

    // Por pagar: gasto pendiente.
    Movimiento::create([
        'concepto' => 'Proveedor',
        'tipo' => 'gasto',
        'monto' => 300,
        'fecha' => now()->addDays(5)->toDateString(),
        'estado' => 'pendiente',
    ]);

    // Realizado: no debe aparecer como cuenta pendiente.
    Movimiento::create([
        'concepto' => 'Ya cobrado',
        'tipo' => 'ingreso',
        'monto' => 999,
        'fecha' => now()->toDateString(),
        'estado' => 'realizado',
    ]);

    $this->get(route('finanzas.index'))->assertInertia(
        fn (AssertableInertia $page) => $page
            ->component('finanzas/index')
            ->has('cuentas_por_cobrar', 1)
            ->has('cuentas_por_pagar', 1)
            ->where('cuentas_por_cobrar.0.concepto', 'Factura cliente')
            ->where('cuentas_por_pagar.0.concepto', 'Proveedor')
    );
});

test('una cuenta vencida se marca como vencida', function () {
    $this->actingAs(User::factory()->create());

    Movimiento::create([
        'concepto' => 'Vencida',
        'tipo' => 'ingreso',
        'monto' => 100,
        'fecha' => now()->subDays(5)->toDateString(),
        'estado' => 'pendiente',
    ]);

    $this->get(route('finanzas.index'))->assertInertia(
        fn (AssertableInertia $page) => $page
            ->where('cuentas_por_cobrar.0.vencida', true)
    );
});
