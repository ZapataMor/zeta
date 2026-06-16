import type { ReactElement, ReactNode } from 'react';
import { ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

/**
 * Contenedor ligero para gráficas de Recharts: fija una altura responsiva y
 * provee el ResponsiveContainer. Los colores se toman de las variables de tema
 * `--chart-1..5` ya definidas en app.css (ej: stroke="var(--chart-1)").
 */
export function ChartContainer({
    children,
    className,
    height = 320,
}: {
    children: ReactNode;
    className?: string;
    height?: number;
}) {
    return (
        <div className={cn('w-full', className)} style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                {children as ReactElement}
            </ResponsiveContainer>
        </div>
    );
}

type TooltipEntry = {
    name?: string;
    value?: number | string;
    color?: string;
    dataKey?: string | number;
};

/**
 * Tooltip estilizado y reutilizable. Recibe un formateador para los valores
 * (por defecto, identidad) y muestra cada serie con su color.
 */
export function ChartTooltip({
    active,
    payload,
    label,
    formatter,
}: {
    active?: boolean;
    payload?: TooltipEntry[];
    label?: string;
    formatter?: (value: number) => string;
}) {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const fmt = formatter ?? ((v: number) => String(v));

    return (
        <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
            {label ? <div className="mb-1 font-medium text-popover-foreground">{label}</div> : null}
            <div className="grid gap-1">
                {payload.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-2 text-muted-foreground">
                            <span
                                className="inline-block size-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            {entry.name}
                        </span>
                        <span className="font-medium tabular-nums text-popover-foreground">
                            {fmt(Number(entry.value ?? 0))}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
