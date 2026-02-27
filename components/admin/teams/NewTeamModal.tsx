import React from 'react';

interface NewTeamModalProps {
    newTeamName: string;
    setNewTeamName: (s: string) => void;
    newTeamIcon: string;
    setNewTeamIcon: (s: string) => void;
    onClose: () => void;
    onCreate: () => void;
}

const NewTeamModal: React.FC<NewTeamModalProps> = ({
    newTeamName,
    setNewTeamName,
    newTeamIcon,
    setNewTeamIcon,
    onClose,
    onCreate
}) => {
    const emojis = ['🎸', '🎤', '🎥', '☕', '🎨', '🛡️', '🚌', '🍕', '🙏', '🔌', '💻'];

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="bg-[#1A1A1A] w-full max-w-sm rounded-3xl border border-[#333] p-6">
                <h3 className="text-white font-bold text-xl mb-6">Crear Nuevo Equipo</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-[#888] text-xs font-bold mb-2 block uppercase">Nombre del Equipo</label>
                        <input
                            type="text"
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                            placeholder="Ej: Staff, Bienvenida..."
                            className="w-full bg-[#222] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#A8D500]"
                        />
                    </div>
                    <div>
                        <label className="text-[#888] text-xs font-bold mb-2 block uppercase">Icono (Emoji)</label>
                        <div className="grid grid-cols-5 gap-2">
                            {emojis.map(emoji => (
                                <button
                                    key={emoji}
                                    onClick={() => setNewTeamIcon(emoji)}
                                    className={`p-3 text-2xl rounded-xl border transition-all ${newTeamIcon === emoji ? 'bg-[#A8D500] border-[#A8D500]' : 'bg-[#222] border-[#333] hover:border-[#555]'}`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-[#222] text-white font-bold py-3 rounded-xl border border-[#333] hover:bg-[#333] transition-all"
                        >
                            CANCELAR
                        </button>
                        <button
                            onClick={onCreate}
                            disabled={!newTeamName.trim()}
                            className="flex-1 bg-[#A8D500] text-black font-bold py-3 rounded-xl hover:shadow-[0_0_15px_rgba(168,213,0,0.3)] disabled:opacity-50 transition-all"
                        >
                            CREAR
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewTeamModal;
