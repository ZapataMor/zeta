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
import clientes from '@/routes/clientes';
import type { Cliente } from '@/types';

const ESTADO_LABEL: Record<string, string> = {
    prospecto: 'Prospecto',
    en_conversacion: 'En conversación',
    activo: 'Activo',
    inactivo: 'Inactivo',
};

export default function ClientesIndex({ clientes: lista }: { clientes: Cliente[] }) {
    const eliminar = (c: Cliente) => {
        if (confirm(`¿Eliminar al cliente "${c.nombre}"?`)) {
            router.delete(clientes.destroy(c.id).url, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Clientes" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between gap-4">
                    <Heading title="Clientes" description="Gestiona los clientes de la empresa" />
                    <Button asChild>
                        <Link href={clientes.create()}>
                            <Plus className="size-4" /> Nuevo cliente
                        </Link>
                    </Button>
                </div>

                {lista.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
                        Aún no hay clientes. Crea el primero con “Nuevo cliente”.
                    </div>
                ) : (
                    <div className="rounded-xl border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Empresa</TableHead>
                                    <TableHead>Contacto</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Proyectos</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lista.map((c) => (
                                    <TableRow key={c.id}>
                                        <TableCell className="font-medium">{c.nombre}</TableCell>
                                        <TableCell>{c.empresa ?? '—'}</TableCell>
                                        <TableCell>{c.email ?? c.telefono ?? '—'}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{ESTADO_LABEL[c.estado] ?? c.estado}</Badge>
                                        </TableCell>
                                        <TableCell>{c.proyectos_count ?? 0}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button asChild variant="ghost" size="icon" aria-label="Editar">
                                                    <Link href={clientes.edit(c.id)}>
                                                        <Pencil className="size-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" aria-label="Eliminar" onClick={() => eliminar(c)}>
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

ClientesIndex.layout = {
    breadcrumbs: [{ title: 'Clientes', href: clientes.index() }],
};
