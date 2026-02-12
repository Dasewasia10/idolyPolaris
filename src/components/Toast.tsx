import React, { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  isSuccess: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, isSuccess, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, isSuccess, onClose]);

  if (!message) return null;

  return (
    <div
      className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-[9999] flex items-center justify-between p-4 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md border animate-in slide-in-from-top-4 duration-300 min-w-[320px] max-w-[90%]
        ${
          isSuccess
            ? "bg-green-900/80 border-green-500/50 text-green-100"
            : "bg-red-900/80 border-red-500/50 text-red-100"
        }
      `}
    >
      <div className="flex items-center gap-3">
        {isSuccess ? (
          <CheckCircle size={20} className="text-green-400" />
        ) : (
          <XCircle size={20} className="text-red-400" />
        )}
        <span className="text-sm font-semibold tracking-wide">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="ml-4 p-1 hover:bg-white/10 rounded-full transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
