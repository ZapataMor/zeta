import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import MovimientoForm from '@/pages/finanzas/movimientos/movimiento-form';
import finanzas from '@/routes/finanzas';
import movimientos from '@/routes/movimientos';
import type { Movimiento } from '@/types';

export default function MovimientoEdit({
    movimiento,
}: {
    movimiento: Movimiento;
}) {
    return (
        <>
            <Head title={`Editar ${movimiento.concepto}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Editar movimiento"
                    description={movimiento.concepto}
                />
                <MovimientoForm movimiento={movimiento} />
            </div>
        </>
    );
}

MovimientoEdit.layout = {
    breadcrumbs: [
        { title: 'Finanzas', href: finanzas.index() },
        { title: 'Movimientos', href: movimientos.index() },
        { title: 'Editar', href: movimientos.index() },
    ],
};
