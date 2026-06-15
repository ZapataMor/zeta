<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('personas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('email')->nullable();
            $table->string('cargo')->nullable();
            $table->string('github_username')->nullable(); // para la futura integración con GitHub
            $table->boolean('activo')->default(true);
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // cuenta de login opcional
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personas');
    }
};
