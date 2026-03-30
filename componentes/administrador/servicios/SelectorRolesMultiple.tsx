import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectorRolesMultipleProps {
    roleCategories: any[];
    selectedRoles: string[];
    onChange: (roles: string[]) => void;
}

const SelectorRolesMultiple: React.FC<SelectorRolesMultipleProps> = ({ roleCategories, selectedRoles, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const displayText = selectedRoles.length > 0 ? selectedRoles.join(', ') : 'Rol (Ninguno)';

    return (
        <div className="relative" ref={ref}>
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="bg-black/20 hover:bg-black/40 transition-colors text-[#A8D500] text-[10px] uppercase font-bold px-2 py-1.5 rounded-lg border border-[#A8D500]/30 cursor-pointer flex items-center justify-between min-w-[140px] max-w-[200px]"
            >
                <span className="truncate">{displayText}</span>
                <ChevronDown size={12} className="shrink-0 ml-1" />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-[200px] bg-[#1A1A1A] border border-[#333] rounded-xl shadow-2xl z-[70] max-h-60 overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
                    {roleCategories.map(cat => (
                        <div key={cat.name}>
                            <div className="px-3 py-1.5 bg-[#111] border-y border-[#222] text-[rgba(255,255,255,0.7)] text-[9px] font-black uppercase tracking-widest sticky top-0 z-10">
                                {cat.name}
                            </div>
                            {cat.roles.map((r: string) => {
                                const isSelected = selectedRoles.includes(r);
                                return (
                                    <div
                                        key={r}
                                        onClick={() => {
                                            if (isSelected) {
                                                onChange(selectedRoles.filter(sr => sr !== r));
                                            } else {
                                                onChange([...selectedRoles.filter(sr => sr !== 'Servidor'), r]);
                                            }
                                        }}
                                        className={`px-3 py-2 text-[10px] font-bold uppercase cursor-pointer flex items-center justify-between transition-colors ${isSelected ? 'bg-[#A8D500]/10 text-[#A8D500]' : 'text-white hover:bg-[#222]'
                                            }`}
                                    >
                                        <span className="truncate">{r}</span>
                                        {isSelected && <Check size={12} className="shrink-0 ml-2" />}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SelectorRolesMultiple;
