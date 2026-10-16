import { useState } from 'react';
import { 
  Play, 
  Square, 
  Share2, 
  Copy, 
  Check, 
  Sun, 
  Moon, 
  ChevronDown, 
  CheckCircle2, 
  RefreshCw,
  LayoutDashboard,
  Shield,
  Wifi,
  WifiOff
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../utils/languages';
import UserAvatar from './UserAvatar';

export default function Navbar({
  project,
  isOwner,
  connectionStatus,
  syncStatus,
  activeUsers = [],
  currentUser,
  isRunningCode,
  activeLanguage,
  onLanguageChange,
  onRunCode,
  onStopCode,
  onShareClick,
  onNavigateHome,
  onAddToast,
  theme,
  onToggleTheme
}) {
  const [copiedId, setCopiedId] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const handleCopyProjectId = async () => {
    if (!project?.id) return;
    try {
      await navigator.clipboard.writeText(project.id);
      setCopiedId(true);
      onAddToast?.({ type: 'success', title: 'Copied', message: `${project.id} copied to clipboard` });
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      onAddToast?.({ type: 'error', title: 'Copy Failed', message: 'Could not copy Project ID.' });
    }
  };

  const connColor = connectionStatus === 'connected' ? '#22c55e'
    : connectionStatus === 'connecting' ? '#f59e0b'
    : '#ef4444';

  return (
    <header className="h-11 border-b border-[#2e2e35] bg-[#1c1c20] px-3 flex items-center justify-between text-[#e8e8ed] select-none z-20 flex-shrink-0">
      {/* Left: brand + project name + ID */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onNavigateHome}
          title="Back to Dashboard"
          className="flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-[#2a2a32] text-[#9999a8] hover:text-white transition-colors cursor-pointer"
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-[#6366f1]" />
          <span className="text-xs font-semibold text-white hidden sm:inline">CodeSync</span>
        </button>

        <span className="w-px h-4 bg-[#2e2e35]" />

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-white max-w-[140px] truncate" title={project?.name}>
            {project?.name || 'Workspace'}
          </span>

          {project?.id && (
            <button
              onClick={handleCopyProjectId}
              title="Click to copy Project ID"
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#202024] hover:bg-[#2a2a32] border border-[#2e2e35] font-mono text-[10px] font-semibold text-[#6366f1] transition-colors cursor-pointer"
            >
              <span>{project.id}</span>
              {copiedId
                ? <Check className="w-2.5 h-2.5 text-[#22c55e]" />
                : <Copy className="w-2.5 h-2.5 opacity-50" />
              }
            </button>
          )}

          {isOwner && (
            <span className="hidden md:flex items-center gap-0.5 text-[10px] text-[#b45309]">
              <Shield className="w-2.5 h-2.5" /> Owner
            </span>
          )}
        </div>
      </div>

      {/* Center: connection + sync */}
      <div className="hidden md:flex items-center gap-3 text-[11px] text-[#9999a8]">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full animate-status-pulse" style={{ backgroundColor: connColor }} />
          <span style={{ color: connColor }}>
            {connectionStatus === 'connected' ? 'Live'
              : connectionStatus === 'connecting' ? 'Connecting'
              : 'Offline'}
          </span>
        </div>
        <span className="text-[#2e2e35]">·</span>
        <div className="flex items-center gap-1">
          {syncStatus === 'syncing'
            ? <><RefreshCw className="w-2.5 h-2.5 animate-spin text-[#6366f1]" /><span>Syncing</span></>
            : <><CheckCircle2 className="w-2.5 h-2.5 text-[#5c5c6a]" /><span>Saved</span></>
          }
        </div>
      </div>

      {/* Right: run, lang, share, theme, user */}
      <div className="flex items-center gap-1.5">
        {/* Run / Stop */}
        {isRunningCode ? (
          <button
            onClick={onStopCode}
            className="flex items-center gap-1.5 h-7 px-3 bg-[#ef4444]/10 hover:bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/25 text-xs font-medium rounded transition-colors cursor-pointer"
          >
            <Square className="w-3 h-3 fill-current" />
            <span className="hidden sm:inline">Stop</span>
          </button>
        ) : (
          <button
            onClick={onRunCode}
            title="Run Code (Ctrl+Enter)"
            className="flex items-center gap-1.5 h-7 px-3 bg-[#22c55e]/10 hover:bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/25 text-xs font-semibold rounded transition-colors cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Run</span>
          </button>
        )}

        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
            className="flex items-center gap-1 h-7 px-2.5 rounded bg-[#202024] hover:bg-[#2a2a32] border border-[#2e2e35] text-xs text-[#9999a8] hover:text-white transition-colors cursor-pointer"
          >
            <span className="capitalize">{activeLanguage || 'JavaScript'}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
          {isLangDropdownOpen && (
            <div className="absolute right-0 mt-1 w-36 py-1 bg-[#1c1c20] border border-[#2e2e35] rounded shadow-xl z-50">
              {SUPPORTED_LANGUAGES.map(lang => (
                <button
                  key={lang.id}
                  onClick={() => { onLanguageChange(lang.id); setIsLangDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-[#26262c] transition-colors ${
                    activeLanguage === lang.id ? 'text-[#6366f1] font-semibold' : 'text-[#9999a8]'
                  }`}
                >
                  <span>{lang.name}</span>
                  <span className="text-[10px] text-[#5c5c6a] font-mono">{lang.ext}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Active Collaborators Avatar Stack */}
        {activeUsers.length > 0 && (
          <div className="hidden lg:flex items-center -space-x-1.5 mr-1" title={`${activeUsers.length} collaborator(s) online`}>
            {activeUsers.slice(0, 4).map((user, idx) => (
              <UserAvatar
                key={user.id || user.username || idx}
                name={user.username || 'Collaborator'}
                customColor={user.color}
                size={22}
                showStatus={true}
                isOnline={true}
                isOwner={user.username === project?.owner || user.isOwner}
              />
            ))}
            {activeUsers.length > 4 && (
              <span className="w-5 h-5 rounded-full bg-[#202024] border border-[#2e2e35] text-[9px] font-medium text-[#9999a8] flex items-center justify-center">
                +{activeUsers.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Share */}
        <button
          onClick={onShareClick}
          className="flex items-center gap-1.5 h-7 px-3 bg-[#6366f1] hover:bg-[#5254cc] text-white text-xs font-semibold rounded transition-colors cursor-pointer"
        >
          <Share2 className="w-3 h-3" />
          <span className="hidden sm:inline">Share</span>
          {activeUsers.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-white/20 text-[9px] font-bold flex items-center justify-center">
              {activeUsers.length}
            </span>
          )}
        </button>

        {/* Theme */}
        <button
          onClick={onToggleTheme}
          title={theme === 'vs-dark' ? 'Light theme' : 'Dark theme'}
          className="w-7 h-7 flex items-center justify-center text-[#9999a8] hover:text-white rounded hover:bg-[#26262c] transition-colors cursor-pointer"
        >
          {theme === 'vs-dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5 text-[#f59e0b]" />}
        </button>

        {/* Current user avatar */}
        <UserAvatar
          name={currentUser?.name || 'Developer'}
          customColor={currentUser?.color}
          size={26}
          showStatus={true}
          isOnline={true}
          isOwner={isOwner}
        />
      </div>
    </header>
  );
}



