import React from "react";
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
}

const CallLogModal: React.FC<CallLogModalProps> = ({
  isOpen,
  onClose,
  callLogs,
  selectedIcon,
  icons,
  addCallLog,
  clearCallLog,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Call Logs</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ×
          </button>
        </div>

        <div className="space-y-4">
          <button
            className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-md"
            onClick={addCallLog}
          >
            Add Random Call Log
          </button>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {callLogs.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No call logs yet</p>
            ) : (
              callLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-gray-700 p-3 rounded-lg flex items-center"
                >
                  <div className="flex-shrink-0 flex items-center">
                    <img
                      src={log.caller.src}
                      alt={log.caller.name}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <span className="text-xs">→</span>
                    <img
                      src={log.receiver.src}
                      alt={log.receiver.name}
                      className="w-8 h-8 rounded-full ml-2"
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-sm">
                      {log.caller.name} → {log.receiver.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(log.timestamp).toLocaleString()} •{" "}
                      {log.duration}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {callLogs.length > 0 && (
            <>
              <button
                className="w-full bg-red-600 hover:bg-red-500 text-white py-2 rounded-md"
                onClick={clearCallLog}
              >
                Clear Call Log
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallLogModal;
