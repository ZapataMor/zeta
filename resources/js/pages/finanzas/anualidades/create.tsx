import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import AnualidadForm from '@/pages/finanzas/anualidades/anualidad-form';
import anualidades from '@/routes/anualidades';
import finanzas from '@/routes/finanzas';

export default function AnualidadCreate() {
    return (
        <>
            <Head title="Nueva anualidad" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Nueva anualidad"
                    description="Una renta (suma) o suscripción (resta) que se repite entre dos fechas"
                />
                <AnualidadForm />
            </div>
        </>
    );
}

AnualidadCreate.layout = {
    breadcrumbs: [
        { title: 'Finanzas', href: finanzas.index() },
        { title: 'Anualidades', href: anualidades.index() },
        { title: 'Nueva', href: anualidades.create() },
    ],
};
