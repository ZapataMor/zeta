// Tipos de los modelos de negocio de Zeta (proyectos, personal, clientes, finanzas).

export interface UserLite {
    id: number;
    name: string;
    email: string;
}

export interface Cliente {
    id: number;
    nombre: string;
    empresa: string | null;
    email: string | null;
    telefono: string | null;
    estado: string;
    notas: string | null;
    proyectos_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface ClienteLite {
    id: number;
    nombre: string;
}

export interface Persona {
    id: number;
    nombre: string;
    email: string | null;
    cargo: string | null;
    github_username: string | null;
    activo: boolean;
    user_id: number | null;
    user?: UserLite | null;
    created_at?: string;
    updated_at?: string;
}

export interface PersonaLite {
    id: number;
    nombre: string;
    cargo?: string | null;
}

export interface Tarea {
    id: number;
    proyecto_id: number;
    titulo: string;
    descripcion: string | null;
    tipo: string; // tarea | requerimiento
    estado: string; // pendiente | en_progreso | en_revision | hecha
    prioridad: string; // baja | media | alta
    persona_id: number | null;
    fecha_limite: string | null;
    asignado?: PersonaLite | null;
    created_at?: string;
}

export interface Proyecto {
    id: number;
    nombre: string;
    descripcion: string | null;
    cliente_id: number | null;
    product_owner_id: number | null;
    estado: string; // en_definicion | en_progreso | pausado | entregado
    github_repo: string | null;
    fecha_inicio: string | null;
    fecha_fin: string | null;
    cliente?: ClienteLite | null;
    product_owner?: PersonaLite | null;
    participantes?: Persona[];
    tareas?: Tarea[];
    tareas_count?: number;
    participantes_count?: number;
    created_at?: string;
    updated_at?: string;
}

// ----- Finanzas -----

export type TipoAnualidad = 'renta' | 'suscripcion';
export type Periodicidad = 'mensual' | 'trimestral' | 'semestral' | 'anual';
export type FinTipo = 'fecha' | 'meses' | 'indefinida';

export interface Anualidad {
    id: number;
    nombre: string;
    tipo: TipoAnualidad; // renta (suma) | suscripcion (resta)
    monto: string; // decimal:2
    periodicidad: Periodicidad;
    fecha_inicio: string;
    fin_tipo: FinTipo;
    duracion_meses: number | null;
    fecha_fin: string | null; // null = indefinida
    tasa_interes_anual: string | null; // % anual opcional
    renovar: boolean;
    notas: string | null;
    created_at?: string;
    updated_at?: string;
}

export type TipoMovimiento = 'ingreso' | 'gasto' | 'prestamo';
export type DireccionPrestamo = 'otorgado' | 'recibido';
export type EstadoMovimiento = 'pendiente' | 'realizado';

export interface Movimiento {
    id: number;
    concepto: string;
    tipo: TipoMovimiento;
    direccion: DireccionPrestamo | null; // solo préstamo
    monto: string; // decimal:2
    tasa_interes_anual: string | null; // solo préstamo
    fecha: string; // puede ser pasada, actual o futura
    fecha_vencimiento: string | null; // solo préstamo
    estado: EstadoMovimiento;
    fecha_realizado: string | null;
    notas: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface CuentaPendiente {
    id: number;
    concepto: string;
    tipo: TipoMovimiento;
    direccion: DireccionPrestamo | null;
    monto: number;
    fecha: string; // fecha relevante (vencimiento si es préstamo)
    estado: EstadoMovimiento;
    entra: boolean; // true = por cobrar, false = por pagar
    dias: number; // días respecto a hoy (negativo = vencida)
    vencida: boolean;
    proxima: boolean; // vence dentro de 30 días
}

export interface AnualidadPorRenovar {
    id: number;
    nombre: string;
    fecha_fin: string;
}

export interface FinanzaConfig {
    id: number;
    capital_inicial: string;
    fecha_base: string;
}

export interface PuntoProyeccion {
    mes: string; // YYYY-MM
    etiqueta: string; // ej: "Jun 26"
    capital: number;
    ingresos: number;
    egresos: number;
    interes: number;
    neto: number;
}

export interface ResumenProyeccion {
    capital_inicial: number;
    capital_final: number;
    total_ingresos: number;
    total_egresos: number;
    interes_generado: number;
}

export interface Proyeccion {
    puntos: PuntoProyeccion[];
    resumen: ResumenProyeccion;
}
