import React, { useEffect } from "react";
import { MdCheck, MdCancel } from "react-icons/md";

const Toast = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      bg: "bg-emerald-100 border-emerald-200 text-emerald-700",
      icon: <MdCheck className="h-6 w-6 flex-shrink-0" />,
    },
    error: {
      bg: "bg-rose-100 border-rose-200 text-rose-700",
      icon: <MdCancel className="h-6 w-6 flex-shrink-0" />,
    }
  };

  const current = config[type];

  return (
    <div
      className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-md min-w-[320px] animate-slideIn ${current.bg}`}
    >
      {/* ICON */}
      {current.icon}

      {/* MESSAGE */}
      <span className="font-semibold text-sm flex-1 whitespace-pre-line">
        {message.replace(/\./g, ". \n")}
      </span>

      {/* CLOSE BUTTON */}
      <button
        onClick={onClose}
        className="ml-2 text-slate-400 hover:text-slate-700 transition"
      >
        ✕
      </button>

      {/* CSS ANIMATIONS */}
      <style jsx>{`
        @keyframes slideIn {
          0% { opacity: 0; transform: translateX(100%); }
          100% { opacity: 1; transform: translateX(0); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Toast;