<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Proyecto extends Model
{
    protected $fillable = [
        'nombre',
        'descripcion',
        'cliente_id',
        'product_owner_id',
        'estado',
        'github_repo',
        'fecha_inicio',
        'fecha_fin',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fecha_inicio' => 'date',
            'fecha_fin' => 'date',
        ];
    }

    /**
     * @return BelongsTo<Cliente, $this>
     */
    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    /**
     * Persona que es Product Owner del proyecto.
     *
     * @return BelongsTo<Persona, $this>
     */
    public function productOwner(): BelongsTo
    {
        return $this->belongsTo(Persona::class, 'product_owner_id');
    }

    /**
     * Personas que participan en el proyecto.
     *
     * @return BelongsToMany<Persona, $this>
     */
    public function participantes(): BelongsToMany
    {
        return $this->belongsToMany(Persona::class, 'proyecto_persona')
            ->withPivot('rol')
            ->withTimestamps();
    }

    /**
     * Tareas / requerimientos del proyecto.
     *
     * @return HasMany<Tarea, $this>
     */
    public function tareas(): HasMany
    {
        return $this->hasMany(Tarea::class);
    }
}
