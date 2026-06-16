import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import movimientos from '@/routes/movimientos';
import type { Movimiento } from '@/types';

const TIPOS = [
    { value: 'ingreso', label: 'Ingreso (entra dinero)' },
    { value: 'gasto', label: 'Gasto (sale dinero)' },
    { value: 'prestamo', label: 'Préstamo' },
];

const DIRECCIONES = [
    {
        value: 'otorgado',
        label: 'Otorgado — la empresa presta (cuenta por cobrar)',
    },
    {
        value: 'recibido',
        label: 'Recibido — la empresa pide prestado (cuenta por pagar)',
    },
];

const ESTADOS = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'realizado', label: 'Realizado' },
];

export default function MovimientoForm({
    movimiento,
}: {
    movimiento?: Movimiento;
}) {
    const form = useForm({
        concepto: movimiento?.concepto ?? '',
        tipo: movimiento?.tipo ?? 'ingreso',
        direccion: movimiento?.direccion ?? 'otorgado',
        monto: movimiento?.monto ?? '',
        tasa_interes_anual: movimiento?.tasa_interes_anual ?? '',
        fecha: movimiento?.fecha
            ? movimiento.fecha.slice(0, 10)
            : new Date().toISOString().slice(0, 10),
        fecha_vencimiento: movimiento?.fecha_vencimiento
            ? movimiento.fecha_vencimiento.slice(0, 10)
            : '',
        estado: movimiento?.estado ?? 'pendiente',
        notas: movimiento?.notas ?? '',
    });
    const { data, setData, processing, errors } = form;
    const esPrestamo = data.tipo === 'prestamo';

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.transform((d) => ({
            ...d,
            tasa_interes_anual:
                esPrestamo && d.tasa_interes_anual !== ''
                    ? d.tasa_interes_anual
                    : null,
        }));

        if (movimiento) {
            form.put(movimientos.update(movimiento.id).url, {
                preserveScroll: true,
            });
        } else {
            form.post(movimientos.store().url);
        }
    };

    return (
        <form onSubmit={submit} className="max-w-3xl space-y-6">
            <div className="grid gap-2">
                <Label htmlFor="concepto">Concepto *</Label>
                <Input
                    id="concepto"
                    value={data.concepto}
                    onChange={(e) => setData('concepto', e.target.value)}
                    placeholder="Ej: Anticipo proyecto / Compra de equipo / Préstamo a socio"
                    required
                    autoFocus
                />
                <InputError message={errors.concepto} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select
                        value={data.tipo}
                        onValueChange={(v) =>
                            setData('tipo', v as Movimiento['tipo'])
                        }
                    >
                        <SelectTrigger id="tipo" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {TIPOS.map((t) => (
                                <SelectItem key={t.value} value={t.value}>
                                    {t.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.tipo} />
                </div>
                {esPrestamo && (
                    <div className="grid gap-2">
                        <Label htmlFor="direccion">
                            Dirección del préstamo *
                        </Label>
                        <Select
                            value={data.direccion}
                            onValueChange={(v) =>
                                setData(
                                    'direccion',
                                    v as NonNullable<Movimiento['direccion']>,
                                )
                            }
                        >
                            <SelectTrigger id="direccion" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {DIRECCIONES.map((d) => (
                                    <SelectItem key={d.value} value={d.value}>
                                        {d.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.direccion} />
                    </div>
                )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                    <Label htmlFor="monto">
                        {esPrestamo ? 'Capital *' : 'Monto *'}
                    </Label>
                    <Input
                        id="monto"
                        type="number"
                        min="0"
                        step="0.01"
                        value={data.monto}
                        onChange={(e) => setData('monto', e.target.value)}
                        required
                    />
                    <InputError message={errors.monto} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="fecha">
                        {esPrestamo ? 'Fecha de desembolso *' : 'Fecha *'}
                    </Label>
                    <Input
                        id="fecha"
                        type="date"
                        value={data.fecha}
                        onChange={(e) => setData('fecha', e.target.value)}
                        required
                    />
                    {!esPrestamo && (
                        <p className="text-xs text-muted-foreground">
                            Puede ser pasada, actual o futura.
                        </p>
                    )}
                    <InputError message={errors.fecha} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="estado">Estado *</Label>
                    <Select
                        value={data.estado}
                        onValueChange={(v) =>
                            setData('estado', v as Movimiento['estado'])
                        }
                    >
                        <SelectTrigger id="estado" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {ESTADOS.map((e) => (
                                <SelectItem key={e.value} value={e.value}>
                                    {e.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        Pendiente = cuenta por cobrar/pagar.
                    </p>
                    <InputError message={errors.estado} />
                </div>
            </div>

            {esPrestamo && (
                <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="fecha_vencimiento">
                            Fecha de vencimiento *
                        </Label>
                        <Input
                            id="fecha_vencimiento"
                            type="date"
                            value={data.fecha_vencimiento}
                            onChange={(e) =>
                                setData('fecha_vencimiento', e.target.value)
                            }
                            required={esPrestamo}
                        />
                        <p className="text-xs text-muted-foreground">
                            Cuándo se cobra/paga la devolución.
                        </p>
                        <InputError message={errors.fecha_vencimiento} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="tasa_interes_anual">
                            Tasa de interés anual (%)
                        </Label>
                        <Input
                            id="tasa_interes_anual"
                            type="number"
                            min="0"
                            step="0.001"
                            value={data.tasa_interes_anual ?? ''}
                            onChange={(e) =>
                                setData('tasa_interes_anual', e.target.value)
                            }
                            placeholder="Opcional"
                        />
                        <p className="text-xs text-muted-foreground">
                            Interés simple sobre el capital hasta el
                            vencimiento.
                        </p>
                        <InputError message={errors.tasa_interes_anual} />
                    </div>
                </div>
            )}

            <div className="grid gap-2">
                <Label htmlFor="notas">Notas</Label>
                <Textarea
                    id="notas"
                    value={data.notas}
                    onChange={(e) => setData('notas', e.target.value)}
                    rows={2}
                />
                <InputError message={errors.notas} />
            </div>

            <div className="flex gap-2">
                <Button type="submit" disabled={processing}>
                    {movimiento ? 'Guardar cambios' : 'Registrar movimiento'}
                </Button>
            </div>
        </form>
    );
}
