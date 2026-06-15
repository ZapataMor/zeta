<?php

namespace App\Http\Controllers;

use App\Models\Proyecto;
use App\Models\Tarea;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TareaController extends Controller
{
    public function store(Request $request, Proyecto $proyecto): RedirectResponse
    {
        $proyecto->tareas()->create($this->validated($request));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tarea creada.']);

        return back();
    }

    public function update(Request $request, Tarea $tarea): RedirectResponse
    {
        $tarea->update($this->validated($request));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tarea actualizada.']);

        return back();
    }

    public function destroy(Tarea $tarea): RedirectResponse
    {
        $tarea->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tarea eliminada.']);

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'tipo' => ['required', 'string', 'in:tarea,requerimiento'],
            'estado' => ['required', 'string', 'in:pendiente,en_progreso,en_revision,hecha'],
            'prioridad' => ['required', 'string', 'in:baja,media,alta'],
            'persona_id' => ['nullable', 'integer', 'exists:personas,id'],
            'fecha_limite' => ['nullable', 'date'],
        ]);
    }
}
