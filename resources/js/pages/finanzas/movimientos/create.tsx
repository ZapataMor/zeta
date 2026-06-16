import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import MovimientoForm from '@/pages/finanzas/movimientos/movimiento-form';
import finanzas from '@/routes/finanzas';
import movimientos from '@/routes/movimientos';

export default function MovimientoCreate() {
    return (
        <>
            <Head title="Nuevo movimiento" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Nuevo movimiento"
                    description="Un ingreso o gasto puntual con fecha (pasada, actual o futura)"
                />
                <MovimientoForm />
            </div>
        </>
    );
}

MovimientoCreate.layout = {
    breadcrumbs: [
        { title: 'Finanzas', href: finanzas.index() },
        { title: 'Movimientos', href: movimientos.index() },
        { title: 'Nuevo', href: movimientos.create() },
    ],
};
