export interface Miembro {
    id: string;
    nombre: string;
    apellido?: string;
    correo?: string;
    telefono?: string;
    foto_url?: string;
    es_servidor: boolean;
    es_administrador: boolean;
    fecha_nacimiento?: string;
    token_notificacion?: string;
    activo?: boolean;
    created_at?: string;
    foto_perfil?: string;
}

export interface Asistencia {
    id: string;
    miembro_id: string;
    fecha: string;
    hora_entrada?: string;
    horario_reunion?: string;
    racha?: number;
    miembros?: Miembro;
}

export interface CrecimientoAnual {
    mes: string;
    cantidad: number;
    meta?: number;
}

export interface AsistenciaDiaria {
    dia: string;
    total: number;
}

export interface Noticia {
    id: string;
    titulo: string;
    descripcion?: string;
    imagen_url?: string;
    url?: string;
    es_youtube?: boolean;
    video_url?: string;
    orden: number;
    creado_el: string;
}

export interface NotificacionLog {
    id: string;
    titulo: string;
    mensaje: string;
    leida: boolean;
    fecha: string;
    creado_el: string;
}

