import { useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import personal from '@/routes/personal';
import type { Persona, UserLite } from '@/types';

export default function PersonaForm({ persona, usuarios }: { persona?: Persona; usuarios: UserLite[] }) {
    const form = useForm({
        nombre: persona?.nombre ?? '',
        email: persona?.email ?? '',
        cargo: persona?.cargo ?? '',
        github_username: persona?.github_username ?? '',
        activo: persona?.activo ?? true,
        user_id: persona?.user_id ? String(persona.user_id) : 'none',
    });
    const { data, setData, processing, errors } = form;

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.transform((d) => ({
            ...d,
            user_id: d.user_id === 'none' ? null : Number(d.user_id),
        }));
        if (persona) {
            form.put(personal.update(persona.id).url, { preserveScroll: true });
        } else {
            form.post(personal.store().url);
        }
    };

    return (
        <form onSubmit={submit} className="max-w-2xl space-y-6">
            <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input id="nombre" value={data.nombre} onChange={(e) => setData('nombre', e.target.value)} required autoFocus />
                <InputError message={errors.nombre} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="cargo">Cargo</Label>
                    <Input id="cargo" value={data.cargo} onChange={(e) => setData('cargo', e.target.value)} placeholder="Ej: Desarrollo" />
                    <InputError message={errors.cargo} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                    <InputError message={errors.email} />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="github_username">Usuario de GitHub</Label>
                    <Input
                        id="github_username"
                        value={data.github_username}
                        onChange={(e) => setData('github_username', e.target.value)}
                        placeholder="para la futura integración"
                    />
                    <InputError message={errors.github_username} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="user_id">Cuenta de login (opcional)</Label>
                    <Select value={data.user_id} onValueChange={(v) => setData('user_id', v)}>
                        <SelectTrigger id="user_id" className="w-full">
                            <SelectValue placeholder="Sin cuenta" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Sin cuenta</SelectItem>
                            {usuarios.map((u) => (
                                <SelectItem key={u.id} value={String(u.id)}>
                                    {u.name} ({u.email})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.user_id} />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Checkbox id="activo" checked={data.activo} onCheckedChange={(v) => setData('activo', v === true)} />
                <Label htmlFor="activo">Activo</Label>
            </div>

            <div className="flex gap-2">
                <Button type="submit" disabled={processing}>
                    {persona ? 'Guardar cambios' : 'Agregar persona'}
                </Button>
            </div>
        </form>
    );
}
