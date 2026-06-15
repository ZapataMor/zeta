import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import ClienteForm from '@/pages/clientes/cliente-form';
import clientes from '@/routes/clientes';

export default function ClientesCreate() {
    return (
        <>
            <Head title="Nuevo cliente" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading title="Nuevo cliente" description="Registra un nuevo cliente" />
                <ClienteForm />
            </div>
        </>
    );
}

ClientesCreate.layout = {
    breadcrumbs: [
        { title: 'Clientes', href: clientes.index() },
        { title: 'Nuevo', href: clientes.create() },
    ],
};
