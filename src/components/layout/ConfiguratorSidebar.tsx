import Link from 'next/link';
import React from 'react';

const steps = [
  { id: 1, name: "Uçuş Tercihi", icon: "flight", path: "/bireysel-umre" },
  { id: 2, name: "Konaklama", icon: "hotel", path: "/bireysel-umre/konaklama" },
  { id: 3, name: "VIP Transfer", icon: "directions_car", path: "/bireysel-umre/transfer" },
  { id: 4, name: "Tren Bileti", icon: "train", path: "/bireysel-umre/tren" },
  { id: 5, name: "Ekstra Turlar", icon: "extension", path: "/bireysel-umre/ekstralar" },
  { id: 6, name: "Rehber & Keşifler", icon: "school", path: "/bireysel-umre/rehber" },
];

export default function ConfiguratorSidebar({ activeStep }: { activeStep: number }) {
  return (
    <aside className="lg:col-span-3 lg:sticky lg:top-32 space-y-3 mb-10 lg:mb-0">
      {steps.map((step) => {
        const isActive = step.id === activeStep;
        return (
          <Link href={step.path} key={step.id} className="block group">
            <div className={`flex items-center space-x-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 ${
              isActive 
                ? "bg-surface-container-lowest border-l-4 border-primary shadow-lg transform -translate-y-1" 
                : "bg-surface-container-lowest border border-transparent opacity-70 hover:opacity-100 hover:shadow-md hover:border-outline-variant/30"
            }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                isActive ? "bg-primary/10 shadow-inner" : "bg-outline/10 text-outline group-hover:bg-primary/5 group-hover:text-primary"
              }`}>
                 <span 
                    className={`material-symbols-outlined transition-colors duration-300 ${isActive ? "text-primary" : ""}`} 
                    data-icon={step.icon}
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                 >
                    {step.icon}
                 </span>
              </div>
              <div className="flex flex-col">
                <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${isActive ? "text-primary" : "text-on-surface-variant group-hover:text-primary/70"}`}>
                  ADIM 0{step.id}
                </span>
                <span className={`font-headline text-lg transition-colors duration-300 ${isActive ? "font-bold text-primary" : "font-medium text-on-surface group-hover:text-primary"}`}>
                  {step.name}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </aside>
  );
}
