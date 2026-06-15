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
import personal from '@/routes/personal';
import type { Persona } from '@/types';

export default function PersonalIndex({ personas }: { personas: Persona[] }) {
    const eliminar = (p: Persona) => {
        if (confirm(`¿Eliminar a "${p.nombre}" del personal?`)) {
            router.delete(personal.destroy(p.id).url, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Personal" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between gap-4">
                    <Heading title="Personal" description="Equipo y colaboradores" />
                    <Button asChild>
                        <Link href={personal.create()}>
                            <Plus className="size-4" /> Nueva persona
                        </Link>
                    </Button>
                </div>

                {personas.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
                        Aún no hay personal registrado.
                    </div>
                ) : (
                    <div className="rounded-xl border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Cargo</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>GitHub</TableHead>
                                    <TableHead>Cuenta</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {personas.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-medium">{p.nombre}</TableCell>
                                        <TableCell>{p.cargo ?? '—'}</TableCell>
                                        <TableCell>{p.email ?? '—'}</TableCell>
                                        <TableCell>{p.github_username ? `@${p.github_username}` : '—'}</TableCell>
                                        <TableCell>{p.user ? p.user.name : '—'}</TableCell>
                                        <TableCell>
                                            {p.activo ? (
                                                <Badge variant="secondary">Activo</Badge>
                                            ) : (
                                                <Badge variant="outline">Inactivo</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button asChild variant="ghost" size="icon" aria-label="Editar">
                                                    <Link href={personal.edit(p.id)}>
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

PersonalIndex.layout = {
    breadcrumbs: [{ title: 'Personal', href: personal.index() }],
};
