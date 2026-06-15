<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cliente extends Model
{
    protected $fillable = [
        'nombre',
        'empresa',
        'email',
        'telefono',
        'estado',
        'notas',
    ];

    /**
     * Proyectos de este cliente.
     *
     * @return HasMany<Proyecto, $this>
     */
    public function proyectos(): HasMany
    {
        return $this->hasMany(Proyecto::class);
    }
}
