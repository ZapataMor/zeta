<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinanzaConfig extends Model
{
    protected $fillable = [
        'capital_inicial',
        'fecha_base',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'capital_inicial' => 'decimal:2',
            'fecha_base' => 'date',
        ];
    }

    /**
     * Devuelve la configuración única (singleton), creándola con valores por
     * defecto la primera vez.
     */
    public static function singleton(): self
    {
        return static::firstOrCreate([], [
            'capital_inicial' => 0,
            'fecha_base' => now()->startOfMonth(),
        ]);
    }
}
