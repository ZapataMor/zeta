<?php

namespace Database\Seeders;

use App\Models\Persona;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Contraseña temporal para los 3 administradores (cambiar al primer ingreso).
        $passwordTemporal = 'ZetaAdmin2026!';

        $equipo = [
            [
                'name' => 'Luis Felipe Zapata Pérez',
                'email' => 'lfelipezapata@uniguajira.edu.co',
                'cargo' => 'Fundador / Desarrollo',
            ],
            [
                'name' => 'Kevin Hafid Díaz García',
                'email' => 'khafiddiaz@uniguajira.edu.co',
                'cargo' => 'Desarrollo',
            ],
            [
                'name' => 'Daniel Andrés Sierra Torres',
                'email' => 'dandressierra@uniguajira.edu.co',
                'cargo' => 'Desarrollo',
            ],
        ];

        foreach ($equipo as $miembro) {
            $user = User::updateOrCreate(
                ['email' => $miembro['email']],
                ['name' => $miembro['name'], 'password' => Hash::make($passwordTemporal)],
            );

            $user->forceFill([
                'is_admin' => true,
                'email_verified_at' => now(),
            ])->save();

            // Cada admin también queda registrado como "persona" del personal.
            Persona::updateOrCreate(
                ['email' => $miembro['email']],
                [
                    'nombre' => $miembro['name'],
                    'cargo' => $miembro['cargo'],
                    'activo' => true,
                    'user_id' => $user->id,
                ],
            );
        }
    }
}
