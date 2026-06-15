import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import ProyectoForm from '@/pages/proyectos/proyecto-form';
import proyectos from '@/routes/proyectos';
import type { ClienteLite, PersonaLite } from '@/types';

export default function ProyectosCreate({ clientes, personas }: { clientes: ClienteLite[]; personas: PersonaLite[] }) {
    return (
        <>
            <Head title="Nuevo proyecto" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading title="Nuevo proyecto" description="Crea un proyecto y asigna su equipo" />
                <ProyectoForm clientes={clientes} personas={personas} />
            </div>
        </>
    );
}

ProyectosCreate.layout = {
    breadcrumbs: [
        { title: 'Proyectos', href: proyectos.index() },
        { title: 'Nuevo', href: proyectos.create() },
    ],
};
