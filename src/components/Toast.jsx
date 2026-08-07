import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes, FaExclamationCircle } from "react-icons/fa";
import { useEffect, useState } from "react";

const config = {
  success: { bg: "bg-success-50", border: "border-success-200", text: "text-success-700", icon: FaCheckCircle, iconColor: "text-success-500" },
  error: { bg: "bg-danger-50", border: "border-danger-200", text: "text-danger-700", icon: FaExclamationCircle, iconColor: "text-danger-500" },
  warning: { bg: "bg-warning-50", border: "border-warning-200", text: "text-warning-700", icon: FaExclamationTriangle, iconColor: "text-warning-500" },
  info: { bg: "bg-primary-50", border: "border-primary-200", text: "text-primary-700", icon: FaInfoCircle, iconColor: "text-primary-500" },
};

export default function Toast({ message, type = "info", onClose, duration = 4000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose?.(), 200);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const c = config[type] || config.info;
  const Icon = c.icon;

  return (
    <div
      className={`${c.bg} ${c.border} border animate-slideIn rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg min-w-[280px] max-w-md`}
      role="alert"
    >
      <Icon className={`${c.iconColor} shrink-0`} size={18} />
      <p className={`${c.text} text-sm flex-1 font-medium leading-snug`}>{message}</p>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onClose?.(), 200); }}
        className={`${c.text} hover:opacity-60 transition shrink-0 p-0.5 rounded`}
        aria-label="Fechar"
      >
        <FaTimes size={14} />
      </button>
    </div>
  );
}
