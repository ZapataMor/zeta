<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('anualidades', function (Blueprint $table) {
            $table->string('fin_tipo')->default('fecha')->after('fecha_inicio'); // fecha|meses|indefinida
            $table->unsignedInteger('duracion_meses')->nullable()->after('fin_tipo');
            $table->boolean('renovar')->default(false)->after('tasa_interes_anual');
        });

        // fecha_fin pasa a nullable para soportar anualidades indefinidas.
        Schema::table('anualidades', function (Blueprint $table) {
            $table->date('fecha_fin')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('anualidades', function (Blueprint $table) {
            $table->dropColumn(['fin_tipo', 'duracion_meses', 'renovar']);
        });
    }
};
