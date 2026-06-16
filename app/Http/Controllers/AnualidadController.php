<?php

namespace App\Http\Controllers;

use App\Models\Anualidad;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AnualidadController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('finanzas/anualidades/index', [
            'anualidades' => Anualidad::query()->orderBy('fecha_inicio')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('finanzas/anualidades/create');
    }

    public function store(Request $request): RedirectResponse
    {
        Anualidad::create($this->validated($request));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Anualidad creada.']);

        return to_route('anualidades.index');
    }

    public function edit(Anualidad $anualidad): Response
    {
        return Inertia::render('finanzas/anualidades/edit', [
            'anualidad' => $anualidad,
        ]);
    }

    public function update(Request $request, Anualidad $anualidad): RedirectResponse
    {
        $anualidad->update($this->validated($request));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Anualidad actualizada.']);

        return to_route('anualidades.index');
    }

    public function destroy(Anualidad $anualidad): RedirectResponse
    {
        $anualidad->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Anualidad eliminada.']);

        return to_route('anualidades.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'tipo' => ['required', 'string', 'in:renta,suscripcion'],
            'monto' => ['required', 'numeric', 'min:0'],
            'periodicidad' => ['required', 'string', 'in:mensual,trimestral,semestral,anual'],
            'fecha_inicio' => ['required', 'date'],
            'fin_tipo' => ['required', 'string', 'in:fecha,meses,indefinida'],
            'fecha_fin' => ['nullable', 'required_if:fin_tipo,fecha', 'date', 'after_or_equal:fecha_inicio'],
            'duracion_meses' => ['nullable', 'required_if:fin_tipo,meses', 'integer', 'min:1', 'max:600'],
            'tasa_interes_anual' => ['nullable', 'numeric', 'min:0', 'max:1000'],
            'renovar' => ['boolean'],
            'notas' => ['nullable', 'string'],
        ]);

        // Normaliza la fecha de fin según el tipo de finalización elegido.
        $data['fecha_fin'] = match ($data['fin_tipo']) {
            'meses' => Carbon::parse($data['fecha_inicio'])->addMonths((int) $data['duracion_meses'] - 1)->toDateString(),
            'indefinida' => null,
            default => $data['fecha_fin'],
        };

        if ($data['fin_tipo'] !== 'meses') {
            $data['duracion_meses'] = null;
        }

        return $data;
    }
}
