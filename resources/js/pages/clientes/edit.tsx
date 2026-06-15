import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import ClienteForm from '@/pages/clientes/cliente-form';
import clientes from '@/routes/clientes';
import type { Cliente } from '@/types';

export default function ClientesEdit({ cliente }: { cliente: Cliente }) {
    return (
        <>
            <Head title={`Editar: ${cliente.nombre}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading title="Editar cliente" description={cliente.nombre} />
                <ClienteForm cliente={cliente} />
            </div>
        </>
    );
}

ClientesEdit.layout = {
    breadcrumbs: [
        { title: 'Clientes', href: clientes.index() },
        { title: 'Editar', href: clientes.index() },
    ],
};
