import { useState } from 'react';
import { 
  Terminal as TerminalIcon, 
  AlertCircle, 
  Radio, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Maximize2, 
  Minimize2,
  Clock,
  CheckCircle2,
  Bug
} from 'lucide-react';

export default function BottomPanel({
  isOpen,
  onClose,
  height,
  onStartResize,
  executionResult,
  isRunning,
  collaborationLogs = [],
  onClearOutput
}) {
  const [activeTab, setActiveTab] = useState('terminal'); // 'terminal' | 'output' | 'problems' | 'collab'
  const [isMaximized, setIsMaximized] = useState(false);

  if (!isOpen) return null;

  const panelHeight = isMaximized ? 'calc(100vh - 120px)' : `${height}px`;

  return (
    <div 
      style={{ height: panelHeight }}
      className="border-t border-[#2e2e35] bg-[#141416] flex flex-col select-none relative z-10 flex-shrink-0 transition-[height] duration-150"
    >
      {/* Top Resize Drag Handle */}
      {!isMaximized && (
        <div 
          onMouseDown={onStartResize}
          className="absolute -top-1 left-0 right-0 h-2 cursor-row-resize hover:bg-[#6366f1]/40 transition-colors z-20"
          title="Drag to resize panel"
        />
      )}

      {/* Header and Tabs */}
      <div className="h-8 border-b border-[#2e2e35] px-3 bg-[#18181b] flex items-center justify-between text-xs text-[#9999a8]">
        <div className="flex items-center gap-1 h-full">
          {/* Terminal Tab */}
          <button
            onClick={() => setActiveTab('terminal')}
            className={`h-full px-3 flex items-center gap-1.5 border-b-2 text-[11px] font-medium transition-colors cursor-pointer ${
              activeTab === 'terminal' 
                ? 'border-[#6366f1] text-white bg-[#141416]' 
                : 'border-transparent hover:text-white'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5 text-[#6366f1]" />
            <span>Terminal</span>
            {executionResult && (
              <span className={`w-1.5 h-1.5 rounded-full ${executionResult.exitCode === 0 ? 'bg-[#22c55e]' : 'bg-[#ef4444]'}`} />
            )}
          </button>

          {/* Problems Tab */}
          <button
            onClick={() => setActiveTab('problems')}
            className={`h-full px-3 flex items-center gap-1.5 border-b-2 text-[11px] font-medium transition-colors cursor-pointer ${
              activeTab === 'problems' 
                ? 'border-[#6366f1] text-white bg-[#141416]' 
                : 'border-transparent hover:text-white'
            }`}
          >
            <Bug className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>Problems</span>
            <span className="text-[10px] px-1 rounded bg-[#202024] text-[#9999a8]">0</span>
          </button>

          {/* Collaboration Logs Tab */}
          <button
            onClick={() => setActiveTab('collab')}
            className={`h-full px-3 flex items-center gap-1.5 border-b-2 text-[11px] font-medium transition-colors cursor-pointer ${
              activeTab === 'collab' 
                ? 'border-[#6366f1] text-white bg-[#141416]' 
                : 'border-transparent hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-[#22c55e]" />
            <span>Collaboration Logs</span>
            {collaborationLogs.length > 0 && (
              <span className="text-[10px] px-1 rounded bg-[#202024] text-[#6366f1] font-mono">
                {collaborationLogs.length}
              </span>
            )}
          </button>
        </div>

        {/* Panel Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={onClearOutput}
            title="Clear output"
            className="p-1 text-[#5c5c6a] hover:text-white rounded hover:bg-[#202024] transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            title={isMaximized ? "Restore panel size" : "Maximize panel"}
            className="p-1 text-[#5c5c6a] hover:text-white rounded hover:bg-[#202024] transition-colors cursor-pointer"
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            title="Close panel (Ctrl+`)"
            className="p-1 text-[#5c5c6a] hover:text-white rounded hover:bg-[#202024] transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Panel Body */}
      <div className="flex-1 p-3 overflow-y-auto font-mono text-xs select-text bg-[#141416]">
        {/* Terminal Tab Body */}
        {activeTab === 'terminal' && (
          <div>
            {isRunning ? (
              <div className="flex items-center gap-2 text-[#6366f1] animate-pulse">
                <span>[Running script execution...]</span>
              </div>
            ) : executionResult ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-[11px] text-[#5c5c6a] pb-2 border-b border-[#2e2e35]">
                  <span className="flex items-center gap-1 text-[#22c55e]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Process finished with exit code {executionResult.exitCode}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[#9999a8]">
                    <Clock className="w-3 h-3" />
                    {executionResult.durationMs || 12}ms
                  </span>
                </div>

                {executionResult.stdout && (
                  <pre className="text-[#e8e8ed] leading-relaxed whitespace-pre-wrap">
                    {executionResult.stdout}
                  </pre>
                )}

                {executionResult.stderr && (
                  <pre className="text-[#ef4444] leading-relaxed whitespace-pre-wrap">
                    {executionResult.stderr}
                  </pre>
                )}
              </div>
            ) : (
              <div className="text-[#5c5c6a] text-xs">
                Terminal ready. Click <span className="text-[#22c55e] font-semibold">Run</span> or press <kbd className="text-[#9999a8] bg-[#202024] px-1 py-0.5 rounded border border-[#2e2e35]">Ctrl+Enter</kbd> to execute current code.
              </div>
            )}
          </div>
        )}

        {/* Problems Tab Body */}
        {activeTab === 'problems' && (
          <div className="text-[#9999a8] space-y-1">
            <div className="flex items-center gap-2 text-[#22c55e] mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>No syntax diagnostics or problems detected in workspace files.</span>
            </div>
            <p className="text-[#5c5c6a] text-[11px]">
              Static analysis ready.
            </p>
          </div>
        )}

        {/* Collaboration Logs Tab Body */}
        {activeTab === 'collab' && (
          <div className="space-y-1.5">
            {collaborationLogs.length === 0 ? (
              <div className="text-[#5c5c6a]">
                Listening for real-time WebSocket connection and Yjs CRDT synchronization events...
              </div>
            ) : (
              collaborationLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px]">
                  <span className="text-[#5c5c6a] select-none">[{log.time}]</span>
                  <span className={`font-semibold ${
                    log.type === 'sync' ? 'text-[#6366f1]' : 
                    log.type === 'join' ? 'text-[#22c55e]' : 
                    log.type === 'leave' ? 'text-[#f59e0b]' : 'text-[#9999a8]'
                  }`}>
                    {log.type.toUpperCase()}:
                  </span>
                  <span className="text-[#e8e8ed]">{log.message}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>

  );
}
