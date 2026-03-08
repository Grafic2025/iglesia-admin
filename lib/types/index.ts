export interface Miembro {
    id: string;
    nombre: string;
    apellido: string;
    foto_url?: string;
    es_servidor?: boolean;
    token_notificacion?: string;
    created_at?: string;
}

export interface Asistencia {
    id: string;
    miembro_id: string;
    fecha: string;
    horario_reunion: string;
    miembros?: Miembro;
}

export interface Cronograma {
    id: string;
    fecha: string;
    horario: string;
    notas_generales?: string;
    plan_detallado?: any[];
    orden_canciones?: string[];
    equipo_ids?: { miembro_id: string; nombre?: string; foto_url?: string; rol: string; estado: string }[];
    chat_activo?: boolean;
}

export interface Noticia {
    id: string;
    titulo: string;
    contenido?: string;
    tipo: 'General' | 'Urgente' | 'Sermón';
    video_id?: string;
    thumbnail_url?: string;
    fecha_publicacion?: string;
}

export interface Usuario {
    id: string;
    email: string;
}
