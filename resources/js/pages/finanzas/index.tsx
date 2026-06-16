import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowDownCircle,
    ArrowUpCircle,
    CalendarRange,
    CreditCard,
    Plus,
    Receipt,
    RefreshCw,
    Wallet,
} from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
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
import { formatCOP } from '@/lib/utils';
import anualidades from '@/routes/anualidades';
import finanzas from '@/routes/finanzas';
import movimientos from '@/routes/movimientos';
import type {
    AnualidadPorRenovar,
    CuentaPendiente,
    FinanzaConfig,
    Proyeccion,
} from '@/types';

type Totales = {
    anualidades: number;
    rentas: number;
    suscripciones: number;
    movimientos: number;
};

type Props = {
    config: FinanzaConfig;
    horizonte: number;
    horizontes: number[];
    proyeccion: Proyeccion;
    cuentas_por_cobrar: CuentaPendiente[];
    cuentas_por_pagar: CuentaPendiente[];
    anualidades_por_renovar: AnualidadPorRenovar[];
    totales: Totales;
};

const compact = (n: number) =>
    new Intl.NumberFormat('es-CO', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(n);

const fechaCorta = (iso: string) =>
    new Date(iso).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

export default function FinanzasIndex({
    config,
    horizonte,
    horizontes,
    proyeccion,
    cuentas_por_cobrar,
    cuentas_por_pagar,
    anualidades_por_renovar,
    totales,
}: Props) {
    const { puntos, resumen } = proyeccion;

    const configForm = useForm({
        capital_inicial: config.capital_inicial ?? '0',
        fecha_base: config.fecha_base ? config.fecha_base.slice(0, 10) : '',
    });

    const guardarConfig = (e: FormEvent) => {
        e.preventDefault();
        configForm.put(finanzas.config.update().url, { preserveScroll: true });
    };

    const cambiarHorizonte = (valor: string) => {
        router.get(
            finanzas.index().url,
            { horizonte: Number(valor) },
            { preserveScroll: true, preserveState: true },
        );
    };

    const marcarRealizado = (cuenta: CuentaPendiente) => {
        router.patch(
            movimientos.estado(cuenta.id).url,
            { estado: 'realizado' },
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Finanzas" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Heading
                        title="Finanzas"
                        description="Proyección de capital de la empresa"
                    />
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline">
                            <Link href={anualidades.index()}>
                                <CreditCard className="size-4" /> Anualidades
                            </Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href={movimientos.index()}>
                                <Receipt className="size-4" /> Movimientos
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Kpi
                        titulo="Capital inicial"
                        valor={resumen.capital_inicial}
                    />
                    <Kpi
                        titulo="Capital proyectado"
                        valor={resumen.capital_final}
                        destacado
                    />
                    <Kpi
                        titulo="Ingresos del periodo"
                        valor={resumen.total_ingresos}
                        tono="positivo"
                    />
                    <Kpi
                        titulo="Egresos del periodo"
                        valor={resumen.total_egresos}
                        tono="negativo"
                    />
                </div>

                {/* Controles: horizonte + capital inicial */}
                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
                            <CardTitle className="flex items-center gap-2">
                                <Wallet className="size-4" /> Capital de partida
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={guardarConfig}
                                className="flex flex-wrap items-end gap-4"
                            >
                                <div className="grid gap-2">
                                    <Label htmlFor="capital_inicial">
                                        Capital inicial
                                    </Label>
                                    <Input
                                        id="capital_inicial"
                                        type="number"
                                        step="0.01"
                                        className="w-48"
                                        value={configForm.data.capital_inicial}
                                        onChange={(e) =>
                                            configForm.setData(
                                                'capital_inicial',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="fecha_base">
                                        Fecha base
                                    </Label>
                                    <Input
                                        id="fecha_base"
                                        type="date"
                                        className="w-44"
                                        value={configForm.data.fecha_base}
                                        onChange={(e) =>
                                            configForm.setData(
                                                'fecha_base',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={configForm.processing}
                                >
                                    Guardar
                                </Button>
                            </form>
                            <p className="mt-3 text-xs text-muted-foreground">
                                El capital inicial es el dinero disponible en la
                                fecha base. La proyección parte desde ahí; los
                                flujos anteriores se asumen ya incluidos en ese
                                capital.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarRange className="size-4" /> Horizonte
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Select
                                value={String(horizonte)}
                                onValueChange={cambiarHorizonte}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {horizontes.map((h) => (
                                        <SelectItem key={h} value={String(h)}>
                                            {h} meses ({Math.round(h / 12)}{' '}
                                            {h === 12 ? 'año' : 'años'})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground">
                                {totales.rentas} rentas ·{' '}
                                {totales.suscripciones} suscripciones ·{' '}
                                {totales.movimientos} movimientos
                            </p>
                            {resumen.interes_generado !== 0 && (
                                <p className="text-sm">
                                    Interés generado:{' '}
                                    <span className="font-medium tabular-nums">
                                        {formatCOP(resumen.interes_generado)}
                                    </span>
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {anualidades_por_renovar.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
                        <RefreshCw className="size-4 text-amber-600" />
                        <span className="font-medium">
                            Anualidades por renovar pronto:
                        </span>
                        {anualidades_por_renovar.map((a) => (
                            <Badge key={a.id} variant="outline">
                                {a.nombre} · vence {fechaCorta(a.fecha_fin)}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Cuentas por cobrar y por pagar */}
                <div className="grid gap-4 lg:grid-cols-2">
                    <CuentasCard
                        titulo="Cuentas por cobrar"
                        icono={
                            <ArrowUpCircle className="size-4 text-emerald-600" />
                        }
                        cuentas={cuentas_por_cobrar}
                        vacio="No tienes cuentas pendientes por cobrar."
                        onMarcar={marcarRealizado}
                    />
                    <CuentasCard
                        titulo="Cuentas por pagar"
                        icono={
                            <ArrowDownCircle className="size-4 text-destructive" />
                        }
                        cuentas={cuentas_por_pagar}
                        vacio="No tienes cuentas pendientes por pagar."
                        onMarcar={marcarRealizado}
                    />
                </div>

                {puntos.length === 0 ? null : (
                    <>
                        {/* Línea: capital en el tiempo */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Crecimiento del capital</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer height={320}>
                                    <LineChart
                                        data={puntos}
                                        margin={{
                                            top: 8,
                                            right: 16,
                                            bottom: 0,
                                            left: 8,
                                        }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="var(--border)"
                                            vertical={false}
                                        />
                                        <XAxis
                                            dataKey="etiqueta"
                                            tick={{ fontSize: 12 }}
                                            tickMargin={8}
                                            minTickGap={24}
                                            stroke="var(--muted-foreground)"
                                        />
                                        <YAxis
                                            tickFormatter={compact}
                                            tick={{ fontSize: 12 }}
                                            width={56}
                                            stroke="var(--muted-foreground)"
                                        />
                                        <Tooltip
                                            content={
                                                <ChartTooltip
                                                    formatter={formatCOP}
                                                />
                                            }
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="capital"
                                            name="Capital"
                                            stroke="var(--chart-1)"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        {/* Barras: ingresos vs egresos por mes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Ingresos vs egresos por mes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer height={300}>
                                    <BarChart
                                        data={puntos}
                                        margin={{
                                            top: 8,
                                            right: 16,
                                            bottom: 0,
                                            left: 8,
                                        }}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="var(--border)"
                                            vertical={false}
                                        />
                                        <XAxis
                                            dataKey="etiqueta"
                                            tick={{ fontSize: 12 }}
                                            tickMargin={8}
                                            minTickGap={24}
                                            stroke="var(--muted-foreground)"
                                        />
                                        <YAxis
                                            tickFormatter={compact}
                                            tick={{ fontSize: 12 }}
                                            width={56}
                                            stroke="var(--muted-foreground)"
                                        />
                                        <Tooltip
                                            content={
                                                <ChartTooltip
                                                    formatter={formatCOP}
                                                />
                                            }
                                            cursor={{
                                                fill: 'var(--muted)',
                                                opacity: 0.4,
                                            }}
                                        />
                                        <Bar
                                            dataKey="ingresos"
                                            name="Ingresos"
                                            fill="var(--chart-2)"
                                            radius={[4, 4, 0, 0]}
                                        />
                                        <Bar
                                            dataKey="egresos"
                                            name="Egresos"
                                            fill="var(--chart-4)"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </>
                )}

                {totales.anualidades === 0 && totales.movimientos === 0 && (
                    <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
                        <p>Aún no hay datos financieros para proyectar.</p>
                        <div className="mt-4 flex justify-center gap-2">
                            <Button asChild>
                                <Link href={anualidades.create()}>
                                    <Plus className="size-4" /> Crear anualidad
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href={movimientos.create()}>
                                    <Plus className="size-4" /> Registrar
                                    movimiento
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

function Kpi({
    titulo,
    valor,
    destacado,
    tono,
}: {
    titulo: string;
    valor: number;
    destacado?: boolean;
    tono?: 'positivo' | 'negativo';
}) {
    const color =
        tono === 'positivo'
            ? 'text-emerald-600'
            : tono === 'negativo'
              ? 'text-destructive'
              : '';

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {titulo}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p
                    className={`tabular-nums ${destacado ? 'text-2xl font-semibold' : 'text-xl font-semibold'} ${color}`}
                >
                    {formatCOP(valor)}
                </p>
            </CardContent>
        </Card>
    );
}

function CuentasCard({
    titulo,
    icono,
    cuentas,
    vacio,
    onMarcar,
}: {
    titulo: string;
    icono: ReactNode;
    cuentas: CuentaPendiente[];
    vacio: string;
    onMarcar: (cuenta: CuentaPendiente) => void;
}) {
    const total = cuentas.reduce((acc, c) => acc + c.monto, 0);

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
                <CardTitle className="flex items-center gap-2">
                    {icono} {titulo}
                </CardTitle>
                <span className="text-sm font-medium text-muted-foreground tabular-nums">
                    {formatCOP(total)}
                </span>
            </CardHeader>
            <CardContent>
                {cuentas.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                        {vacio}
                    </p>
                ) : (
                    <ul className="divide-y">
                        {cuentas.map((c) => (
                            <li
                                key={c.id}
                                className="flex items-center gap-3 py-2"
                            >
                                <Checkbox
                                    checked={false}
                                    onCheckedChange={() => onMarcar(c)}
                                    aria-label="Marcar como realizada"
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                        {c.concepto}
                                    </p>
                                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                                        {fechaCorta(c.fecha)}
                                        {c.vencida ? (
                                            <Badge
                                                variant="destructive"
                                                className="gap-1"
                                            >
                                                <AlertTriangle className="size-3" />{' '}
                                                Vencida
                                            </Badge>
                                        ) : c.proxima ? (
                                            <Badge variant="outline">
                                                Próxima ({c.dias}d)
                                            </Badge>
                                        ) : null}
                                    </p>
                                </div>
                                <span className="shrink-0 text-sm font-medium tabular-nums">
                                    {formatCOP(c.monto)}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}

FinanzasIndex.layout = {
    breadcrumbs: [{ title: 'Finanzas', href: finanzas.index() }],
};
