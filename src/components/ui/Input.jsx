export default function Input({ icon, className = '', ...props }) {
  return (
    <div className={`relative w-full ${className}`}>
      {icon ? (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
      ) : null}
      <input
        className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
        {...props}
      />
    </div>
  );
}
