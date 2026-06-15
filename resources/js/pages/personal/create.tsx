import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import PersonaForm from '@/pages/personal/persona-form';
import personal from '@/routes/personal';
import type { UserLite } from '@/types';

export default function PersonalCreate({ usuarios }: { usuarios: UserLite[] }) {
    return (
        <>
            <Head title="Nueva persona" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading title="Nueva persona" description="Agrega a alguien al personal" />
                <PersonaForm usuarios={usuarios} />
            </div>
        </>
    );
}

PersonalCreate.layout = {
    breadcrumbs: [
        { title: 'Personal', href: personal.index() },
        { title: 'Nueva', href: personal.create() },
    ],
};
