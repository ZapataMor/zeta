<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tareas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proyecto_id')->constrained('proyectos')->cascadeOnDelete();
            $table->string('titulo');
            $table->text('descripcion')->nullable();
            $table->string('tipo')->default('tarea');        // tarea|requerimiento
            $table->string('estado')->default('pendiente');  // pendiente|en_progreso|en_revision|hecha
            $table->string('prioridad')->default('media');   // baja|media|alta
            $table->foreignId('persona_id')->nullable()->constrained('personas')->nullOnDelete(); // asignado a
            $table->date('fecha_limite')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tareas');
    }
};
