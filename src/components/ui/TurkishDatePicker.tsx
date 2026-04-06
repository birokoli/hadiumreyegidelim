"use client";

import React, { useState, useRef, useEffect } from "react";

interface DatePickerProps {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  minDate?: string;
  isSecondary?: boolean;
}

export default function TurkishDatePicker({ label, value, onChange, minDate, isSecondary }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDateDisplay = (dateStr: string) => {
    if (!mounted || !dateStr) return "Tarih Seçin";
    const d = new Date(dateStr);
    return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  };

  const currentDateObj = value ? new Date(value) : new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(currentDateObj.getFullYear(), currentDateObj.getMonth(), 1));

  // Calendar logic
  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    let day = new Date(year, month, 1).getDay();
    // JS days: 0 Sunday, 1 Monday. We want 0 Monday.
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const firstDay = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handleSelectDate = (day: number | null, e: React.MouseEvent) => {
    e.stopPropagation();
    if (day === null) return;
    
    // Format to local date string YYYY-MM-DD safely
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const targetDate = `${yyyy}-${mm}-${dd}`;

    if (minDate && targetDate < minDate) {
      return; // disabled
    }

    onChange(targetDate);
    setIsOpen(false);
  };

  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", 
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];
  const dayNames = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  return (
    <div className="flex-1 space-y-3 relative group" ref={containerRef}>
      <label 
        className={`text-xs font-bold uppercase tracking-widest text-on-surface-variant transition-colors block cursor-pointer ${isSecondary ? 'group-hover:text-secondary' : 'group-hover:text-primary'} ${isOpen ? (isSecondary ? 'text-secondary' : 'text-primary') : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        {label}
      </label>
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-5 bg-surface rounded-2xl border-2 transition-colors flex justify-between items-center shadow-inner cursor-pointer select-none ${
          isSecondary 
            ? isOpen ? 'border-secondary opacity-100' : 'border-outline-variant/20 group-hover:border-secondary opacity-80 group-hover:opacity-100'
            : isOpen ? 'border-primary' : 'border-primary/20 group-hover:border-primary'
        }`}
      >
        <span className={`font-headline font-bold text-lg ${isSecondary ? 'text-on-surface' : 'text-primary'}`}>
          {formatDateDisplay(value)}
        </span>
        <span 
          className={`material-symbols-outlined transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${isSecondary ? isOpen ? 'text-secondary' : 'text-outline group-hover:text-secondary' : 'text-primary'}`}
        >
          {isSecondary ? 'calendar_month' : 'calendar_today'}
        </span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-[320px] max-w-[90vw] mt-2 bg-surface p-5 rounded-3xl shadow-2xl border border-outline-variant/20 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <button onClick={prevMonth} className="w-8 h-8 hover:bg-surface-variant rounded-full text-on-surface flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <span className="font-bold text-base text-on-surface font-headline tracking-wide">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button onClick={nextMonth} className="w-8 h-8 hover:bg-surface-variant rounded-full text-on-surface flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-3">
            {dayNames.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-2 gap-x-1">
            {days.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-10 w-10"></div>;
              }
              const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              const yyyy = d.getFullYear();
              const mm = String(d.getMonth() + 1).padStart(2, "0");
              const dd = String(d.getDate()).padStart(2, "0");
              const todayStr = `${yyyy}-${mm}-${dd}`;
              
              const isHajjPeriod = yyyy === 2026 && ((d.getMonth() === 3 && d.getDate() >= 20) || d.getMonth() === 4);
              const isDisabled = Boolean(minDate && todayStr < minDate) || isHajjPeriod;
              const isSelected = todayStr === value && !isHajjPeriod;
              const isOffseason = (d.getMonth() === 8 || d.getMonth() === 9) && d.getFullYear() === 2026 && !isHajjPeriod;

              return (
                <button
                  key={idx}
                  disabled={isDisabled}
                  onClick={(e) => handleSelectDate(day, e)}
                  title={isHajjPeriod ? "⛔ Hac Mevsimi Kapalı (20 Nis - 31 May)" : (isOffseason && !isDisabled ? "Kurban Sonrası Ucuz Bilet (Offseason Fırsatı)" : "")}
                  className={`h-10 w-10 mx-auto rounded-full text-[13px] font-bold transition-all flex items-center justify-center relative
                    ${isHajjPeriod ? 'bg-error/5 text-error/50 line-through cursor-not-allowed border border-error/10' : (isDisabled ? 'opacity-30 cursor-not-allowed text-outline' : 'cursor-pointer')}
                    ${isSelected 
                      ? (isSecondary ? 'bg-secondary text-white shadow-md scale-110 z-10' : 'bg-primary text-white shadow-md scale-110 z-10') 
                      : (!isDisabled ? (isOffseason ? 'bg-[#e0f5eb] text-primary border border-primary/20 hover:bg-primary/20 hover:scale-110 z-0' : 'hover:bg-surface-variant hover:scale-110 text-on-surface') : '')}
                  `}
                >
                  {day}
                  {isOffseason && !isSelected && !isDisabled && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#11A851] opacity-60"></span>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="mt-5 pt-4 border-t border-outline-variant/10 flex flex-col gap-3 items-start bg-surface-container-lowest -mx-5 -mb-5 px-5 py-4 rounded-b-3xl">
             <div className="flex gap-3 items-center">
               <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#e0f5eb] border border-primary/20 flex items-center justify-center relative">
                 <span className="material-symbols-outlined text-primary text-[14px]">local_fire_department</span>
                 <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[#11A851]"></span>
               </div>
               <p className="text-[10px] text-on-surface-variant leading-relaxed">
                 <strong className="text-primary tracking-wide text-[11px] block mb-0.5">Sezon Sonu Fiyat Fırsatı</strong>
                 Yeşille işaretli tarihler <strong>(Eylül-Ekim 2026)</strong> en avantajlı yoğunluk düşüşünü gösterir.
               </p>
             </div>
             
             <div className="flex gap-3 items-center w-full bg-error/5 rounded-xl p-3 border border-error/10">
               <div className="flex-shrink-0 w-7 h-7 rounded-full bg-error/10 flex items-center justify-center">
                 <span className="material-symbols-outlined text-error text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>gpp_bad</span>
               </div>
               <p className="text-[9px] text-error/80 leading-snug">
                 <strong className="block text-error text-[10px] mb-0.5">20 Nisan - 31 Mayıs 2026 Onaylanamaz</strong>
                 Bu tarihler arası Hac mevsimine denk geldiği için genel randevuya kapalıdır.
               </p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
