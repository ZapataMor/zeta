import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import AnualidadForm from '@/pages/finanzas/anualidades/anualidad-form';
import anualidades from '@/routes/anualidades';
import finanzas from '@/routes/finanzas';
import type { Anualidad } from '@/types';

export default function AnualidadEdit({ anualidad }: { anualidad: Anualidad }) {
    return (
        <>
            <Head title={`Editar ${anualidad.nombre}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Editar anualidad"
                    description={anualidad.nombre}
                />
                <AnualidadForm anualidad={anualidad} />
            </div>
        </>
    );
}

AnualidadEdit.layout = {
    breadcrumbs: [
        { title: 'Finanzas', href: finanzas.index() },
        { title: 'Anualidades', href: anualidades.index() },
        { title: 'Editar', href: anualidades.index() },
    ],
};
