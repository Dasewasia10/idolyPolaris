import React, { useEffect } from "react";
import { FaCheckCircle, FaTimesCircle, FaTimes } from "react-icons/fa";

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
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [message, isSuccess, onClose]);

  if (!message) return null;

  return (
    <div
      className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-[9999]  flex items-center justify-between p-4 rounded-lg shadow-lg ${
        isSuccess ? "bg-green-500" : "bg-red-500"
      } text-white min-w-[300px] max-w-[90%] md:max-w-[400px] ${
        message ? "toast-enter" : "toast-exit"
      }`}
    >
      <div className="flex items-center">
        {isSuccess ? (
          <FaCheckCircle className="mr-3 text-xl" />
        ) : (
          <FaTimesCircle className="mr-3 text-xl" />
        )}
        <span className="text-sm font-medium">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="ml-4 text-white hover:text-white/70 focus:outline-none"
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default Toast;
