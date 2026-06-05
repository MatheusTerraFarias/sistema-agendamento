export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition';

  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-700',
    ghost: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
    filterActive: 'bg-slate-900 text-white',
    filterInactive: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    subtle: 'rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200',
  };

  const variantClass = variants[variant] || variant;

  return (
    <button className={`${base} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
