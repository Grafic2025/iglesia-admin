import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, GripVertical, Save, Info, Link as LinkIcon, Image as ImageIcon, RefreshCw } from 'lucide-react';

interface HomeAction {
    id: string;
    titulo: string;
    icono: string;
    imagen_url?: string;
    pantalla: string;
    es_mci: boolean;
    activa: boolean;
}

interface ActionsManagerProps {
    supabase: any;
    registrarAuditoria?: (accion: string, detalle: string) => Promise<void>;
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

const ActionsManager: React.FC<ActionsManagerProps> = ({ supabase, registrarAuditoria }) => {
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
        const { data } = await supabase.from('configuracion').select('*').eq('clave', 'home_actions').maybeSingle();
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
            clave: 'home_actions',
            valor: updatedList,
            updated_at: new Date().toISOString()
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

        let newList = [...acciones];
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

    if (loading) return <div className="text-[#888] animate-pulse p-10">Cargando configuración...</div>;

    return (
        <div className="bg-[#1E1E1E] p-6 rounded-3xl border border-[#333] space-y-6 text-left">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <GripVertical className="text-[#A8D500]" /> Accesos Directos (Menú App)
                    </h3>
                    <p className="text-[#888] text-xs">Gestiona los botones que aparecen en el inicio de la App</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={restoreDefaults}
                        className="bg-[#333] text-[#A8D500] px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-[#444] transition-all border border-[#A8D500]/20"
                    >
                        <RefreshCw size={16} /> TRAER TARJETAS ACTUALES
                    </button>
                    <button
                        onClick={openAdd}
                        className="bg-[#A8D500] text-black px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-[#b0f000] transition-all"
                    >
                        <Plus size={16} /> AGREGAR NUEVA
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {acciones.length === 0 && (
                    <div className="col-span-full py-10 text-center border-2 border-dashed border-[#333] rounded-2xl">
                        <p className="text-[#555] italic mb-4">No hay tarjetas personalizadas aún.</p>
                        <button onClick={restoreDefaults} className="text-[#A8D500] text-xs font-bold underline decoration-dotted">Toca aquí para cargar las 10 tarjetas que vienen por defecto en la App</button>
                    </div>
                )}
                {acciones.map((a, index) => (
                    <div key={a.id} className="bg-[#252525] p-4 rounded-2xl border border-[#333] flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-[#333] overflow-hidden flex items-center justify-center relative">
                            {a.imagen_url ? (
                                <img src={a.imagen_url} className="w-full h-full object-cover opacity-50" alt="" />
                            ) : (
                                <ImageIcon size={20} className="text-[#333]" />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[#A8D500] font-bold text-xs">{a.icono}</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-white font-bold text-sm">{a.titulo}</h4>
                            <p className="text-[#555] text-[10px] uppercase font-bold tracking-wider">{a.pantalla}</p>
                        </div>
                        <div className="flex gap-1">
                            <button onClick={() => move(index, 'up')} disabled={index === 0} className="p-2 text-[#555] hover:text-white disabled:opacity-0"><GripVertical size={16} className="rotate-90" /></button>
                            <button onClick={() => move(index, 'down')} disabled={index === acciones.length - 1} className="p-2 text-[#555] hover:text-white disabled:opacity-0"><GripVertical size={16} className="-rotate-90" /></button>
                            <button onClick={() => openEdit(index)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg"><Edit2 size={16} /></button>
                            <button onClick={() => deleteAction(index)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-[#A8D500]/5 p-4 rounded-2xl border border-[#A8D500]/20 flex gap-3">
                <Info className="text-[#A8D500] shrink-0" size={20} />
                <p className="text-[11px] text-[#aaa] leading-relaxed">
                    <strong>Tip:</strong> Estos botones se muestran de a dos en la App. Asegúrate de que las pantallas coincidan exactamente con el nombre de la vista en la App (ej: "Agenda", "Necesito Oración", "Quiero Ayudar").
                </p>
            </div>

            {/* MODAL PARA EDITAR/CREAR */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-[#1E1E1E] border border-[#333] w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl text-left">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-white font-bold text-lg">{editIndex !== null ? 'Editar Tarjeta' : 'Nueva Tarjeta'}</h3>
                            <button onClick={() => setModalOpen(false)} className="text-[#888]"><X size={20} /></button>
                        </div>

                        <div>
                            <label className="text-[#888] text-[10px] font-bold uppercase mb-1 block">Título del botón</label>
                            <input
                                value={titulo}
                                onChange={e => setTitulo(e.target.value)}
                                placeholder="Ej: Agenda de Eventos"
                                className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-2 text-white outline-none focus:border-[#A8D500]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[#888] text-[10px] font-bold uppercase mb-1 block">Icono (App Name)</label>
                                <input
                                    value={icono}
                                    onChange={e => setIcono(e.target.value)}
                                    placeholder="Ej: calendar"
                                    className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-2 text-white outline-none focus:border-[#A8D500]"
                                />
                            </div>
                            <div>
                                <label className="text-[#888] text-[10px] font-bold uppercase mb-1 block">Tipo de Icono</label>
                                <select
                                    value={esMci ? 'mci' : 'fa'}
                                    onChange={e => setEsMci(e.target.value === 'mci')}
                                    className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-2 text-white outline-none focus:border-[#A8D500]"
                                >
                                    <option value="fa">FontAwesome</option>
                                    <option value="mci">MaterialCommunityIcons</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-[#888] text-[10px] font-bold uppercase mb-1 block">Pantalla Destino (o Link)</label>
                            <input
                                value={pantalla}
                                onChange={e => setPantalla(e.target.value)}
                                placeholder="Ej: Agenda o https://..."
                                className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-2 text-white outline-none focus:border-[#A8D500]"
                            />
                        </div>

                        <div>
                            <label className="text-[#888] text-[10px] font-bold uppercase mb-1 block">URL de Imagen Fondo</label>
                            <input
                                value={imagenUrl}
                                onChange={e => setImagenUrl(e.target.value)}
                                placeholder="https://images.unsplash.com/..."
                                className="w-full bg-[#252525] border border-[#333] rounded-xl px-4 py-2 text-white text-xs outline-none focus:border-[#A8D500]"
                            />
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button onClick={() => setModalOpen(false)} className="flex-1 py-3 text-[#888] font-bold bg-[#333] rounded-xl">CANCELAR</button>
                            <button
                                onClick={saveAction}
                                disabled={saving || !titulo || !icono || !pantalla}
                                className="flex-1 py-3 bg-[#A8D500] text-black font-bold rounded-xl shadow-lg shadow-[#A8D50030] disabled:opacity-50"
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

export default ActionsManager;
