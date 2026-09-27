import React from "react";
import { Search, X } from "lucide-react";

export const NAVY = "#1B2A56";
export const NAVY_DARK = "#121D3F";
export const RED = "#EE243A";

export const inputCls =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0";

export function Btn({ children, onClick, variant = "primary", size = "md", icon: Icon, type = "button", disabled }) {
  const base =
    "inline-flex items-center gap-1.5 rounded-md font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const sizes = size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-4 py-2 text-sm";
  const variants = {
    primary: "text-white",
    ghost: "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
    subtle: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  };
  const style = variant === "primary" ? { backgroundColor: NAVY } : {};
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={style} className={`${base} ${sizes} ${variants[variant]}`}>
      {Icon && <Icon size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
}

export function IconBtn({ icon: Icon, onClick, title, tone = "gray" }) {
  const tones = { gray: "text-gray-400 hover:text-gray-700", red: "text-red-400 hover:text-red-600" };
  return (
    <button type="button" onClick={onClick} title={title} className={`p-1.5 rounded hover:bg-gray-100 ${tones[tone]}`}>
      <Icon size={16} />
    </button>
  );
}

export function Pill({ children, tone }) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-rose-50 text-rose-600 border-rose-200",
    gray: "bg-gray-100 text-gray-500 border-gray-200",
  };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${tones[tone]}`}>{children}</span>;
}

export function Field({ label, required, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span style={{ color: RED }}> *</span>}
      </span>
      {children}
    </label>
  );
}

export function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 overflow-y-auto">
      <div className={`bg-white rounded-lg shadow-xl w-full ${wide ? "max-w-3xl" : "max-w-lg"} mt-8`}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ backgroundColor: NAVY }}>
          <h3 className="text-white font-semibold">{title}</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ text, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center text-gray-400 py-16 gap-2">
      <Icon size={32} strokeWidth={1.5} />
      <p className="text-sm">{text}</p>
    </div>
  );
}

export function Header({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function SearchBar({ q, setQ, placeholder }) {
  return (
    <div className="relative mb-4 max-w-sm">
      <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
      <input className={`${inputCls} pl-8`} value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

export function Card({ children }) {
  return <div className="bg-white rounded-lg border border-gray-200 p-5">{children}</div>;
}

export function Table({ cols, children }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-gray-400 text-xs uppercase tracking-wide">
          {cols.map((c, i) => (
            <th key={i} className="py-2 px-4 font-medium">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

export function fmtDate(d) {
  if (!d) return "-";
  const [y, m, day] = d.split("-");
  return `${day}.${m}.${y}`;
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}
