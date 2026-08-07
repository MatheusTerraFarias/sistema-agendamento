export default function PageContainer({ children, className = "" }) {
  return (
    <div className={`page-anim flex-1 overflow-y-auto bg-slate-50/50 ${className}`}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </div>
    </div>
  );
}
