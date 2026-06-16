import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react';
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
import { formatCOP } from '@/lib/utils';
import anualidades from '@/routes/anualidades';
import finanzas from '@/routes/finanzas';
import type { Anualidad } from '@/types';

const PERIODICIDAD_LABEL: Record<string, string> = {
    mensual: 'Mensual',
    trimestral: 'Trimestral',
    semestral: 'Semestral',
    anual: 'Anual',
};

const fecha = (iso: string) =>
    new Date(iso).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

export default function AnualidadesIndex({
    anualidades: lista,
}: {
    anualidades: Anualidad[];
}) {
    const eliminar = (a: Anualidad) => {
        if (confirm(`¿Eliminar la anualidad "${a.nombre}"?`)) {
            router.delete(anualidades.destroy(a.id).url, {
                preserveScroll: true,
            });
        }
    };

    return (
        <>
            <Head title="Anualidades" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between gap-4">
                    <Heading
                        title="Anualidades"
                        description="Rentas (suman) y suscripciones (restan) recurrentes"
                    />
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={finanzas.index()}>
                                <ArrowLeft className="size-4" /> Finanzas
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={anualidades.create()}>
                                <Plus className="size-4" /> Nueva anualidad
                            </Link>
                        </Button>
                    </div>
                </div>

                {lista.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
                        Aún no hay anualidades. Crea una renta o suscripción con
                        “Nueva anualidad”.
                    </div>
                ) : (
                    <div className="rounded-xl border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead className="text-right">
                                        Monto
                                    </TableHead>
                                    <TableHead>Periodicidad</TableHead>
                                    <TableHead>Vigencia</TableHead>
                                    <TableHead className="text-right">
                                        Interés
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Acciones
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lista.map((a) => (
                                    <TableRow key={a.id}>
                                        <TableCell className="font-medium">
                                            {a.nombre}
                                            {a.renovar ? (
                                                <Badge
                                                    variant="outline"
                                                    className="ml-2 align-middle"
                                                >
                                                    Por renovar
                                                </Badge>
                                            ) : null}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    a.tipo === 'renta'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {a.tipo === 'renta'
                                                    ? 'Renta'
                                                    : 'Suscripción'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell
                                            className={`text-right tabular-nums ${a.tipo === 'renta' ? 'text-emerald-600' : 'text-destructive'}`}
                                        >
                                            {a.tipo === 'renta' ? '+' : '−'}
                                            {formatCOP(a.monto)}
                                        </TableCell>
                                        <TableCell>
                                            {PERIODICIDAD_LABEL[
                                                a.periodicidad
                                            ] ?? a.periodicidad}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {fecha(a.fecha_inicio)} →{' '}
                                            {a.fecha_fin
                                                ? fecha(a.fecha_fin)
                                                : 'Indefinida'}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {a.tasa_interes_anual
                                                ? `${Number(a.tasa_interes_anual)}%`
                                                : '—'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    asChild
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label="Editar"
                                                >
                                                    <Link
                                                        href={anualidades.edit(
                                                            a.id,
                                                        )}
                                                    >
                                                        <Pencil className="size-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label="Eliminar"
                                                    onClick={() => eliminar(a)}
                                                >
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

AnualidadesIndex.layout = {
    breadcrumbs: [
        { title: 'Finanzas', href: finanzas.index() },
        { title: 'Anualidades', href: anualidades.index() },
    ],
};
