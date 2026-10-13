"use client";
import { useState } from "react";
import HugIcon from "@/components/icons/HugIcon";
import { fieldClass, fieldIcon } from "./fields";

export default function PasswordInput({ value, onChange, placeholder, autoComplete, hasError }: { value: string; onChange: (v: string) => void; placeholder: string; autoComplete: string; hasError: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <label className="relative block">
      <span className="sr-only">{placeholder}</span>
      <HugIcon name="guven" size={20} className={fieldIcon} />
      <input type={show ? "text" : "password"} className={`${fieldClass(hasError)} pr-20`} placeholder={placeholder} autoComplete={autoComplete} value={value} onChange={(e) => onChange(e.target.value)} />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[var(--h-blue)] hover:bg-[var(--h-white)]">
        {show ? "Gizle" : "Göster"}
      </button>
    </label>
  );
}
