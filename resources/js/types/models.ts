// Tipos de los modelos de negocio de Zeta (proyectos, personal, clientes).

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
