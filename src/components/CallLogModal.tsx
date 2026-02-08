import React from "react";
import { Trash2, Phone, X } from "lucide-react"; // Import icon
import { Icon } from "../interfaces/Icon";
import { CallLog } from "../interfaces/CallLog";

interface CallLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  callLogs: CallLog[];
  selectedIcon: Icon | null;
  icons: Icon[];
  addCallLog: () => void;
  clearCallLog: () => void;
  // TAMBAHAN: Fungsi untuk menghapus satu log spesifik
  onDeleteLog: (id: number) => void;
}

const CallLogModal: React.FC<CallLogModalProps> = ({
  isOpen,
  onClose,
  callLogs,
  selectedIcon, // Tidak dipakai di UI tapi mungkin butuh untuk logic parent
  icons, // Tidak dipakai di UI tapi mungkin butuh untuk logic parent
  addCallLog,
  clearCallLog,
  onDeleteLog,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[99999]"
      onClick={onClose} // Klik di luar modal akan menutup modal
    >
      <div
        className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-700"
        onClick={(e) => e.stopPropagation()} // Mencegah modal tertutup saat diklik isinya
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
          <div className="flex items-center gap-2">
            <Phone className="text-blue-400" size={24} />
            <h2 className="text-xl font-bold text-white">Call History</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors bg-gray-700 hover:bg-gray-600 rounded-full p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Tombol Add Random */}
          <button
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
            onClick={addCallLog}
          >
            <Phone size={18} fill="currentColor" />
            Add Random Call Log
          </button>

          {/* List Call Logs */}
          <div className="max-h-80 overflow-y-auto space-y-3 pr-1 scrollbar-minimal">
            {callLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500 opacity-50">
                <Phone size={48} className="mb-2" />
                <p>No call logs yet</p>
              </div>
            ) : (
              callLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-gray-700 hover:bg-gray-650 p-3 rounded-lg flex items-center justify-between group transition-colors border border-transparent hover:border-gray-600"
                >
                  {/* Kiri: Avatar & Info */}
                  <div className="flex items-center overflow-hidden">
                    <div className="flex-shrink-0 flex items-center relative">
                      {/* Caller */}
                      <img
                        src={log.caller.src}
                        alt={log.caller.name}
                        className="w-10 h-10 rounded-full border-2 border-gray-800 z-10"
                      />
                      {/* Receiver (Overlap dikit biar keren) */}
                      <img
                        src={log.receiver.src}
                        alt={log.receiver.name}
                        className="w-10 h-10 rounded-full border-2 border-gray-800 -ml-3 z-0 opacity-80"
                      />
                    </div>

                    <div className="ml-3 flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">
                        {log.caller.name}{" "}
                        <span className="text-gray-400 text-xs mx-1">to</span>{" "}
                        {log.receiver.name}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-2">
                        <span>
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                        <span className="text-blue-300">{log.duration}</span>
                      </div>
                    </div>
                  </div>

                  {/* Kanan: Tombol Hapus per Item */}
                  <button
                    onClick={() => onDeleteLog(log.id)}
                    className="ml-2 text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Delete Log"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer: Clear All */}
          {callLogs.length > 0 && (
            <div className="pt-2 border-t border-gray-700">
              <button
                className="w-full text-red-400 hover:text-red-300 hover:bg-red-900/20 py-2 rounded-md text-sm transition-colors flex items-center justify-center gap-2"
                onClick={() => {
                  if (window.confirm("Clear all call history?")) {
                    clearCallLog();
                  }
                }}
              >
                <Trash2 size={14} />
                Clear All History
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallLogModal;
