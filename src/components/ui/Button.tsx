import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "white";
  size?: "sm" | "md";
};

const variants = {
  primary: "btn-gradient",
  secondary: "border border-slate-200 bg-white text-infobase-dark shadow-sm hover:border-infobase-primary hover:bg-infobase-pale",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700",
  ghost: "bg-transparent text-white/80 hover:text-white hover:bg-white/10",
  white: "btn-white"
};

const sizes = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-9 px-4 text-sm gap-2 rounded-lg"
};

export function Button({ variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
    />
  );
}
