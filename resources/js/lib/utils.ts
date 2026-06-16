import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

const cop = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
});

/** Formatea un valor numérico (o string decimal) como pesos colombianos. */
export function formatCOP(value: number | string | null | undefined): string {
    const n = typeof value === 'string' ? Number(value) : (value ?? 0);

    return cop.format(Number.isFinite(n) ? n : 0);
}
