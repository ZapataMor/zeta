<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClienteController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('clientes/index', [
            'clientes' => Cliente::query()
                ->withCount('proyectos')
                ->orderBy('nombre')
                ->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('clientes/create');
    }

    public function store(Request $request): RedirectResponse
    {
        Cliente::create($this->validated($request));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Cliente creado.']);

        return to_route('clientes.index');
    }

    public function edit(Cliente $cliente): Response
    {
        return Inertia::render('clientes/edit', [
            'cliente' => $cliente,
        ]);
    }

    public function update(Request $request, Cliente $cliente): RedirectResponse
    {
        $cliente->update($this->validated($request));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Cliente actualizado.']);

        return to_route('clientes.index');
    }

    public function destroy(Cliente $cliente): RedirectResponse
    {
        $cliente->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Cliente eliminado.']);

        return to_route('clientes.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'empresa' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'telefono' => ['nullable', 'string', 'max:50'],
            'estado' => ['required', 'string', 'in:prospecto,en_conversacion,activo,inactivo'],
            'notas' => ['nullable', 'string'],
        ]);
    }
}
