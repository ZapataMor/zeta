import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import proyectos from '@/routes/proyectos';
import type { Proyecto } from '@/types';

const ESTADO_LABEL: Record<string, string> = {
    en_definicion: 'En definición',
    en_progreso: 'En progreso',
    pausado: 'Pausado',
    entregado: 'Entregado',
};

export default function ProyectosIndex({ proyectos: lista }: { proyectos: Proyecto[] }) {
    const eliminar = (p: Proyecto) => {
        if (confirm(`¿Eliminar el proyecto "${p.nombre}"? Se borrarán también sus tareas.`)) {
            router.delete(proyectos.destroy(p.id).url, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Proyectos" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between gap-4">
                    <Heading title="Proyectos" description="Gestiona los proyectos de la empresa" />
                    <Button asChild>
                        <Link href={proyectos.create()}>
                            <Plus className="size-4" /> Nuevo proyecto
                        </Link>
                    </Button>
                </div>

                {lista.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
                        Aún no hay proyectos. Crea el primero con “Nuevo proyecto”.
                    </div>
                ) : (
                    <div className="rounded-xl border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Proyecto</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Product Owner</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Tareas</TableHead>
                                    <TableHead>Equipo</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lista.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-medium">
                                            <Link href={proyectos.show(p.id)} className="hover:underline">
                                                {p.nombre}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{p.cliente?.nombre ?? 'Interno'}</TableCell>
                                        <TableCell>{p.product_owner?.nombre ?? '—'}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{ESTADO_LABEL[p.estado] ?? p.estado}</Badge>
                                        </TableCell>
                                        <TableCell>{p.tareas_count ?? 0}</TableCell>
                                        <TableCell>{p.participantes_count ?? 0}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button asChild variant="ghost" size="icon" aria-label="Editar">
                                                    <Link href={proyectos.edit(p.id)}>
                                                        <Pencil className="size-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" aria-label="Eliminar" onClick={() => eliminar(p)}>
                                                    <Trash2 className="size-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </>
    );
}

ProyectosIndex.layout = {
    breadcrumbs: [{ title: 'Proyectos', href: proyectos.index() }],
};
