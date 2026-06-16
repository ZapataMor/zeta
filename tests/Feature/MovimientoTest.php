<?php

use App\Models\Movimiento;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('los invitados no pueden ver los movimientos', function () {
    $this->get(route('movimientos.index'))->assertRedirect(route('login'));
});

test('un usuario autenticado puede registrar un movimiento', function () {
    $this->actingAs(User::factory()->create());

    $this->post(route('movimientos.store'), [
        'concepto' => 'Compra de equipo',
        'tipo' => 'gasto',
        'monto' => 1500000,
        'fecha' => '2026-03-10',
        'estado' => 'pendiente',
    ])->assertRedirect(route('movimientos.index'));

    expect(Movimiento::where('concepto', 'Compra de equipo')->exists())->toBeTrue();
});

test('acepta fechas futuras', function () {
    $this->actingAs(User::factory()->create());

    $this->post(route('movimientos.store'), [
        'concepto' => 'Ingreso futuro',
        'tipo' => 'ingreso',
        'monto' => 500000,
        'fecha' => '2027-01-01',
        'estado' => 'pendiente',
    ])->assertRedirect(route('movimientos.index'));

    expect(Movimiento::where('concepto', 'Ingreso futuro')->exists())->toBeTrue();
});

test('valida el tipo de movimiento', function () {
    $this->actingAs(User::factory()->create());

    $this->post(route('movimientos.store'), [
        'concepto' => 'Inválido',
        'tipo' => 'transferencia',
        'monto' => 100,
        'fecha' => '2026-03-10',
        'estado' => 'pendiente',
    ])->assertSessionHasErrors('tipo');
});

test('un préstamo exige dirección y fecha de vencimiento', function () {
    $this->actingAs(User::factory()->create());

    $this->post(route('movimientos.store'), [
        'concepto' => 'Préstamo sin datos',
        'tipo' => 'prestamo',
        'monto' => 1000,
        'fecha' => '2026-03-10',
        'estado' => 'pendiente',
    ])->assertSessionHasErrors(['direccion', 'fecha_vencimiento']);
});

test('registra un préstamo otorgado con tasa', function () {
    $this->actingAs(User::factory()->create());

    $this->post(route('movimientos.store'), [
        'concepto' => 'Préstamo a socio',
        'tipo' => 'prestamo',
        'direccion' => 'otorgado',
        'monto' => 1000000,
        'tasa_interes_anual' => 24,
        'fecha' => '2026-01-01',
        'fecha_vencimiento' => '2026-12-31',
        'estado' => 'pendiente',
    ])->assertRedirect(route('movimientos.index'));

    $prestamo = Movimiento::where('concepto', 'Préstamo a socio')->firstOrFail();

    expect($prestamo->direccion)->toBe('otorgado')
        ->and($prestamo->entraDinero())->toBeFalse() // el desembolso sale de caja
        ->and((float) $prestamo->montoLiquidacion())->toBeGreaterThan(1000000.0);
});

test('limpia dirección y tasa cuando no es préstamo', function () {
    $this->actingAs(User::factory()->create());

    $this->post(route('movimientos.store'), [
        'concepto' => 'Gasto normal',
        'tipo' => 'gasto',
        'direccion' => 'otorgado',
        'monto' => 100,
        'tasa_interes_anual' => 10,
        'fecha' => '2026-03-10',
        'estado' => 'pendiente',
    ])->assertRedirect(route('movimientos.index'));

    $mov = Movimiento::where('concepto', 'Gasto normal')->firstOrFail();

    expect($mov->direccion)->toBeNull()
        ->and($mov->tasa_interes_anual)->toBeNull();
});

test('el check alterna el estado del movimiento', function () {
    $this->actingAs(User::factory()->create());

    $movimiento = Movimiento::create([
        'concepto' => 'Por cobrar',
        'tipo' => 'ingreso',
        'monto' => 200,
        'fecha' => '2026-03-10',
        'estado' => 'pendiente',
    ]);

    $this->patch(route('movimientos.estado', $movimiento), ['estado' => 'realizado']);

    $movimiento->refresh();
    expect($movimiento->estado)->toBe('realizado')
        ->and($movimiento->fecha_realizado)->not->toBeNull();
});

test('un usuario puede eliminar un movimiento', function () {
    $this->actingAs(User::factory()->create());

    $movimiento = Movimiento::create([
        'concepto' => 'Temporal',
        'tipo' => 'ingreso',
        'monto' => 100,
        'fecha' => '2026-03-10',
        'estado' => 'pendiente',
    ]);

    $this->delete(route('movimientos.destroy', $movimiento))
        ->assertRedirect(route('movimientos.index'));

    expect(Movimiento::find($movimiento->id))->toBeNull();
});
