import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import type { ReactNode } from "react";

type InputMode = "glass" | "solid";

export function Field({ label, children, mode = "solid" }: { label: string; children: ReactNode; mode?: InputMode }) {
  return (
    <label className="grid gap-1.5">
      <span className={`text-xs font-semibold uppercase tracking-wider ${mode === "solid" ? "text-infobase-dark" : "text-white/70"}`}>{label}</span>
      {children}
    </label>
  );
}

export function TextInput({ mode = "solid", ...props }: InputHTMLAttributes<HTMLInputElement> & { mode?: InputMode }) {
  return (
    <input
      {...props}
      className={`h-9 px-3 text-sm ${mode === "solid" ? "solid-input" : "glass-input"} ${props.className || ""}`}
    />
  );
}

export function SelectInput({ mode = "solid", ...props }: SelectHTMLAttributes<HTMLSelectElement> & { mode?: InputMode }) {
  return (
    <select
      {...props}
      className={`h-9 px-3 text-sm ${mode === "solid" ? "solid-input" : "glass-input"} ${props.className || ""}`}
    />
  );
}

export function TextArea({ mode = "solid", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { mode?: InputMode }) {
  return (
    <textarea
      {...props}
      className={`min-h-24 px-3 py-2 text-sm ${mode === "solid" ? "solid-input" : "glass-input"} ${props.className || ""}`}
    />
  );
}
