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
import { Textarea } from '@/components/ui/textarea';
import proyectos from '@/routes/proyectos';
import type { ClienteLite, PersonaLite, Proyecto } from '@/types';

const ESTADOS = [
    { value: 'en_definicion', label: 'En definición' },
    { value: 'en_progreso', label: 'En progreso' },
    { value: 'pausado', label: 'Pausado' },
    { value: 'entregado', label: 'Entregado' },
];

type Props = {
    proyecto?: Proyecto;
    clientes: ClienteLite[];
    personas: PersonaLite[];
    participantesIniciales?: number[];
};

export default function ProyectoForm({ proyecto, clientes, personas, participantesIniciales }: Props) {
    const form = useForm({
        nombre: proyecto?.nombre ?? '',
        descripcion: proyecto?.descripcion ?? '',
        cliente_id: proyecto?.cliente_id ? String(proyecto.cliente_id) : 'none',
        product_owner_id: proyecto?.product_owner_id ? String(proyecto.product_owner_id) : 'none',
        estado: proyecto?.estado ?? 'en_definicion',
        github_repo: proyecto?.github_repo ?? '',
        fecha_inicio: proyecto?.fecha_inicio ? proyecto.fecha_inicio.slice(0, 10) : '',
        fecha_fin: proyecto?.fecha_fin ? proyecto.fecha_fin.slice(0, 10) : '',
        participantes: participantesIniciales ?? [],
    });
    const { data, setData, processing, errors } = form;

    const toggleParticipante = (id: number) => {
        setData(
            'participantes',
            data.participantes.includes(id)
                ? data.participantes.filter((p) => p !== id)
                : [...data.participantes, id],
        );
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.transform((d) => ({
            ...d,
            cliente_id: d.cliente_id === 'none' ? null : Number(d.cliente_id),
            product_owner_id: d.product_owner_id === 'none' ? null : Number(d.product_owner_id),
        }));
        if (proyecto) {
            form.put(proyectos.update(proyecto.id).url, { preserveScroll: true });
        } else {
            form.post(proyectos.store().url);
        }
    };

    return (
        <form onSubmit={submit} className="max-w-3xl space-y-6">
            <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre del proyecto *</Label>
                <Input id="nombre" value={data.nombre} onChange={(e) => setData('nombre', e.target.value)} required autoFocus />
                <InputError message={errors.nombre} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea id="descripcion" value={data.descripcion} onChange={(e) => setData('descripcion', e.target.value)} rows={3} />
                <InputError message={errors.descripcion} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="cliente_id">Cliente</Label>
                    <Select value={data.cliente_id} onValueChange={(v) => setData('cliente_id', v)}>
                        <SelectTrigger id="cliente_id" className="w-full">
                            <SelectValue placeholder="Sin cliente" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Sin cliente</SelectItem>
                            {clientes.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {c.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.cliente_id} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="product_owner_id">Product Owner</Label>
                    <Select value={data.product_owner_id} onValueChange={(v) => setData('product_owner_id', v)}>
                        <SelectTrigger id="product_owner_id" className="w-full">
                            <SelectValue placeholder="Sin asignar" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Sin asignar</SelectItem>
                            {personas.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)}>
                                    {p.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.product_owner_id} />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
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
                <div className="grid gap-2">
                    <Label htmlFor="fecha_inicio">Fecha de inicio</Label>
                    <Input id="fecha_inicio" type="date" value={data.fecha_inicio} onChange={(e) => setData('fecha_inicio', e.target.value)} />
                    <InputError message={errors.fecha_inicio} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="fecha_fin">Fecha de fin</Label>
                    <Input id="fecha_fin" type="date" value={data.fecha_fin} onChange={(e) => setData('fecha_fin', e.target.value)} />
                    <InputError message={errors.fecha_fin} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="github_repo">Repositorio de GitHub</Label>
                <Input
                    id="github_repo"
                    value={data.github_repo}
                    onChange={(e) => setData('github_repo', e.target.value)}
                    placeholder="https://github.com/usuario/repo (para la futura integración)"
                />
                <InputError message={errors.github_repo} />
            </div>

            <div className="grid gap-2">
                <Label>Participantes</Label>
                {personas.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No hay personal registrado todavía. Agrega personas en el módulo de Personal.
                    </p>
                ) : (
                    <div className="grid gap-2 rounded-lg border p-3 sm:grid-cols-2">
                        {personas.map((p) => (
                            <label key={p.id} className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={data.participantes.includes(p.id)}
                                    onCheckedChange={() => toggleParticipante(p.id)}
                                />
                                <span>
                                    {p.nombre}
                                    {p.cargo ? <span className="text-muted-foreground"> · {p.cargo}</span> : null}
                                </span>
                            </label>
                        ))}
                    </div>
                )}
                <InputError message={errors.participantes} />
            </div>

            <div className="flex gap-2">
                <Button type="submit" disabled={processing}>
                    {proyecto ? 'Guardar cambios' : 'Crear proyecto'}
                </Button>
            </div>
        </form>
    );
}
