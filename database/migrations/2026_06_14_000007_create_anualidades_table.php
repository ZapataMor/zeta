<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('anualidades', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('tipo')->default('renta');        // renta (ingreso) | suscripcion (egreso)
            $table->decimal('monto', 15, 2);                  // monto por periodo
            $table->string('periodicidad')->default('mensual'); // mensual|trimestral|semestral|anual
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->decimal('tasa_interes_anual', 6, 3)->nullable(); // % anual, opcional (capitaliza si existe)
            $table->text('notas')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('anualidades');
    }
};
