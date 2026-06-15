<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proyecto_persona', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proyecto_id')->constrained('proyectos')->cascadeOnDelete();
            $table->foreignId('persona_id')->constrained('personas')->cascadeOnDelete();
            $table->string('rol')->nullable(); // rol de la persona dentro del proyecto
            $table->timestamps();
            $table->unique(['proyecto_id', 'persona_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proyecto_persona');
    }
};
