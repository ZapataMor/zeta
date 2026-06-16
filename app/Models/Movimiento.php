<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;

class Movimiento extends Model
{
    protected $fillable = [
        'concepto',
        'tipo',
        'direccion',
        'monto',
        'tasa_interes_anual',
        'fecha',
        'fecha_vencimiento',
        'estado',
        'fecha_realizado',
        'notas',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'monto' => 'decimal:2',
            'tasa_interes_anual' => 'decimal:3',
            'fecha' => 'date',
            'fecha_vencimiento' => 'date',
            'fecha_realizado' => 'date',
        ];
    }

    /**
     * ¿El movimiento aporta dinero a la caja? (entra dinero)
     * ingreso y préstamo recibido suman; gasto y préstamo otorgado restan.
     */
    public function entraDinero(): bool
    {
        return match (true) {
            $this->tipo === 'ingreso' => true,
            $this->tipo === 'gasto' => false,
            $this->tipo === 'prestamo' => $this->direccion === 'recibido',
            default => true,
        };
    }

    /**
     * Monto de liquidación de la cuenta (capital + interés simple para préstamos).
     */
    public function montoLiquidacion(): float
    {
        $monto = (float) $this->monto;

        if ($this->tipo !== 'prestamo' || $this->tasa_interes_anual === null || $this->fecha_vencimiento === null) {
            return $monto;
        }

        $meses = CarbonImmutable::parse($this->fecha)->diffInMonths(CarbonImmutable::parse($this->fecha_vencimiento));

        return $monto * (1 + ((float) $this->tasa_interes_anual / 100) * ($meses / 12));
    }
}
