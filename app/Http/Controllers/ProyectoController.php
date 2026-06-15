<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\Persona;
use App\Models\Proyecto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProyectoController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('proyectos/index', [
            'proyectos' => Proyecto::query()
                ->with(['cliente:id,nombre', 'productOwner:id,nombre'])
                ->withCount(['tareas', 'participantes'])
                ->latest()
                ->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('proyectos/create', $this->formData());
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $participantes = $data['participantes'] ?? [];
        unset($data['participantes']);

        $proyecto = Proyecto::create($data);
        $proyecto->participantes()->sync($participantes);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Proyecto creado.']);

        return to_route('proyectos.show', $proyecto);
    }

    public function show(Proyecto $proyecto): Response
    {
        $proyecto->load([
            'cliente:id,nombre',
            'productOwner:id,nombre',
            'participantes:id,nombre,cargo',
            'tareas' => fn ($q) => $q->with('asignado:id,nombre')->latest(),
        ]);

        return Inertia::render('proyectos/show', [
            'proyecto' => $proyecto,
            'personas' => Persona::query()->where('activo', true)->orderBy('nombre')->get(['id', 'nombre']),
        ]);
    }

    public function edit(Proyecto $proyecto): Response
    {
        $proyecto->load('participantes:id');

        return Inertia::render('proyectos/edit', [
            'proyecto' => $proyecto,
            'participantesActuales' => $proyecto->participantes->pluck('id'),
            ...$this->formData(),
        ]);
    }

    public function update(Request $request, Proyecto $proyecto): RedirectResponse
    {
        $data = $this->validated($request);
        $participantes = $data['participantes'] ?? [];
        unset($data['participantes']);

        $proyecto->update($data);
        $proyecto->participantes()->sync($participantes);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Proyecto actualizado.']);

        return to_route('proyectos.show', $proyecto);
    }

    public function destroy(Proyecto $proyecto): RedirectResponse
    {
        $proyecto->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Proyecto eliminado.']);

        return to_route('proyectos.index');
    }

    /**
     * Datos compartidos por los formularios de crear/editar.
     *
     * @return array<string, mixed>
     */
    private function formData(): array
    {
        return [
            'clientes' => Cliente::query()->orderBy('nombre')->get(['id', 'nombre']),
            'personas' => Persona::query()->where('activo', true)->orderBy('nombre')->get(['id', 'nombre', 'cargo']),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string'],
            'cliente_id' => ['nullable', 'integer', 'exists:clientes,id'],
            'product_owner_id' => ['nullable', 'integer', 'exists:personas,id'],
            'estado' => ['required', 'string', 'in:en_definicion,en_progreso,pausado,entregado'],
            'github_repo' => ['nullable', 'string', 'max:255'],
            'fecha_inicio' => ['nullable', 'date'],
            'fecha_fin' => ['nullable', 'date', 'after_or_equal:fecha_inicio'],
            'participantes' => ['array'],
            'participantes.*' => ['integer', 'exists:personas,id'],
        ]);
    }
}
