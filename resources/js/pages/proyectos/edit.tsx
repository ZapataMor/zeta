import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import ProyectoForm from '@/pages/proyectos/proyecto-form';
import proyectos from '@/routes/proyectos';
import type { ClienteLite, PersonaLite, Proyecto } from '@/types';

export default function ProyectosEdit({
    proyecto,
    clientes,
    personas,
    participantesActuales,
}: {
    proyecto: Proyecto;
    clientes: ClienteLite[];
    personas: PersonaLite[];
    participantesActuales: number[];
}) {
    return (
        <>
            <Head title={`Editar: ${proyecto.nombre}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading title="Editar proyecto" description={proyecto.nombre} />
                <ProyectoForm
                    proyecto={proyecto}
                    clientes={clientes}
                    personas={personas}
                    participantesIniciales={participantesActuales}
                />
            </div>
        </>
    );
}

ProyectosEdit.layout = {
    breadcrumbs: [
        { title: 'Proyectos', href: proyectos.index() },
        { title: 'Editar', href: proyectos.index() },
    ],
};
