<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Persona extends Model
{
    protected $fillable = [
        'nombre',
        'email',
        'cargo',
        'github_username',
        'activo',
        'user_id',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
        ];
    }

    /**
     * Cuenta de login asociada (opcional).
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Proyectos en los que participa.
     *
     * @return BelongsToMany<Proyecto, $this>
     */
    public function proyectos(): BelongsToMany
    {
        return $this->belongsToMany(Proyecto::class, 'proyecto_persona')
            ->withPivot('rol')
            ->withTimestamps();
    }

    /**
     * Proyectos donde es Product Owner.
     *
     * @return HasMany<Proyecto, $this>
     */
    public function proyectosLiderados(): HasMany
    {
        return $this->hasMany(Proyecto::class, 'product_owner_id');
    }

    /**
     * Tareas asignadas a esta persona.
     *
     * @return HasMany<Tarea, $this>
     */
    public function tareas(): HasMany
    {
        return $this->hasMany(Tarea::class);
    }
}
