<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Anualidad extends Model
{
    /**
     * Laravel pluraliza "Anualidad" como "anualidads"; fijamos la tabla correcta.
     */
    protected $table = 'anualidades';

    protected $fillable = [
        'nombre',
        'tipo',
        'monto',
        'periodicidad',
        'fecha_inicio',
        'fin_tipo',
        'duracion_meses',
        'fecha_fin',
        'tasa_interes_anual',
        'renovar',
        'notas',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'monto' => 'decimal:2',
            'fecha_inicio' => 'date',
            'fecha_fin' => 'date',
            'duracion_meses' => 'integer',
            'tasa_interes_anual' => 'decimal:3',
            'renovar' => 'boolean',
        ];
    }
}
