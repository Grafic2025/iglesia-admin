import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, GripVertical, Save, Info, Link as LinkIcon, Image as ImageIcon, RefreshCw, Megaphone, ChevronUp, ChevronDown } from 'lucide-react';

interface HomeAction {
    id: string;
    titulo: string;
    icono: string;
    imagen_url?: string;
    pantalla: string;
    es_mci: boolean;
    activa: boolean;
}

interface GestorAccionesProps {
    supabase: any;
    registrarAuditoria?: (accion: string, detalle: string) => Promise<void>;
    onPromote?: (action: HomeAction) => void;
}

const DEFAULT_ACTIONS: HomeAction[] = [
    { id: '1', titulo: 'Agenda', icono: 'calendar', imagen_url: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=400', pantalla: 'Agenda', es_mci: false, activa: true },
    { id: '2', titulo: 'Biblia', icono: 'book', imagen_url: 'https://acvxjhecpgmauqqzmjik.supabase.co/storage/v1/object/public/imagenes-iglesia/Biblia.jpg', pantalla: 'https://www.bible.com/es', es_mci: false, activa: true },
    { id: '3', titulo: 'Quiero Ayudar', icono: 'heart', imagen_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400', pantalla: 'Quiero Ayudar', es_mci: false, activa: true },
    { id: '4', titulo: 'Necesito Ayuda', icono: 'hand-heart', imagen_url: 'https://acvxjhecpgmauqqzmjik.supabase.co/storage/v1/object/public/imagenes-iglesia/Ayuda.jpg', pantalla: 'Necesito Ayuda', es_mci: true, activa: true },
    { id: '5', titulo: 'Quiero Bautizarme', icono: 'tint', imagen_url: 'https://acvxjhecpgmauqqzmjik.supabase.co/storage/v1/object/public/imagenes-iglesia/Bautismos.jpg', pantalla: 'Quiero Bautizarme', es_mci: false, activa: true },
    { id: '6', titulo: 'Quiero Capacitarme', icono: 'graduation-cap', imagen_url: 'https://acvxjhecpgmauqqzmjik.supabase.co/storage/v1/object/public/imagenes-iglesia/Capacitarme.jpg', pantalla: 'Quiero Capacitarme', es_mci: false, activa: true },
    { id: '7', titulo: 'Soy Nuevo', icono: 'account-plus', imagen_url: 'https://acvxjhecpgmauqqzmjik.supabase.co/storage/v1/object/public/imagenes-iglesia/Nuevo.jpg', pantalla: 'Soy Nuevo', es_mci: true, activa: true },
    { id: '8', titulo: 'Necesito Oración', icono: 'hands-pray', imagen_url: 'https://acvxjhecpgmauqqzmjik.supabase.co/storage/v1/object/public/imagenes-iglesia/Oracion.jpg', pantalla: 'Necesito Oración', es_mci: true, activa: true },
    { id: '9', titulo: 'Sumarme a un Grupo', icono: 'users', imagen_url: 'https://acvxjhecpgmauqqzmjik.supabase.co/storage/v1/object/public/imagenes-iglesia/Grupos.jpg', pantalla: 'Sumarme a un Grupo', es_mci: false, activa: true },
    { id: '10', titulo: 'Reunión en Vivo', icono: 'youtube-play', imagen_url: 'https://acvxjhecpgmauqqzmjik.supabase.co/storage/v1/object/public/imagenes-iglesia/Vivo.jpg', pantalla: 'https://youtube.com/@iglesiadelsalvador', es_mci: false, activa: true },
];

const GestorAcciones: React.FC<GestorAccionesProps> = ({ supabase, registrarAuditoria, onPromote }) => {
    const [acciones, setAcciones] = useState<HomeAction[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    // Form states
    const [titulo, setTitulo] = useState('');
    const [icono, setIcono] = useState('');
    const [imagenUrl, setImagenUrl] = useState('');
    const [pantalla, setPantalla] = useState('');
    const [esMci, setEsMci] = useState(false);

    useEffect(() => {
        fetchAcciones();
    }, []);

    const fetchAcciones = async () => {
        setLoading(true);
        const { data } = await supabase.from('configuracion').select('*').eq('clave', 'inicio_actions').maybeSingle();
        if (data && data.valor) {
            setAcciones(data.valor);
        } else {
            // Important: Let's NOT populate automatically so the DB stays clean,
            // but we'll show a button to "Load App Defaults"
            setAcciones([]);
        }
        setLoading(false);
    };

    const restoreDefaults = async () => {
        if (!confirm('Esto reemplazará tus tarjetas actuales con las 10 tarjetas originales de la App. ¿Continuar?')) return;
        handleSaveList(DEFAULT_ACTIONS);
    };

    const handleSaveList = async (updatedList: HomeAction[]) => {
        setSaving(true);
        const { error } = await supabase.from('configuracion').upsert({
            clave: 'inicio_actions',
            valor: updatedList
        }, { onConflict: 'clave' });

        if (error) {
            alert('Error al guardar: ' + error.message);
        } else {
            if (registrarAuditoria) await registrarAuditoria('CONFIG_HOME_ACTIONS', 'Se actualizaron los accesos directos del inicio');
            setAcciones(updatedList);
        }
        setSaving(false);
    };

    const openAdd = () => {
        setEditIndex(null);
        setTitulo('');
        setIcono('');
        setImagenUrl('');
        setPantalla('');
        setEsMci(false);
        setModalOpen(true);
    };

    const openEdit = (index: number) => {
        const a = acciones[index];
        setEditIndex(index);
        setTitulo(a.titulo);
        setIcono(a.icono);
        setImagenUrl(a.imagen_url || '');
        setPantalla(a.pantalla);
        setEsMci(a.es_mci);
        setModalOpen(true);
    };

    const saveAction = () => {
        const newAction: HomeAction = {
            id: editIndex !== null ? acciones[editIndex].id : Math.random().toString(36).substr(2, 9),
            titulo,
            icono,
            imagen_url: imagenUrl,
            pantalla,
            es_mci: esMci,
            activa: true
        };

        const newList = [...acciones];
        if (editIndex !== null) {
            newList[editIndex] = newAction;
        } else {
            newList.push(newAction);
        }

        handleSaveList(newList);
        setModalOpen(false);
    };

    const deleteAction = (index: number) => {
        if (!confirm('¿Seguro que quieres eliminar este acceso?')) return;
        const newList = acciones.filter((_, i) => i !== index);
        handleSaveList(newList);
    };

    const move = (index: number, direction: 'up' | 'down') => {
        const newList = [...acciones];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= acciones.length) return;
        [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];
        handleSaveList(newList);
    };

    if (loading) return <div className="text-[rgba(255,255,255,0.7)] animate-pulse p-10">Cargando configuración...</div>;

    return (
        <div className="bg-[#151515] p-6 rounded-3xl border border-[#222] space-y-6 text-left shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-white font-black text-xl flex items-center gap-2 tracking-tight">
                        <GripVertical className="text-accent" /> Accesos Directos
                        <span className="text-[rgba(255,255,255,0.5)] font-medium text-sm">(Menú App)</span>
                    </h3>
                    <p className="text-[rgba(255,255,255,0.6)] text-xs">Gestiona los botones que aparecen en el inicio de la App</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={restoreDefaults}
                        className="flex-1 sm:flex-none bg-[#222] text-accent px-3 py-2 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 hover:bg-[#2a2a2a] transition-all border border-accent/10"
                    >
                        <RefreshCw size={14} /> TRAER TARJETAS ACTUALES
                    </button>
                    <button
                        onClick={openAdd}
                        className="flex-1 sm:flex-none bg-accent text-black px-4 py-2 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 hover:bg-[#b0f000] transition-all shadow-lg shadow-[var(--accent)20]"
                    >
                        <Plus size={16} /> AGREGAR NUEVA
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {acciones.length === 0 && (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-[#222] rounded-3xl bg-[#1a1a1a]/50">
                        <p className="text-[#444] italic mb-4 text-sm font-medium">No hay tarjetas personalizadas aún.</p>
                        <button onClick={restoreDefaults} className="bg-accent text-black px-4 py-2 rounded-lg text-[10px] font-black hover:scale-105 transition-transform">CARGAR VALORES POR DEFECTO</button>
                    </div>
                )}
                {acciones.map((a, index) => (
                    <div key={a.id} className="bg-[#1e1e1e] p-3 rounded-2xl border border-[#2a2a2a] flex items-center justify-between group hover:border-[var(--accent)50] hover:bg-[#252525] transition-all shadow-sm">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 shrink-0 rounded-xl bg-[#151515] border border-[#2a2a2a] overflow-hidden flex items-center justify-center relative shadow-inner">
                                {a.imagen_url ? (
                                    <img src={a.imagen_url} className="w-full h-full object-cover opacity-60" alt="" />
                                ) : (
                                    <ImageIcon size={18} className="text-[#333]" />
                                )}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <span className="text-accent font-black text-[9px] uppercase tracking-tighter">{a.icono}</span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0 pr-2">
                                <h4 className="text-white font-bold text-sm uppercase tracking-wide group-hover:text-accent transition-colors leading-tight">{a.titulo}</h4>
                                <div className="flex items-center gap-1.5 opacity-60 mt-0.5">
                                    <LinkIcon size={10} className="text-[rgba(255,255,255,0.7)] shrink-0" />
                                    <p className="text-[rgba(255,255,255,0.7)] text-[10px] font-bold tracking-widest uppercase truncate">{a.pantalla}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center shrink-0 ml-2">
                            <div className="flex items-center gap-0.5 opacity-30 group-hover:opacity-100 transition-all bg-[#151515] p-1 rounded-xl border border-white/5">
                                {onPromote && (
                                    <button
                                        onClick={() => onPromote(a)}
                                        title="Promocionar a Noticia"
                                        className="p-1.5 text-accent hover:bg-[var(--accent)15] rounded-lg transition-colors"
                                    >
                                        <Megaphone size={14} />
                                    </button>
                                )}
                                <div className="w-px h-4 bg-[#333] mx-1" />
                                <button onClick={() => move(index, 'up')} disabled={index === 0} className="p-1.5 text-[rgba(255,255,255,0.7)] hover:text-white disabled:opacity-0 transition-colors"><ChevronUp size={16} /></button>
                                <button onClick={() => move(index, 'down')} disabled={index === acciones.length - 1} className="p-1.5 text-[rgba(255,255,255,0.7)] hover:text-white disabled:opacity-0 transition-colors"><ChevronDown size={16} /></button>
                                <div className="w-px h-4 bg-[#333] mx-1" />
                                <button onClick={() => openEdit(index)} className="p-1.5 text-blue-400 hover:bg-blue-400/15 rounded-lg transition-colors"><Edit2 size={14} /></button>
                                <button onClick={() => deleteAction(index)} className="p-1.5 text-red-500 hover:bg-red-500/15 rounded-lg transition-colors"><Trash2 size={14} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-[var(--accent)10] p-4 rounded-3xl border border-[var(--accent)20] flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--accent)20] flex items-center justify-center shrink-0">
                    <Info className="text-accent" size={16} />
                </div>
                <p className="text-[10px] text-[rgba(255,255,255,0.7)] leading-normal font-medium">
                    <strong className="text-white">Tip Estético:</strong> Estos botones se muestran de a dos en la App. Mantén los títulos cortos y las URLs de imagen de buena calidad (Unsplash recomendado) para que el inicio de tu App luzca increíble.
                </p>
            </div>

            {/* MODAL PARA EDITAR/CREAR */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-[#1E1E1E] border border-[#333] w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl text-left">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-white font-bold text-lg">{editIndex !== null ? 'Editar Tarjeta' : 'Nueva Tarjeta'}</h3>
                            <button onClick={() => setModalOpen(false)} className="text-[rgba(255,255,255,0.7)]"><X size={20} /></button>
                        </div>

                        <div>
                            <label className="text-[rgba(255,255,255,0.7)] text-[10px] font-bold uppercase mb-1 block">Título del botón</label>
                            <input
                                value={titulo}
                                onChange={e => setTitulo(e.target.value)}
                                placeholder="Ej: Agenda de Eventos"
                                className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-2 text-white outline-none focus:border-accent"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[rgba(255,255,255,0.7)] text-[10px] font-bold uppercase mb-1 block">Icono (App Name)</label>
                                <input
                                    value={icono}
                                    onChange={e => setIcono(e.target.value)}
                                    placeholder="Ej: calendar"
                                    className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-2 text-white outline-none focus:border-accent"
                                />
                            </div>
                            <div>
                                <label className="text-[rgba(255,255,255,0.7)] text-[10px] font-bold uppercase mb-1 block">Tipo de Icono</label>
                                <select
                                    value={esMci ? 'mci' : 'fa'}
                                    onChange={e => setEsMci(e.target.value === 'mci')}
                                    className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-2 text-white outline-none focus:border-accent"
                                >
                                    <option value="fa">FontAwesome</option>
                                    <option value="mci">MaterialCommunityIcons</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-[rgba(255,255,255,0.7)] text-[10px] font-bold uppercase mb-1 block">Pantalla Destino (o Link)</label>
                            <input
                                value={pantalla}
                                onChange={e => setPantalla(e.target.value)}
                                placeholder="Ej: Agenda o https://..."
                                className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-2 text-white outline-none focus:border-accent"
                            />
                        </div>

                        <div>
                            <label className="text-[rgba(255,255,255,0.7)] text-[10px] font-bold uppercase mb-1 block">URL de Imagen Fondo</label>
                            <input
                                value={imagenUrl}
                                onChange={e => setImagenUrl(e.target.value)}
                                placeholder="https://images.unsplash.com/..."
                                className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-2 text-white text-xs outline-none focus:border-accent"
                            />
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button onClick={() => setModalOpen(false)} className="flex-1 py-3 text-[rgba(255,255,255,0.7)] font-bold bg-[#333] rounded-xl">CANCELAR</button>
                            <button
                                onClick={saveAction}
                                disabled={saving || !titulo || !icono || !pantalla}
                                className="flex-1 py-3 bg-accent text-black font-bold rounded-xl shadow-lg shadow-[var(--accent)30] disabled:opacity-50"
                            >
                                {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Simple X component since lucide-react might not have it or just for brevity
const X = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export default GestorAcciones;

