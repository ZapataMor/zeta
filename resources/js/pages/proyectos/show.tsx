import { Head, Link, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { type FormEvent } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import proyectos from '@/routes/proyectos';
import tareas from '@/routes/tareas';
import type { PersonaLite, Proyecto, Tarea } from '@/types';

const ESTADO_PROYECTO: Record<string, string> = {
    en_definicion: 'En definición',
    en_progreso: 'En progreso',
    pausado: 'Pausado',
    entregado: 'Entregado',
};

const TIPOS = [
    { value: 'tarea', label: 'Tarea' },
    { value: 'requerimiento', label: 'Requerimiento' },
];

const PRIORIDADES = [
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
];

const ESTADOS_TAREA = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_progreso', label: 'En progreso' },
    { value: 'en_revision', label: 'En revisión' },
    { value: 'hecha', label: 'Hecha' },
];

function Dato({ titulo, children }: { titulo: string; children: React.ReactNode }) {
    return (
        <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">{titulo}</p>
            <div className="text-sm">{children}</div>
        </div>
    );
}

function NuevaTareaForm({ proyectoId, personas }: { proyectoId: number; personas: PersonaLite[] }) {
    const form = useForm({
        titulo: '',
        descripcion: '',
        tipo: 'tarea',
        estado: 'pendiente',
        prioridad: 'media',
        persona_id: 'none',
        fecha_limite: '',
    });
    const { data, setData, processing, errors, reset } = form;

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.transform((d) => ({
            ...d,
            persona_id: d.persona_id === 'none' ? null : Number(d.persona_id),
        }));
        form.post(tareas.store(proyectoId).url, {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <form onSubmit={submit} className="grid gap-3 rounded-xl border p-4">
            <p className="text-sm font-medium">Agregar tarea / requerimiento</p>
            <div className="grid gap-3 md:grid-cols-2">
                <div className="grid gap-1.5">
                    <Label htmlFor="titulo">Título *</Label>
                    <Input id="titulo" value={data.titulo} onChange={(e) => setData('titulo', e.target.value)} required />
                    <InputError message={errors.titulo} />
                </div>
                <div className="grid gap-1.5">
                    <Label htmlFor="t-asignado">Asignar a</Label>
                    <Select value={data.persona_id} onValueChange={(v) => setData('persona_id', v)}>
                        <SelectTrigger id="t-asignado" className="w-full">
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
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
                <div className="grid gap-1.5">
                    <Label htmlFor="t-tipo">Tipo</Label>
                    <Select value={data.tipo} onValueChange={(v) => setData('tipo', v)}>
                        <SelectTrigger id="t-tipo" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {TIPOS.map((t) => (
                                <SelectItem key={t.value} value={t.value}>
                                    {t.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-1.5">
                    <Label htmlFor="t-prioridad">Prioridad</Label>
                    <Select value={data.prioridad} onValueChange={(v) => setData('prioridad', v)}>
                        <SelectTrigger id="t-prioridad" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {PRIORIDADES.map((p) => (
                                <SelectItem key={p.value} value={p.value}>
                                    {p.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-1.5">
                    <Label htmlFor="t-estado">Estado</Label>
                    <Select value={data.estado} onValueChange={(v) => setData('estado', v)}>
                        <SelectTrigger id="t-estado" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {ESTADOS_TAREA.map((e) => (
                                <SelectItem key={e.value} value={e.value}>
                                    {e.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-1.5">
                    <Label htmlFor="t-fecha">Fecha límite</Label>
                    <Input id="t-fecha" type="date" value={data.fecha_limite} onChange={(e) => setData('fecha_limite', e.target.value)} />
                </div>
            </div>

            <div className="grid gap-1.5">
                <Label htmlFor="t-desc">Descripción</Label>
                <Textarea id="t-desc" value={data.descripcion} onChange={(e) => setData('descripcion', e.target.value)} rows={2} />
            </div>

            <div>
                <Button type="submit" size="sm" disabled={processing}>
                    <Plus className="size-4" /> Agregar
                </Button>
            </div>
        </form>
    );
}

export default function ProyectosShow({ proyecto, personas }: { proyecto: Proyecto; personas: PersonaLite[] }) {
    const listaTareas = proyecto.tareas ?? [];

    const cambiarTarea = (t: Tarea, cambios: Record<string, string | number | null>) => {
        router.patch(
            tareas.update(t.id).url,
            {
                titulo: t.titulo,
                descripcion: t.descripcion,
                tipo: t.tipo,
                estado: t.estado,
                prioridad: t.prioridad,
                persona_id: t.persona_id,
                fecha_limite: t.fecha_limite ? t.fecha_limite.slice(0, 10) : null,
                ...cambios,
            },
            { preserveScroll: true },
        );
    };

    const eliminarTarea = (t: Tarea) => {
        if (confirm(`¿Eliminar la tarea "${t.titulo}"?`)) {
            router.delete(tareas.destroy(t.id).url, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title={proyecto.nombre} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Heading title={proyecto.nombre} />
                        <Badge variant="secondary">{ESTADO_PROYECTO[proyecto.estado] ?? proyecto.estado}</Badge>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={proyectos.index()}>Volver</Link>
                        </Button>
                        <Button asChild>
                            <Link href={proyectos.edit(proyecto.id)}>
                                <Pencil className="size-4" /> Editar
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Información general */}
                <div className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Dato titulo="Cliente">{proyecto.cliente?.nombre ?? 'Interno'}</Dato>
                    <Dato titulo="Product Owner">{proyecto.product_owner?.nombre ?? 'Sin asignar'}</Dato>
                    <Dato titulo="Inicio">{proyecto.fecha_inicio ? proyecto.fecha_inicio.slice(0, 10) : '—'}</Dato>
                    <Dato titulo="Fin">{proyecto.fecha_fin ? proyecto.fecha_fin.slice(0, 10) : '—'}</Dato>
                    <Dato titulo="GitHub">
                        {proyecto.github_repo ? (
                            <a href={proyecto.github_repo} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                                {proyecto.github_repo}
                            </a>
                        ) : (
                            '— (pendiente para la futura integración)'
                        )}
                    </Dato>
                    <div className="sm:col-span-2 lg:col-span-4">
                        <Dato titulo="Descripción">{proyecto.descripcion || '—'}</Dato>
                    </div>
                </div>

                {/* Participantes */}
                <div className="space-y-2">
                    <h3 className="text-sm font-medium">Participantes</h3>
                    {proyecto.participantes && proyecto.participantes.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {proyecto.participantes.map((p) => (
                                <Badge key={p.id} variant="outline">
                                    {p.nombre}
                                    {p.cargo ? ` · ${p.cargo}` : ''}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Sin participantes. Asígnalos editando el proyecto.
                        </p>
                    )}
                </div>

                {/* Tareas */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium">Tareas y requerimientos</h3>

                    <NuevaTareaForm proyectoId={proyecto.id} personas={personas} />

                    {listaTareas.length === 0 ? (
                        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                            Aún no hay tareas. Agrega la primera arriba.
                        </div>
                    ) : (
                        <div className="rounded-xl border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Título</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Prioridad</TableHead>
                                        <TableHead>Asignado</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Límite</TableHead>
                                        <TableHead className="text-right">Acción</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {listaTareas.map((t) => (
                                        <TableRow key={t.id}>
                                            <TableCell className="font-medium">{t.titulo}</TableCell>
                                            <TableCell>
                                                <Badge variant={t.tipo === 'requerimiento' ? 'default' : 'secondary'}>
                                                    {t.tipo === 'requerimiento' ? 'Requerimiento' : 'Tarea'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="capitalize">{t.prioridad}</TableCell>
                                            <TableCell>
                                                <Select
                                                    value={t.persona_id ? String(t.persona_id) : 'none'}
                                                    onValueChange={(v) => cambiarTarea(t, { persona_id: v === 'none' ? null : Number(v) })}
                                                >
                                                    <SelectTrigger size="sm" className="w-40">
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
                                            </TableCell>
                                            <TableCell>
                                                <Select value={t.estado} onValueChange={(v) => cambiarTarea(t, { estado: v })}>
                                                    <SelectTrigger size="sm" className="w-36">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {ESTADOS_TAREA.map((e) => (
                                                            <SelectItem key={e.value} value={e.value}>
                                                                {e.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>{t.fecha_limite ? t.fecha_limite.slice(0, 10) : '—'}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" aria-label="Eliminar" onClick={() => eliminarTarea(t)}>
                                                    <Trash2 className="size-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

ProyectosShow.layout = {
    breadcrumbs: [{ title: 'Proyectos', href: proyectos.index() }],
};
