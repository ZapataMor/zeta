<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Tarea extends Model
{
    protected $fillable = [
        'proyecto_id',
        'titulo',
        'descripcion',
        'tipo',
        'estado',
        'prioridad',
        'persona_id',
        'fecha_limite',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fecha_limite' => 'date',
        ];
    }

    /**
     * @return BelongsTo<Proyecto, $this>
     */
    public function proyecto(): BelongsTo
    {
        return $this->belongsTo(Proyecto::class);
    }

    /**
     * Persona asignada a la tarea.
     *
     * @return BelongsTo<Persona, $this>
     */
    public function asignado(): BelongsTo
    {
        return $this->belongsTo(Persona::class, 'persona_id');
    }
}
