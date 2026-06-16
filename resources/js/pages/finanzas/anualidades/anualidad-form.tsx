import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import anualidades from '@/routes/anualidades';
import type { Anualidad } from '@/types';

const TIPOS = [
    { value: 'renta', label: 'Renta (ingreso recurrente, suma)' },
    { value: 'suscripcion', label: 'Suscripción (egreso recurrente, resta)' },
];

const PERIODICIDADES = [
    { value: 'mensual', label: 'Mensual' },
    { value: 'trimestral', label: 'Trimestral' },
    { value: 'semestral', label: 'Semestral' },
    { value: 'anual', label: 'Anual' },
];

const FIN_TIPOS = [
    { value: 'fecha', label: 'Hasta una fecha' },
    { value: 'meses', label: 'Por N meses' },
    { value: 'indefinida', label: 'Indefinida' },
];

export default function AnualidadForm({
    anualidad,
}: {
    anualidad?: Anualidad;
}) {
    const form = useForm({
        nombre: anualidad?.nombre ?? '',
        tipo: anualidad?.tipo ?? 'renta',
        monto: anualidad?.monto ?? '',
        periodicidad: anualidad?.periodicidad ?? 'mensual',
        fecha_inicio: anualidad?.fecha_inicio
            ? anualidad.fecha_inicio.slice(0, 10)
            : '',
        fin_tipo: anualidad?.fin_tipo ?? 'fecha',
        duracion_meses: anualidad?.duracion_meses
            ? String(anualidad.duracion_meses)
            : '',
        fecha_fin: anualidad?.fecha_fin ? anualidad.fecha_fin.slice(0, 10) : '',
        tasa_interes_anual: anualidad?.tasa_interes_anual ?? '',
        renovar: anualidad?.renovar ?? false,
        notas: anualidad?.notas ?? '',
    });
    const { data, setData, processing, errors } = form;

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.transform((d) => ({
            ...d,
            tasa_interes_anual:
                d.tasa_interes_anual === '' ? null : d.tasa_interes_anual,
            fecha_fin: d.fin_tipo === 'fecha' ? d.fecha_fin : null,
            duracion_meses: d.fin_tipo === 'meses' ? d.duracion_meses : null,
        }));

        if (anualidad) {
            form.put(anualidades.update(anualidad.id).url, {
                preserveScroll: true,
            });
        } else {
            form.post(anualidades.store().url);
        }
    };

    return (
        <form onSubmit={submit} className="max-w-3xl space-y-6">
            <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                    id="nombre"
                    value={data.nombre}
                    onChange={(e) => setData('nombre', e.target.value)}
                    placeholder="Ej: Mantenimiento mensual Cliente X / Licencia GitHub"
                    required
                    autoFocus
                />
                <InputError message={errors.nombre} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select
                        value={data.tipo}
                        onValueChange={(v) =>
                            setData('tipo', v as Anualidad['tipo'])
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
                <div className="grid gap-2">
                    <Label htmlFor="monto">Monto por periodo *</Label>
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
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                    <Label htmlFor="periodicidad">Periodicidad *</Label>
                    <Select
                        value={data.periodicidad}
                        onValueChange={(v) =>
                            setData(
                                'periodicidad',
                                v as Anualidad['periodicidad'],
                            )
                        }
                    >
                        <SelectTrigger id="periodicidad" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {PERIODICIDADES.map((p) => (
                                <SelectItem key={p.value} value={p.value}>
                                    {p.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.periodicidad} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="fecha_inicio">Fecha de inicio *</Label>
                    <Input
                        id="fecha_inicio"
                        type="date"
                        value={data.fecha_inicio}
                        onChange={(e) =>
                            setData('fecha_inicio', e.target.value)
                        }
                        required
                    />
                    <InputError message={errors.fecha_inicio} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="fin_tipo">Finalización *</Label>
                    <Select
                        value={data.fin_tipo}
                        onValueChange={(v) =>
                            setData('fin_tipo', v as Anualidad['fin_tipo'])
                        }
                    >
                        <SelectTrigger id="fin_tipo" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {FIN_TIPOS.map((f) => (
                                <SelectItem key={f.value} value={f.value}>
                                    {f.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.fin_tipo} />
                </div>
            </div>

            {data.fin_tipo === 'fecha' && (
                <div className="grid max-w-xs gap-2">
                    <Label htmlFor="fecha_fin">Fecha de fin *</Label>
                    <Input
                        id="fecha_fin"
                        type="date"
                        value={data.fecha_fin ?? ''}
                        onChange={(e) => setData('fecha_fin', e.target.value)}
                        required
                    />
                    <InputError message={errors.fecha_fin} />
                </div>
            )}

            {data.fin_tipo === 'meses' && (
                <div className="grid max-w-xs gap-2">
                    <Label htmlFor="duracion_meses">
                        Duración (número de meses) *
                    </Label>
                    <Input
                        id="duracion_meses"
                        type="number"
                        min="1"
                        step="1"
                        value={data.duracion_meses}
                        onChange={(e) =>
                            setData('duracion_meses', e.target.value)
                        }
                        required
                    />
                    <InputError message={errors.duracion_meses} />
                </div>
            )}

            {data.fin_tipo === 'indefinida' && (
                <p className="text-xs text-muted-foreground">
                    La anualidad se proyectará durante todo el horizonte
                    seleccionado, sin fecha de fin.
                </p>
            )}

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
                    placeholder="Opcional — déjalo vacío si no genera interés"
                />
                <p className="text-xs text-muted-foreground">
                    Si la indicas, los aportes se acumulan en un fondo que
                    capitaliza con interés compuesto mensual (valor futuro).
                    Útil para fondos destinados a préstamos futuros.
                </p>
                <InputError message={errors.tasa_interes_anual} />
            </div>

            <label className="flex items-center gap-2 text-sm">
                <Checkbox
                    checked={data.renovar}
                    onCheckedChange={(v) => setData('renovar', v === true)}
                />
                <span>
                    ¿Deberá renovarse?
                    <span className="text-muted-foreground">
                        {' '}
                        · te avisaremos cuando esté próxima a vencer
                    </span>
                </span>
            </label>

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
                    {anualidad ? 'Guardar cambios' : 'Crear anualidad'}
                </Button>
            </div>
        </form>
    );
}
