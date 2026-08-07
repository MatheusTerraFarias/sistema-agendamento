import { forwardRef } from "react";

const variants = {
  primary:
    "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 shadow-sm hover:shadow-md",
  secondary:
    "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100",
  danger:
    "bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-700 shadow-sm hover:shadow-md",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200",
  success:
    "bg-success-600 text-white hover:bg-success-700 active:bg-success-700 shadow-sm",
  link:
    "bg-transparent text-primary underline-offset-2 hover:underline px-0 py-0",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-6 py-3 text-sm rounded-xl gap-2",
  xl: "px-7 py-3.5 text-base rounded-xl gap-2.5",
  icon: "p-2.5 rounded-xl",
};

const Button = forwardRef(function Button(
  { children, variant = "primary", size = "md", className = "", disabled, loading, ...props },
  ref
) {
  const base =
    "inline-flex items-center justify-center font-semibold transition-all duration-200 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]";

  return (
    <button
      ref={ref}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
});

export default Button;
