import React from 'react';
import { X, ChevronRight } from 'lucide-react';

interface TemplatePickerModalProps {
    onSelectTemplate: (template: any) => void;
    onClose: () => void;
}

const TemplatePickerModal: React.FC<TemplatePickerModalProps> = ({ onSelectTemplate, onClose }) => {
    const SERVICE_TEMPLATES = [
        {
            name: "Culto General",
            plan: [
                { id: '1', tiempo: '10 min', actividad: 'Oración Inicial', responsable: 'Pastor' },
                { id: '2', tiempo: '20 min', actividad: 'Alabanza (3-4 canciones)', responsable: 'Banda/Gpo Alabanza' },
                { id: '3', tiempo: '40 min', actividad: 'Predica', responsable: 'Pastor/Invitado' },
                { id: '4', tiempo: '5 min', actividad: 'Ofrendas / Anuncios', responsable: 'Ujieres' },
                { id: '5', tiempo: '10 min', actividad: 'Ministración / Cierre', responsable: 'Banda' }
            ],
            staffRoles: ['Director/Pastor', 'Worship Leader', 'Soprano', 'Tenor', 'Batería', 'Bajo', 'Guitarra Eléctrica 1', 'Piano', 'Sonidista', 'Slides TV']
        },
        {
            name: "Culto de Jóvenes",
            plan: [
                { id: '1', tiempo: '15 min', actividad: 'Dinámica / Bienvenida', responsable: 'Líder Jóvenes' },
                { id: '2', tiempo: '30 min', actividad: 'Adoración fuerte', responsable: 'Banda Jóvenes' },
                { id: '3', tiempo: '40 min', actividad: 'Charla / Word', responsable: 'Líder' },
                { id: '4', tiempo: '20 min', actividad: 'After / Compartir', responsable: 'Todos' }
            ],
            staffRoles: ['Líder Jóvenes', 'Directora Musical', 'Batería', 'Sonidista', 'Pantalla LED', 'YouTube CM']
        },
        {
            name: "Santa Cena",
            plan: [
                { id: '1', tiempo: '30 min', actividad: 'Adoración', responsable: 'Banda' },
                { id: '2', tiempo: '20 min', actividad: 'Mensaje Santa Cena', responsable: 'Pastor' },
                { id: '3', tiempo: '15 min', actividad: 'Reparto de Elementos', responsable: 'Diáconos' },
                { id: '4', tiempo: '10 min', actividad: 'Acción de Gracias', responsable: 'Pastor' }
            ],
            staffRoles: ['Director/Pastor', 'Worship Leader', 'Piano', 'Guitarra Acústica', 'Sonidista', 'Ujier']
        }
    ];

    return (
        <div className="fixed inset-0 bg-black/95 z-[70] flex items-center justify-center p-4">
            <div className="bg-[#1A1A1A] w-full max-w-md rounded-3xl border border-[#333] p-6 text-left">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-white font-bold uppercase tracking-widest">Elegir Plantilla</h3>
                    <button onClick={onClose} className="text-[#888]"><X /></button>
                </div>
                <div className="space-y-3">
                    {SERVICE_TEMPLATES.map(t => (
                        <button
                            key={t.name}
                            onClick={() => onSelectTemplate(t)}
                            className="w-full flex items-center justify-between p-5 bg-[#222] border border-[#333] rounded-2xl hover:border-[#A8D500] hover:bg-[#A8D50010] group transition-all"
                        >
                            <div className="text-left">
                                <p className="text-white font-bold text-lg">{t.name}</p>
                                <p className="text-[#555] text-xs font-bold uppercase tracking-wider">{t.plan.length} momentos definidos</p>
                            </div>
                            <ChevronRight className="text-[#333] group-hover:text-[#A8D500]" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TemplatePickerModal;
