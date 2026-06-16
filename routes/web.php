<?php

use App\Http\Controllers\AnualidadController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\FinanzasController;
use App\Http\Controllers\MovimientoController;
use App\Http\Controllers\PersonaController;
use App\Http\Controllers\ProyectoController;
use App\Http\Controllers\TareaController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::resource('clientes', ClienteController::class)->except(['show']);

    Route::resource('personal', PersonaController::class)
        ->parameters(['personal' => 'persona'])
        ->except(['show']);

    Route::resource('proyectos', ProyectoController::class);

    // Tareas / requerimientos (se gestionan desde la página del proyecto)
    Route::post('proyectos/{proyecto}/tareas', [TareaController::class, 'store'])->name('tareas.store');
    Route::patch('tareas/{tarea}', [TareaController::class, 'update'])->name('tareas.update');
    Route::delete('tareas/{tarea}', [TareaController::class, 'destroy'])->name('tareas.destroy');

    // Finanzas: proyección de capital, anualidades (rentas/suscripciones) y movimientos.
    Route::get('finanzas', [FinanzasController::class, 'index'])->name('finanzas.index');
    Route::put('finanzas/config', [FinanzasController::class, 'updateConfig'])->name('finanzas.config.update');
    Route::resource('finanzas/anualidades', AnualidadController::class)
        ->names('anualidades')
        ->parameters(['anualidades' => 'anualidad'])
        ->except(['show']);
    Route::resource('finanzas/movimientos', MovimientoController::class)
        ->names('movimientos')
        ->except(['show']);
    Route::patch('finanzas/movimientos/{movimiento}/estado', [MovimientoController::class, 'estado'])
        ->name('movimientos.estado');
});

require __DIR__.'/settings.php';
