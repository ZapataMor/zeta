<?php

use App\Http\Controllers\ClienteController;
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
});

require __DIR__.'/settings.php';
