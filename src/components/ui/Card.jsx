export default function Card({ children, className = "", hover = false, padding = true }) {
  return (
    <div
      className={`rounded-2xl bg-white shadow-card border border-slate-100 ${
        padding ? "p-5" : ""
      } ${hover ? "transition-all duration-200 hover:shadow-card-hover hover:border-slate-200 hover:-translate-y-0.5" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({ label, value, icon, iconColor = "text-primary", trend, className = "" }) {
  return (
    <Card className={`group ${className}`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
          {trend && <p className="mt-1 text-xs text-slate-500">{trend}</p>}
        </div>
        {icon && (
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 ${iconColor} transition-colors group-hover:bg-slate-100`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
