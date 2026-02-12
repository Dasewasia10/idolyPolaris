import React from "react";
import { Trash2, Phone, X, ArrowRight, History, Activity } from "lucide-react";
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
  onDeleteLog: (id: number) => void;
}

const CallLogModal: React.FC<CallLogModalProps> = ({
  isOpen,
  onClose,
  callLogs,
  addCallLog,
  clearCallLog,
  onDeleteLog,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#161b22] w-full max-w-lg rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- HEADER --- */}
        <div className="p-5 border-b border-white/10 bg-gradient-to-r from-purple-900/20 to-transparent flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]">
              <History size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-purple-400 tracking-widest uppercase block">
                System Log
              </span>
              <h2 className="text-lg font-black text-white italic tracking-tighter">
                COMMUNICATION HISTORY
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- BODY LIST --- */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {/* Tombol Add (Styled) */}
          <button
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-[0.98] border border-blue-400/30 mb-4"
            onClick={addCallLog}
          >
            <Phone size={16} className="animate-pulse" />
            GENERATE NEW LOG
          </button>

          {callLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-600 border-2 border-dashed border-white/5 rounded-xl">
              <Activity size={48} className="mb-3 opacity-20" />
              <p className="font-mono text-xs tracking-widest uppercase">
                No Data Found
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {callLogs.map((log, index) => (
                <div
                  key={log.id}
                  className="group relative bg-[#0d1117] hover:bg-[#1f2937] border border-white/5 hover:border-purple-500/30 rounded-xl p-3 transition-all duration-300 animate-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Background Connection Line */}
                  <div className="absolute top-1/2 left-8 right-16 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent -z-0"></div>

                  <div className="flex items-center justify-between relative z-10">
                    {/* Visual Koneksi */}
                    <div className="flex items-center gap-4 flex-1">
                      {/* Caller */}
                      <div className="flex flex-col items-center gap-1 min-w-[3rem]">
                        <img
                          src={log.caller.src}
                          alt={log.caller.name}
                          className="w-10 h-10 rounded-full border border-white/20 shadow-md object-cover"
                        />
                        <span className="text-[9px] text-gray-400 font-bold truncate max-w-[4rem] text-center">
                          {log.caller.name}
                        </span>
                      </div>

                      {/* Direction Arrow & Time */}
                      <div className="flex flex-col items-center justify-center flex-1">
                        <span className="text-[9px] font-mono text-gray-500 mb-1">
                          {log.duration}
                        </span>
                        <div className="flex items-center text-purple-500/50 group-hover:text-purple-400 transition-colors">
                          <div className="h-1 w-1 rounded-full bg-current mr-1"></div>
                          <div className="h-[1px] w-full bg-current min-w-[20px]"></div>
                          <ArrowRight size={14} />
                        </div>
                        <span className="text-[8px] font-mono text-gray-600 mt-1">
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Receiver */}
                      <div className="flex flex-col items-center gap-1 min-w-[3rem]">
                        <img
                          src={log.receiver.src}
                          alt={log.receiver.name}
                          className="w-10 h-10 rounded-full border border-white/20 shadow-md object-cover grayscale-[30%] group-hover:grayscale-0 transition-all"
                        />
                        <span className="text-[9px] text-gray-400 font-bold truncate max-w-[4rem] text-center">
                          {log.receiver.name}
                        </span>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => onDeleteLog(log.id)}
                      className="ml-4 p-2 text-gray-600 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
                      title="Remove Entry"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- FOOTER --- */}
        {callLogs.length > 0 && (
          <div className="p-4 border-t border-white/10 bg-[#0d1117]">
            <button
              className="w-full text-xs font-bold text-red-400 hover:text-red-300 bg-red-900/10 hover:bg-red-900/30 border border-red-900/30 py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              onClick={() => {
                if (window.confirm("Purge all communication logs?")) {
                  clearCallLog();
                }
              }}
            >
              <Trash2 size={14} />
              PURGE ALL LOGS
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallLogModal;
