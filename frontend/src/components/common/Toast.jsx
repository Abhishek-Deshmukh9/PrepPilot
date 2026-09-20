import React, { useEffect, useState } from "react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

const variantConfig = {
  success: {
    icon: CheckCircle,
    bg: "bg-emerald-950/80 border-emerald-500/30",
    iconColor: "text-emerald-400",
    textColor: "text-emerald-100",
  },
  error: {
    icon: AlertTriangle,
    bg: "bg-rose-950/80 border-rose-500/30",
    iconColor: "text-rose-400",
    textColor: "text-rose-100",
  },
  info: {
    icon: Info,
    bg: "bg-cyan-950/80 border-cyan-500/30",
    iconColor: "text-cyan-400",
    textColor: "text-cyan-100",
  },
};

/**
 * Self-dismissing toast notification.
 * @param {string} message - Text to display
 * @param {"success"|"error"|"info"} variant
 * @param {function} onClose - Called when toast is dismissed
 * @param {number} duration - Auto-dismiss duration in ms (default 4000)
 */
export const Toast = ({ message, variant = "info", onClose, duration = 4000 }) => {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  const config = variantConfig[variant] || variantConfig.info;
  const Icon = config.icon;

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = requestAnimationFrame(() => setVisible(true));

    // Auto-dismiss
    const dismissTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      cancelAnimationFrame(enterTimer);
      clearTimeout(dismissTimer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => {
      onClose?.();
    }, 300); // wait for exit animation
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-[9999] max-w-sm w-full pointer-events-auto
        transition-all duration-300 ease-out
        ${visible && !exiting ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
    >
      <div
        className={`
          flex items-start space-x-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl
          ${config.bg}
        `}
      >
        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${config.iconColor}`} />
        <p className={`text-xs font-medium leading-relaxed flex-1 ${config.textColor}`}>
          {message}
        </p>
        <button
          onClick={handleClose}
          className="p-0.5 rounded-lg text-slate-400 hover:text-white transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

/**
 * Toast container that manages a queue of toasts.
 * Use with: addToast(message, variant)
 */
export const ToastContainer = ({ toasts = [], removeToast }) => {
  return (
    <>
      {toasts.map((toast, idx) => (
        <div
          key={toast.id}
          style={{ top: `${1 + idx * 4.5}rem` }}
          className="fixed right-4 z-[9999]"
        >
          <Toast
            message={toast.message}
            variant={toast.variant}
            duration={toast.duration || 4000}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </>
  );
};

export default Toast;
