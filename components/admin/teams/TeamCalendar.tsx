import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

interface TeamCalendarProps {
    currentMonth: Date;
    setCurrentMonth: (date: Date) => void;
    upcomingSchedules: any[];
    selectedDateSchedule: any;
    onSelectDate: (schedule: any) => void;
}

const TeamCalendar: React.FC<TeamCalendarProps> = ({
    currentMonth,
    setCurrentMonth,
    upcomingSchedules,
    selectedDateSchedule,
    onSelectDate
}) => {
    return (
        <div className="lg:col-span-1 bg-[#1E1E1E] rounded-3xl border border-[#333] overflow-hidden">
            <div className="p-4 bg-[#222] border-b border-[#333] flex items-center justify-between">
                <h3 className="text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                    <CalendarIcon size={16} className="text-[#A8D500]" /> Calendario
                </h3>
                <div className="flex gap-2">
                    <button onClick={() => {
                        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
                        setCurrentMonth(newDate);
                    }} className="text-[#888] hover:text-white p-1">←</button>
                    <span className="text-white text-xs font-bold uppercase">
                        {currentMonth.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={() => {
                        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
                        setCurrentMonth(newDate);
                    }} className="text-[#888] hover:text-white p-1">→</button>
                </div>
            </div>
            <div className="p-4">
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(d => <div key={d} className="text-[#555] text-[10px] font-black">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }).map((_, i) => <div key={i}></div>)}
                    {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() }).map((_, i) => {
                        const day = i + 1;
                        const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const daySchedule = upcomingSchedules.find(s => s.fecha === dateStr);
                        const isSelected = selectedDateSchedule?.fecha === dateStr;

                        return (
                            <button
                                key={day}
                                onClick={() => daySchedule && onSelectDate(daySchedule)}
                                className={`aspect-square flex items-center justify-center text-[10px] rounded-lg border transition-all ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1E1E1E] z-10' : ''
                                    } ${daySchedule ? 'bg-[#A8D500] text-black font-bold border-transparent hover:scale-110' : 'text-[#888] border-[#333] hover:border-[#555]'
                                    }`}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TeamCalendar;
