<?php

namespace App\Http\Controllers;

use App\Models\Persona;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PersonaController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('personal/index', [
            'personas' => Persona::query()
                ->with('user:id,name,email')
                ->orderBy('nombre')
                ->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('personal/create', [
            'usuarios' => User::query()->orderBy('name')->get(['id', 'name', 'email']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Persona::create($this->validated($request));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Persona agregada al personal.']);

        return to_route('personal.index');
    }

    public function edit(Persona $persona): Response
    {
        return Inertia::render('personal/edit', [
            'persona' => $persona,
            'usuarios' => User::query()->orderBy('name')->get(['id', 'name', 'email']),
        ]);
    }

    public function update(Request $request, Persona $persona): RedirectResponse
    {
        $persona->update($this->validated($request));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Persona actualizada.']);

        return to_route('personal.index');
    }

    public function destroy(Persona $persona): RedirectResponse
    {
        $persona->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Persona eliminada.']);

        return to_route('personal.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request): array
    {
        return $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'cargo' => ['nullable', 'string', 'max:255'],
            'github_username' => ['nullable', 'string', 'max:100'],
            'activo' => ['required', 'boolean'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);
    }
}
