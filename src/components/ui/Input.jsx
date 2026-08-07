import { forwardRef } from "react";

const Input = forwardRef(function Input(
  { icon, label, error, hint, className = "", wrapperClassName = "", ...props },
  ref
) {
  const inputId = props.id || props.name;

  return (
    <div className={`w-full ${wrapperClassName}`}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50 ${
            icon ? "pl-10" : ""
          } ${error ? "border-danger focus:border-danger focus:ring-danger/10" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
});

export default Input;
