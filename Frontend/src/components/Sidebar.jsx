import { useState } from 'react';
import { 
  FilePlus, 
  FolderPlus, 
  ChevronRight, 
  ChevronDown, 
  FileCode, 
  FileText, 
  Trash2, 
  Edit3, 
  Copy, 
  Share2, 
  Users, 
  Radio, 
  Search, 
  Settings as SettingsIcon,
  Shield,
  Clock,
  Sparkles,
  Sliders,
  Check,
  X
} from 'lucide-react';
import { getFileBadgeColor, getLanguageByFilename } from '../utils/languages';
import UserAvatar from './UserAvatar';

export default function Sidebar({
  activeView, // 'explorer' | 'collaborators' | 'search' | 'activity' | 'settings'
  project,
  isOwner,
  files = [],
  activeFileId,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  activeUsers = [],
  currentUser,
  onShareClick,
  onRemoveCollaborator,
  activityLogs = [],
  editorSettings,
  onUpdateEditorSettings,
  onDeleteProject,
  onAddToast,
  width,
  onStartResize
}) {
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [editingFileId, setEditingFileId] = useState(null);
  const [editFileName, setEditFileName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedProjectId, setCopiedProjectId] = useState(false);

  // File creation handler
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newFileName.trim()) {
      setIsCreatingFile(false);
      return;
    }
    const cleanName = newFileName.trim();
    const lang = getLanguageByFilename(cleanName);
    onCreateFile({
      name: cleanName,
      language: lang,
      content: `// ${cleanName}\n`
    });
    setNewFileName('');
    setIsCreatingFile(false);
  };

  // File rename handler
  const handleRenameSubmit = (fileId) => {
    if (!editFileName.trim()) {
      setEditingFileId(null);
      return;
    }
    onRenameFile(fileId, editFileName.trim());
    setEditingFileId(null);
  };

  const handleCopyId = async () => {
    if (!project?.id) return;
    try {
      await navigator.clipboard.writeText(project.id);
      setCopiedProjectId(true);
      onAddToast?.({
        type: 'success',
        title: 'Project ID Copied',
        message: `${project.id} copied to clipboard.`
      });
      setTimeout(() => setCopiedProjectId(false), 2000);
    } catch {
      onAddToast?.({ type: 'error', title: 'Copy Failed', message: 'Could not copy ID.' });
    }
  };

  // Filter search results across all files
  const searchResults = searchQuery.trim()
    ? files.flatMap(f => {
        const lines = (f.content || '').split('\n');
        const matches = [];
        lines.forEach((line, index) => {
          if (line.toLowerCase().includes(searchQuery.toLowerCase())) {
            matches.push({
              file: f,
              lineNumber: index + 1,
              content: line.trim()
            });
          }
        });
        return matches;
      })
    : [];

  return (
    <aside 
      style={{ width }} 
      className="bg-[#18181b] border-r border-zinc-800/80 flex flex-col h-full select-none relative flex-shrink-0"
    >
      {/* Resizer Handle */}
      <div 
        onMouseDown={onStartResize}
        className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-indigo-500/50 transition-colors z-20"
        title="Drag to resize sidebar"
      />

      {/* VIEW 1: EXPLORER */}
      {activeView === 'explorer' && (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-9 px-3 border-b border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-zinc-300">
            <span className="uppercase tracking-wider text-[11px] font-bold text-zinc-400">
              Explorer
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsCreatingFile(true)}
                title="New File"
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <FilePlus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onShareClick}
                title="Share Project"
                className="p-1 text-zinc-400 hover:text-indigo-400 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Project Title and ID Pill */}
          <div className="px-3 py-2 border-b border-zinc-800/50 bg-zinc-900/30 flex items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-tight truncate">
                {project?.name || 'Workspace'}
              </span>
            </div>
            <button
              onClick={handleCopyId}
              title="Copy Project ID"
              className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors flex items-center gap-1 flex-shrink-0 cursor-pointer"
            >
              <span>{project?.id}</span>
              {copiedProjectId ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
            </button>
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto py-1">
            {/* Inline New File Input */}
            {isCreatingFile && (
              <form onSubmit={handleCreateSubmit} className="px-3 py-1 flex items-center gap-1">
                <FileCode className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onBlur={() => {
                    if (!newFileName.trim()) setIsCreatingFile(false);
                  }}
                  placeholder="filename.js"
                  className="flex-1 px-1.5 py-0.5 text-xs bg-zinc-900 border border-indigo-500 rounded text-white focus:outline-none"
                />
              </form>
            )}

            {files.map(file => {
              const isActive = file.id === activeFileId;
              const isEditing = editingFileId === file.id;

              return (
                <div
                  key={file.id}
                  onClick={() => onSelectFile(file.id)}
                  className={`group px-3 py-1.5 flex items-center justify-between text-xs cursor-pointer transition-colors ${
                    isActive 
                      ? 'bg-zinc-800/80 text-white font-medium border-l-2 border-indigo-500' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <FileCode className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                    
                    {isEditing ? (
                      <input
                        type="text"
                        autoFocus
                        value={editFileName}
                        onChange={(e) => setEditFileName(e.target.value)}
                        onBlur={() => handleRenameSubmit(file.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameSubmit(file.id);
                          if (e.key === 'Escape') setEditingFileId(null);
                        }}
                        className="flex-1 px-1 py-0 bg-zinc-900 border border-indigo-500 rounded text-white text-xs focus:outline-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="truncate">{file.name}</span>
                    )}
                  </div>

                  {/* Actions on hover */}
                  {!isEditing && (
                    <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingFileId(file.id);
                          setEditFileName(file.name);
                        }}
                        title="Rename file"
                        className="p-1 hover:text-white rounded hover:bg-zinc-700/60"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      {files.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteFile(file.id);
                          }}
                          title="Delete file"
                          className="p-1 hover:text-rose-400 rounded hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Collaborators Presence Bar in Explorer Footer */}
          <div className="p-3 border-t border-zinc-800/80 bg-zinc-900/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3 h-3 text-indigo-400" />
                Collaborators ({activeUsers.length})
              </span>
              <button
                onClick={onShareClick}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium"
              >
                + Invite
              </button>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {activeUsers.slice(0, 6).map((user, idx) => (
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
              {activeUsers.length > 6 && (
                <span className="text-[10px] text-zinc-400">+{activeUsers.length - 6}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: COLLABORATORS */}
      {activeView === 'collaborators' && (
        <div className="flex flex-col h-full">
          <div className="h-9 px-3 border-b border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-zinc-300">
            <span className="uppercase tracking-wider text-[11px] font-bold text-zinc-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              Collaborators ({activeUsers.length})
            </span>
            <button
              onClick={onShareClick}
              className="text-[11px] px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1 cursor-pointer"
            >
              <Share2 className="w-3 h-3" />
              <span>Invite</span>
            </button>
          </div>

          <div className="p-3 bg-zinc-900/40 border-b border-zinc-800/60 text-xs text-zinc-400">
            <div className="flex items-center justify-between mb-1">
              <span>Project ID:</span>
              <button 
                onClick={handleCopyId}
                className="font-mono font-bold text-indigo-400 hover:underline flex items-center gap-1"
              >
                {project?.id}
                <Copy className="w-2.5 h-2.5" />
              </button>
            </div>
            <div className="text-[11px]">
              Share this ID with teammates so they can join and write code with you simultaneously.
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {activeUsers.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-400">
                No active collaborators currently connected. Share your Project ID to collaborate!
              </div>
            ) : (
              activeUsers.map((user, idx) => {
                const isUserOwner = user.username === project?.owner || user.isOwner;
                return (
                  <div
                    key={user.id || user.username || idx}
                    className="p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <UserAvatar
                        name={user.username || 'Collaborator'}
                        customColor={user.color}
                        size={28}
                        showStatus={true}
                        isOnline={true}
                        isOwner={isUserOwner}
                      />
                      <div className="overflow-hidden">
                        <div className="font-medium text-slate-200 flex items-center gap-1.5 truncate">
                          <span className="truncate">{user.username}</span>
                          {isUserOwner && (
                            <span className="px-1.5 py-0.2 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] rounded font-semibold flex-shrink-0">
                              Owner
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Online
                        </div>
                      </div>
                    </div>

                    {isOwner && !isUserOwner && onRemoveCollaborator && (
                      <button
                        onClick={() => onRemoveCollaborator(user)}
                        title="Remove collaborator"
                        className="p-1 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: SEARCH */}
      {activeView === 'search' && (
        <div className="flex flex-col h-full">
          <div className="h-9 px-3 border-b border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-zinc-400">
            <span className="uppercase tracking-wider text-[11px] font-bold">Search Project</span>
          </div>

          <div className="p-3 border-b border-zinc-800/60">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across files..."
                className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700/80 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {!searchQuery.trim() ? (
              <div className="p-4 text-center text-xs text-zinc-500">
                Type text above to search all code files in this project.
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-500">
                No matching lines found for &quot;{searchQuery}&quot;
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-zinc-400 px-2 py-1">
                  {searchResults.length} match{searchResults.length !== 1 ? 'es' : ''} found
                </div>
                {searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectFile(result.file.id)}
                    className="w-full text-left p-2 rounded-lg bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 text-xs transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-indigo-400 font-medium mb-0.5">
                      <span className="truncate">{result.file.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">L{result.lineNumber}</span>
                    </div>
                    <div className="font-mono text-[11px] text-zinc-300 truncate">
                      {result.content}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 4: LIVE ACTIVITY FEED */}
      {activeView === 'activity' && (
        <div className="flex flex-col h-full">
          <div className="h-9 px-3 border-b border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-zinc-400">
            <span className="uppercase tracking-wider text-[11px] font-bold flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              Live Activity Stream
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {activityLogs.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-500">
                Real-time collaboration events will appear here as users edit and join.
              </div>
            ) : (
              activityLogs.map((log, index) => (
                <div key={log.id || index} className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/70 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-zinc-500">
                    <span className="font-medium text-indigo-300">{log.user || 'Collaborator'}</span>
                    <span>{log.time || 'just now'}</span>
                  </div>
                  <div className="text-slate-300 leading-snug">
                    {log.message}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW 5: SETTINGS */}
      {activeView === 'settings' && (
        <div className="flex flex-col h-full">
          <div className="h-9 px-3 border-b border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-zinc-400">
            <span className="uppercase tracking-wider text-[11px] font-bold flex items-center gap-1.5">
              <SettingsIcon className="w-3.5 h-3.5 text-indigo-400" />
              Project Settings
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-zinc-300">
            {/* Project Info */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Workspace Identification
              </label>
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Project ID:</span>
                  <button
                    onClick={handleCopyId}
                    className="font-mono font-bold text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    {project?.id}
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Owner:</span>
                  <span className="text-white font-medium">{project?.owner || 'You'}</span>
                </div>
              </div>
            </div>

            {/* Editor Preferences */}
            <div className="space-y-3">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-indigo-400" />
                Editor Preferences
              </label>

              {/* Font Size */}
              <div>
                <div className="flex justify-between mb-1">
                  <span>Font Size</span>
                  <span className="text-indigo-400 font-mono">{editorSettings?.fontSize || 14}px</span>
                </div>
                <input
                  type="range"
                  min="11"
                  max="22"
                  value={editorSettings?.fontSize || 14}
                  onChange={(e) => onUpdateEditorSettings?.({ fontSize: Number(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>

              {/* Tab Size */}
              <div className="flex items-center justify-between">
                <span>Tab Indentation</span>
                <select
                  value={editorSettings?.tabSize || 2}
                  onChange={(e) => onUpdateEditorSettings?.({ tabSize: Number(e.target.value) })}
                  className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-white"
                >
                  <option value={2}>2 Spaces</option>
                  <option value={4}>4 Spaces</option>
                </select>
              </div>

              {/* Minimap Toggle */}
              <div className="flex items-center justify-between">
                <span>Monaco Minimap</span>
                <button
                  onClick={() => onUpdateEditorSettings?.({ minimap: !editorSettings?.minimap })}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    editorSettings?.minimap ? 'bg-indigo-600' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      editorSettings?.minimap ? 'left-4.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Word Wrap */}
              <div className="flex items-center justify-between">
                <span>Word Wrap</span>
                <button
                  onClick={() => onUpdateEditorSettings?.({ wordWrap: editorSettings?.wordWrap === 'on' ? 'off' : 'on' })}
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                    editorSettings?.wordWrap === 'on' ? 'bg-indigo-600' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      editorSettings?.wordWrap === 'on' ? 'left-4.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Danger Zone: Delete Project (if owner) */}
            {isOwner && (
              <div className="pt-4 border-t border-zinc-800/80 space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-rose-400">
                  Danger Zone
                </label>
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete project ${project?.name}? This action cannot be undone.`)) {
                      onDeleteProject?.(project?.id);
                    }
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Project</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
