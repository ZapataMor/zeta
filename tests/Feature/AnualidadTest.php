<?php

use App\Models\Anualidad;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('los invitados no pueden ver las anualidades', function () {
    $this->get(route('anualidades.index'))->assertRedirect(route('login'));
});

test('un usuario autenticado puede crear una anualidad', function () {
    $this->actingAs(User::factory()->create());

    $this->post(route('anualidades.store'), [
        'nombre' => 'Mantenimiento Cliente X',
        'tipo' => 'renta',
        'monto' => 250000,
        'periodicidad' => 'mensual',
        'fecha_inicio' => '2026-01-01',
        'fin_tipo' => 'fecha',
        'fecha_fin' => '2026-12-31',
        'tasa_interes_anual' => null,
    ])->assertRedirect(route('anualidades.index'));

    expect(Anualidad::where('nombre', 'Mantenimiento Cliente X')->exists())->toBeTrue();
});

test('crea una anualidad por número de meses calculando la fecha de fin', function () {
    $this->actingAs(User::factory()->create());

    $this->post(route('anualidades.store'), [
        'nombre' => 'Por 6 meses',
        'tipo' => 'renta',
        'monto' => 100,
        'periodicidad' => 'mensual',
        'fecha_inicio' => '2026-01-01',
        'fin_tipo' => 'meses',
        'duracion_meses' => 6,
    ])->assertRedirect(route('anualidades.index'));

    $anualidad = Anualidad::where('nombre', 'Por 6 meses')->firstOrFail();

    // 6 meses desde enero => última ocurrencia en junio.
    expect($anualidad->fecha_fin->toDateString())->toBe('2026-06-01')
        ->and($anualidad->duracion_meses)->toBe(6);
});

test('crea una anualidad indefinida sin fecha de fin', function () {
    $this->actingAs(User::factory()->create());

    $this->post(route('anualidades.store'), [
        'nombre' => 'Indefinida',
        'tipo' => 'suscripcion',
        'monto' => 50,
        'periodicidad' => 'mensual',
        'fecha_inicio' => '2026-01-01',
        'fin_tipo' => 'indefinida',
    ])->assertRedirect(route('anualidades.index'));

    $anualidad = Anualidad::where('nombre', 'Indefinida')->firstOrFail();

    expect($anualidad->fecha_fin)->toBeNull();
});

test('valida el tipo de anualidad', function () {
    $this->actingAs(User::factory()->create());

    $this->post(route('anualidades.store'), [
        'nombre' => 'Inválida',
        'tipo' => 'otro',
        'monto' => 100,
        'periodicidad' => 'mensual',
        'fecha_inicio' => '2026-01-01',
        'fin_tipo' => 'fecha',
        'fecha_fin' => '2026-12-31',
    ])->assertSessionHasErrors('tipo');
});

test('la fecha de fin no puede ser anterior a la de inicio', function () {
    $this->actingAs(User::factory()->create());

    $this->post(route('anualidades.store'), [
        'nombre' => 'Fechas mal',
        'tipo' => 'renta',
        'monto' => 100,
        'periodicidad' => 'mensual',
        'fecha_inicio' => '2026-12-31',
        'fin_tipo' => 'fecha',
        'fecha_fin' => '2026-01-01',
    ])->assertSessionHasErrors('fecha_fin');
});

test('un usuario puede actualizar y eliminar una anualidad', function () {
    $this->actingAs(User::factory()->create());

    $anualidad = Anualidad::create([
        'nombre' => 'Original',
        'tipo' => 'renta',
        'monto' => 100,
        'periodicidad' => 'mensual',
        'fecha_inicio' => '2026-01-01',
        'fecha_fin' => '2026-12-31',
    ]);

    $this->put(route('anualidades.update', $anualidad), [
        'nombre' => 'Editada',
        'tipo' => 'suscripcion',
        'monto' => 200,
        'periodicidad' => 'anual',
        'fecha_inicio' => '2026-01-01',
        'fin_tipo' => 'fecha',
        'fecha_fin' => '2026-12-31',
    ])->assertRedirect(route('anualidades.index'));

    expect($anualidad->fresh()->nombre)->toBe('Editada')
        ->and($anualidad->fresh()->tipo)->toBe('suscripcion');

    $this->delete(route('anualidades.destroy', $anualidad))
        ->assertRedirect(route('anualidades.index'));

    expect(Anualidad::find($anualidad->id))->toBeNull();
});
