import React, { useEffect } from "react";

interface ToastProps {
  message: string;
  isSuccess: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, isSuccess, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose(); // Panggil onClose setelah 3 detik
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message, isSuccess, onClose]);

  return (
    <div
      className="text-xl"
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        backgroundColor: isSuccess ? "#4caf50" : "#f44336",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
      }}
    >
      {message}
    </div>
  );
};

export default Toast;
