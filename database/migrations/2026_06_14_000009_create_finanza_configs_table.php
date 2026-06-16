<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('finanza_configs', function (Blueprint $table) {
            $table->id();
            $table->decimal('capital_inicial', 15, 2)->default(0); // capital de partida
            $table->date('fecha_base');                            // punto de inicio de la proyección
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('finanza_configs');
    }
};
