import { 
  GitBranch, 
  AlertCircle, 
  CheckCircle2, 
  Terminal, 
  Users, 
  Radio, 
  Code2 
} from 'lucide-react';

export default function StatusBar({
  activeLanguage = 'javascript',
  collaboratorCount = 0,
  isBottomPanelOpen,
  onToggleBottomPanel,
  tabSize = 2,
  onShareClick
}) {
  return (
    <footer className="h-6 border-t border-[#2e2e35] bg-[#141416] px-3 flex items-center justify-between text-[11px] text-[#9999a8] select-none z-10 flex-shrink-0">
      {/* Left items: Branch, Errors, Terminal Toggle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
          <GitBranch className="w-3 h-3 text-[#6366f1]" />
          <span>main</span>
        </div>

        <div className="flex items-center gap-1.5 text-[#5c5c6a] hover:text-white cursor-pointer transition-colors">
          <span className="flex items-center gap-0.5">
            <AlertCircle className="w-3 h-3 text-[#22c55e]" />
            <span>0</span>
          </span>
          <span className="flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5c5c6a]"></span>
            <span>0</span>
          </span>
        </div>

        <button
          onClick={onToggleBottomPanel}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
            isBottomPanelOpen ? 'text-[#6366f1] bg-[#202024]' : 'hover:text-white'
          }`}
          title="Toggle Terminal Panel (Ctrl+`)"
        >
          <Terminal className="w-3 h-3" />
          <span>Terminal</span>
        </button>
      </div>

      {/* Right items: Encoding, Spaces, Language, Collaborator Status */}
      <div className="flex items-center gap-3.5">
        <span className="hidden sm:inline hover:text-white cursor-pointer">UTF-8</span>
        <span className="hidden sm:inline hover:text-white cursor-pointer">Spaces: {tabSize}</span>
        
        <div className="flex items-center gap-1 hover:text-white cursor-pointer capitalize">
          <Code2 className="w-3 h-3 text-[#6366f1]" />
          <span>{activeLanguage}</span>
        </div>

        <button
          onClick={onShareClick}
          className="flex items-center gap-1.5 text-[#22c55e] hover:text-[#4ade80] font-medium px-1.5 py-0.5 rounded hover:bg-[#202024] transition-colors cursor-pointer"
          title="View active collaborators"
        >
          <Users className="w-3 h-3" />
          <span>{collaboratorCount} Live</span>
        </button>
      </div>
    </footer>

  );
}
