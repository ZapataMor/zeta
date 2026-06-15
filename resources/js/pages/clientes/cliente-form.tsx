import { useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import clientes from '@/routes/clientes';
import type { Cliente } from '@/types';

const ESTADOS = [
    { value: 'prospecto', label: 'Prospecto' },
    { value: 'en_conversacion', label: 'En conversación' },
    { value: 'activo', label: 'Cliente activo' },
    { value: 'inactivo', label: 'Inactivo' },
];

export default function ClienteForm({ cliente }: { cliente?: Cliente }) {
    const { data, setData, post, put, processing, errors } = useForm({
        nombre: cliente?.nombre ?? '',
        empresa: cliente?.empresa ?? '',
        email: cliente?.email ?? '',
        telefono: cliente?.telefono ?? '',
        estado: cliente?.estado ?? 'prospecto',
        notas: cliente?.notas ?? '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (cliente) {
            put(clientes.update(cliente.id).url, { preserveScroll: true });
        } else {
            post(clientes.store().url);
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
                    <Label htmlFor="empresa">Empresa</Label>
                    <Input id="empresa" value={data.empresa} onChange={(e) => setData('empresa', e.target.value)} />
                    <InputError message={errors.empresa} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select value={data.estado} onValueChange={(v) => setData('estado', v)}>
                        <SelectTrigger id="estado" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {ESTADOS.map((e) => (
                                <SelectItem key={e.value} value={e.value}>
                                    {e.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.estado} />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                    <InputError message={errors.email} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input id="telefono" value={data.telefono} onChange={(e) => setData('telefono', e.target.value)} />
                    <InputError message={errors.telefono} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="notas">Notas</Label>
                <Textarea id="notas" value={data.notas} onChange={(e) => setData('notas', e.target.value)} rows={4} />
                <InputError message={errors.notas} />
            </div>

            <div className="flex gap-2">
                <Button type="submit" disabled={processing}>
                    {cliente ? 'Guardar cambios' : 'Crear cliente'}
                </Button>
            </div>
        </form>
    );
}
