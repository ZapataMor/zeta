import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import PersonaForm from '@/pages/personal/persona-form';
import personal from '@/routes/personal';
import type { Persona, UserLite } from '@/types';

export default function PersonalEdit({ persona, usuarios }: { persona: Persona; usuarios: UserLite[] }) {
    return (
        <>
            <Head title={`Editar: ${persona.nombre}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading title="Editar persona" description={persona.nombre} />
                <PersonaForm persona={persona} usuarios={usuarios} />
            </div>
        </>
    );
}

PersonalEdit.layout = {
    breadcrumbs: [
        { title: 'Personal', href: personal.index() },
        { title: 'Editar', href: personal.index() },
    ],
};
