import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCOP } from '@/lib/utils';
import finanzas from '@/routes/finanzas';
import movimientos from '@/routes/movimientos';
import type { Movimiento } from '@/types';

const fecha = (iso: string) =>
    new Date(iso).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

const TIPO_LABEL = (m: Movimiento) => {
    if (m.tipo === 'ingreso') {
        return 'Ingreso';
    }

    if (m.tipo === 'gasto') {
        return 'Gasto';
    }

    return m.direccion === 'recibido'
        ? 'Préstamo recibido'
        : 'Préstamo otorgado';
};

// ¿Entra dinero? ingreso y préstamo recibido suman.
const entra = (m: Movimiento) =>
    m.tipo === 'ingreso' ||
    (m.tipo === 'prestamo' && m.direccion === 'recibido');

export default function MovimientosIndex({
    movimientos: lista,
}: {
    movimientos: Movimiento[];
}) {
    const eliminar = (m: Movimiento) => {
        if (confirm(`¿Eliminar el movimiento "${m.concepto}"?`)) {
            router.delete(movimientos.destroy(m.id).url, {
                preserveScroll: true,
            });
        }
    };

    const alternarEstado = (m: Movimiento) => {
        const estado = m.estado === 'realizado' ? 'pendiente' : 'realizado';
        router.patch(
            movimientos.estado(m.id).url,
            { estado },
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Movimientos" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between gap-4">
                    <Heading
                        title="Movimientos"
                        description="Ingresos, gastos y préstamos puntuales con fecha y estado"
                    />
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={finanzas.index()}>
                                <ArrowLeft className="size-4" /> Finanzas
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={movimientos.create()}>
                                <Plus className="size-4" /> Nuevo movimiento
                            </Link>
                        </Button>
                    </div>
                </div>

                {lista.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
                        Aún no hay movimientos. Registra el primero con “Nuevo
                        movimiento”.
                    </div>
                ) : (
                    <div className="rounded-xl border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-28">
                                        Realizado
                                    </TableHead>
                                    <TableHead>Concepto</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead className="text-right">
                                        Monto
                                    </TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead className="text-right">
                                        Acciones
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lista.map((m) => (
                                    <TableRow key={m.id}>
                                        <TableCell>
                                            <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Checkbox
                                                    checked={
                                                        m.estado === 'realizado'
                                                    }
                                                    onCheckedChange={() =>
                                                        alternarEstado(m)
                                                    }
                                                    aria-label="Marcar como realizado"
                                                />
                                                {m.estado === 'realizado'
                                                    ? 'Sí'
                                                    : 'Pendiente'}
                                            </label>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {m.concepto}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    entra(m)
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {TIPO_LABEL(m)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell
                                            className={`text-right tabular-nums ${entra(m) ? 'text-emerald-600' : 'text-destructive'}`}
                                        >
                                            {entra(m) ? '+' : '−'}
                                            {formatCOP(m.monto)}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {fecha(m.fecha)}
                                            {m.fecha_vencimiento ? (
                                                <span className="block text-xs">
                                                    vence{' '}
                                                    {fecha(m.fecha_vencimiento)}
                                                </span>
                                            ) : null}
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
                                                        href={movimientos.edit(
                                                            m.id,
                                                        )}
                                                    >
                                                        <Pencil className="size-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label="Eliminar"
                                                    onClick={() => eliminar(m)}
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

MovimientosIndex.layout = {
    breadcrumbs: [
        { title: 'Finanzas', href: finanzas.index() },
        { title: 'Movimientos', href: movimientos.index() },
    ],
};
