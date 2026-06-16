<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('movimientos', function (Blueprint $table) {
            // tipo ahora admite: ingreso | gasto | prestamo
            $table->string('direccion')->nullable()->after('tipo');       // prestamo: otorgado|recibido
            $table->string('estado')->default('pendiente')->after('fecha'); // pendiente|realizado
            $table->date('fecha_vencimiento')->nullable()->after('fecha');  // prestamo: devolución
            $table->decimal('tasa_interes_anual', 6, 3)->nullable()->after('monto'); // prestamo
            $table->date('fecha_realizado')->nullable()->after('estado');   // cuándo se marcó realizado
        });
    }

    public function down(): void
    {
        Schema::table('movimientos', function (Blueprint $table) {
            $table->dropColumn(['direccion', 'estado', 'fecha_vencimiento', 'tasa_interes_anual', 'fecha_realizado']);
        });
    }
};
