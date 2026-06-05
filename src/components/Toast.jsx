import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from "react-icons/fa";
import { useEffect, useState } from "react";

export default function Toast({ message, type = "info", onClose, duration = 4000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const config = {
    success: { bgColor: "bg-emerald-50", borderColor: "border-emerald-200", textColor: "text-emerald-800", icon: FaCheckCircle, iconColor: "text-emerald-600" },
    error: { bgColor: "bg-rose-50", borderColor: "border-rose-200", textColor: "text-rose-800", icon: FaExclamationTriangle, iconColor: "text-rose-600" },
    warning: { bgColor: "bg-amber-50", borderColor: "border-amber-200", textColor: "text-amber-800", icon: FaExclamationTriangle, iconColor: "text-amber-600" },
    info: { bgColor: "bg-sky-50", borderColor: "border-sky-200", textColor: "text-sky-800", icon: FaInfoCircle, iconColor: "text-sky-600" },
  };

  const c = config[type] || config.info;
  const Icon = c.icon;

  return (
    <div className={`${c.bgColor} ${c.borderColor} border rounded-lg px-4 py-3 flex items-center gap-3 shadow-md animate-slideIn`}>
      <Icon className={`${c.iconColor} flex-shrink-0`} size={18} />
      <p className={`${c.textColor} text-sm flex-1 font-medium`}>{message}</p>
      <button onClick={() => setVisible(false)} className={`${c.textColor} hover:opacity-60 transition flex-shrink-0`}>
        <FaTimes size={14} />
      </button>
    </div>
  );
}
