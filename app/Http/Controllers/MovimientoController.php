<?php

namespace App\Http\Controllers;

use App\Models\Movimiento;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MovimientoController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('finanzas/movimientos/index', [
            'movimientos' => Movimiento::query()->orderByDesc('fecha')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('finanzas/movimientos/create');
    }

    public function store(Request $request): RedirectResponse
    {
        Movimiento::create($this->validated($request));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Movimiento registrado.']);

        return to_route('movimientos.index');
    }

    public function edit(Movimiento $movimiento): Response
    {
        return Inertia::render('finanzas/movimientos/edit', [
            'movimiento' => $movimiento,
        ]);
    }

    public function update(Request $request, Movimiento $movimiento): RedirectResponse
    {
        $movimiento->update($this->validated($request));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Movimiento actualizado.']);

        return to_route('movimientos.index');
    }

    public function destroy(Movimiento $movimiento): RedirectResponse
    {
        $movimiento->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Movimiento eliminado.']);

        return to_route('movimientos.index');
    }

    /**
     * Alterna el estado pendiente/realizado (check de cuentas por cobrar/pagar).
     */
    public function estado(Request $request, Movimiento $movimiento): RedirectResponse
    {
        $data = $request->validate([
            'estado' => ['required', 'string', 'in:pendiente,realizado'],
        ]);

        $movimiento->update([
            'estado' => $data['estado'],
            'fecha_realizado' => $data['estado'] === 'realizado' ? now()->toDateString() : null,
        ]);

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        $data = $request->validate([
            'concepto' => ['required', 'string', 'max:255'],
            'tipo' => ['required', 'string', 'in:ingreso,gasto,prestamo'],
            'direccion' => ['nullable', 'required_if:tipo,prestamo', 'in:otorgado,recibido'],
            'monto' => ['required', 'numeric', 'min:0'],
            'tasa_interes_anual' => ['nullable', 'numeric', 'min:0', 'max:1000'],
            'fecha' => ['required', 'date'],
            'fecha_vencimiento' => ['nullable', 'required_if:tipo,prestamo', 'date', 'after_or_equal:fecha'],
            'estado' => ['required', 'string', 'in:pendiente,realizado'],
            'notas' => ['nullable', 'string'],
        ]);

        // La dirección, el vencimiento y la tasa solo aplican a préstamos.
        if ($data['tipo'] !== 'prestamo') {
            $data['direccion'] = null;
            $data['fecha_vencimiento'] = null;
            $data['tasa_interes_anual'] = null;
        }

        return $data;
    }
}
