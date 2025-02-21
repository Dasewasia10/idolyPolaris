import React, { useState, useEffect } from "react";

interface ToastProps {
  message: string;
  isSuccess: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, isSuccess }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (message) {
      setVisible(true); // Tampilkan toast saat pesan baru diberikan

      // Menyembunyikan toast setelah 3 detik
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);

      return () => clearTimeout(timer); // Membersihkan timer saat komponen di-unmount atau message berubah
    }
  }, [message, isSuccess]); // Menambahkan message dan isSuccess ke dalam array dependensi

  return (
    visible && (
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
        key={message + isSuccess} // Gunakan key untuk memastikan re-render
      >
        {message}
      </div>
    )
  );
};

export default Toast;
