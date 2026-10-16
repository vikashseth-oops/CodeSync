import { useState, useRef, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { MonacoBinding } from 'y-monaco';
import { 
  FileCode, 
  X, 
  Plus, 
  ChevronRight, 
  Command, 
  Play, 
  Sparkles, 
  FilePlus, 
  Search,
  Keyboard,
  Users
} from 'lucide-react';
import { getLanguageByFilename } from '../utils/languages';
import UserAvatar from './UserAvatar';

export default function EditorPanel({
  files = [],
  activeFileId,
  openTabIds = [],
  onSelectTab,
  onCloseTab,
  onOpenNewTab,
  ydoc,
  provider,
  activeUsers = [],
  editorSettings,
  theme = 'vs-dark',
  onRunCode,
  onAddToast
}) {
  const editorRef = useRef(null);
  const bindingRef = useRef(null);
  const [isQuickOpenOpen, setIsQuickOpenOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');

  const activeFile = files.find(f => f.id === activeFileId) || files[0];
  const activeLanguage = activeFile ? (activeFile.language || getLanguageByFilename(activeFile.name)) : 'javascript';

  // Mount Monaco Editor and attach Yjs binding
  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;

    // Custom dark theme refinements for modern VS Code aesthetic
    monaco.editor.defineTheme('vscode-dark-modern', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'function', foreground: 'DCDCAA' }
      ],
      colors: {
        'editor.background': '#18181b',
        'editor.foreground': '#d4d4d8',
        'editorLineNumber.foreground': '#52525b',
        'editorLineNumber.activeForeground': '#a1a1aa',
        'editor.lineHighlightBackground': '#27272a40',
        'editorCursor.foreground': '#6366f1',
        'editorWhitespace.foreground': '#27272a',
        'editorIndentGuide.background1': '#27272a',
        'editorIndentGuide.activeBackground1': '#3f3f46',
        'editor.selectionBackground': '#6366f133',
        'editor.inactiveSelectionBackground': '#6366f11a'
      }
    });

    monaco.editor.setTheme('vscode-dark-modern');

    // Attach Yjs MonacoBinding for the active file
    bindYjsToFile(activeFile, editor);
  };

  // Helper to bind Yjs Text to current Monaco model
  const bindYjsToFile = (file, editor) => {
    if (!file || !ydoc || !editor) return;

    try {
      // Destroy existing binding if any
      if (bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }

      // Each file in the project has its own Y.Text in the shared Y.Doc
      const yTextKey = `file:${file.id}`;
      const yText = ydoc.getText(yTextKey);

      // If document text is empty and file has initial content, populate it
      if (yText.toString() === '' && file.content) {
        yText.insert(0, file.content);
      }

      // Create MonacoBinding with awareness for real-time cursor presence
      const model = editor.getModel();
      if (model) {
        bindingRef.current = new MonacoBinding(
          yText,
          model,
          new Set([editor]),
          provider ? provider.awareness : null
        );
      }
    } catch (err) {
      console.warn('Error attaching Yjs MonacoBinding:', err);
    }
  };

  // When activeFile or provider changes, re-bind
  useEffect(() => {
    if (editorRef.current && activeFile) {
      bindYjsToFile(activeFile, editorRef.current);
    }
  }, [activeFile?.id, provider, ydoc]);

  // Inject dynamic styles for collaborator cursors and selection colors in Monaco
  useEffect(() => {
    if (!activeUsers || activeUsers.length === 0) return;

    let styleEl = document.getElementById('codesync-collaborator-cursors');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'codesync-collaborator-cursors';
      document.head.appendChild(styleEl);
    }

    const cssRules = activeUsers.map(u => {
      const color = u.color || '#10b981';
      const name = (u.username || 'Collaborator').replace(/"/g, '');
      return `
        .yRemoteSelection-${u.clientId} {
          background-color: ${color}33 !important;
        }
        .yRemoteSelectionHead-${u.clientId} {
          position: absolute;
          border-left: 2px solid ${color} !important;
          border-top: 2px solid ${color} !important;
          border-bottom: 2px solid ${color} !important;
          height: 100%;
          box-sizing: border-box;
        }
        .yRemoteSelectionHead-${u.clientId}::after {
          position: absolute;
          content: "${name}";
          top: -19px;
          left: -2px;
          font-size: 10px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-weight: 600;
          background-color: ${color};
          color: #09090b;
          padding: 1px 6px;
          border-radius: 4px;
          white-space: nowrap;
          pointer-events: none;
          z-index: 50;
          box-shadow: 0 2px 5px rgba(0,0,0,0.4);
        }
      `;
    }).join('\n');

    styleEl.innerHTML = cssRules;
  }, [activeUsers]);

  // Keyboard shortcut listeners (Ctrl+S, Ctrl+P, Ctrl+Enter)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + S: Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onAddToast?.({
          type: 'success',
          title: 'All Changes Saved',
          message: 'Workspace is automatically synchronized via Yjs CRDT.'
        });
      }
      // Ctrl/Cmd + P: Quick Open
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setIsQuickOpenOpen(prev => !prev);
      }
      // Ctrl/Cmd + Enter: Run Code
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        onRunCode?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRunCode, onAddToast]);

  const openTabs = openTabIds
    .map(id => files.find(f => f.id === id))
    .filter(Boolean);

  const filteredQuickFiles = files.filter(f => 
    f.name.toLowerCase().includes(quickSearch.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#18181b] overflow-hidden select-none relative">
      {/* Tab Bar */}
      <div className="h-9 border-b border-zinc-800 bg-[#141417] flex items-center justify-between overflow-x-auto no-scrollbar flex-shrink-0">
        <div className="flex items-center h-full">
          {openTabs.map(tab => {
            const isActive = tab.id === activeFileId;
            return (
              <div
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`group h-full px-3.5 flex items-center gap-2 border-r border-zinc-800 text-xs cursor-pointer transition-colors relative ${
                  isActive 
                    ? 'bg-[#18181b] text-white font-medium border-t-2 border-t-indigo-500' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                <FileCode className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                <span className="truncate max-w-[120px]">{tab.name}</span>
                
                {/* Close Tab Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className="p-0.5 rounded hover:bg-zinc-700/60 text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {/* New Tab Button */}
          <button
            onClick={onOpenNewTab}
            title="Create/Open File"
            className="h-full px-2.5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800/40 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Tab Bar Actions */}
        <div className="flex items-center px-2 gap-2 text-zinc-400 text-xs">
          <button
            onClick={() => setIsQuickOpenOpen(true)}
            title="Quick File Switcher (Ctrl+P)"
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-800/60 hover:bg-zinc-700 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <Search className="w-3 h-3" />
            <span className="hidden md:inline">Quick Open</span>
            <kbd className="font-mono text-[9px] px-1 bg-zinc-900 rounded border border-zinc-700">Ctrl+P</kbd>
          </button>
        </div>
      </div>

      {/* Breadcrumb Bar */}
      {activeFile && (
        <div className="h-6 px-4 border-b border-zinc-800/60 bg-[#18181b] flex items-center justify-between text-[11px] text-zinc-400 flex-shrink-0">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="hover:text-zinc-200 cursor-pointer">src</span>
            <ChevronRight className="w-3 h-3 text-zinc-600" />
            <span className="text-slate-200 font-medium">{activeFile.name}</span>
            <ChevronRight className="w-3 h-3 text-zinc-600" />
            <span className="text-indigo-400 uppercase font-mono text-[10px]">{activeLanguage}</span>
          </div>

          {/* Active Collaborators Presence in Current File */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-zinc-500 hidden sm:inline">Editing:</span>
            <div className="flex items-center -space-x-1.5">
              {activeUsers.map((user, idx) => (
                <UserAvatar
                  key={user.id || user.username || idx}
                  name={user.username || 'Collaborator'}
                  customColor={user.color}
                  size={18}
                  showStatus={true}
                  isOnline={true}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Editor Main Content or Empty State */}
      {openTabs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-400">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4 shadow-xl">
            <FileCode className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">No Open Files</h3>
          <p className="text-xs text-zinc-400 max-w-sm mb-6">
            Select a file from the explorer on the left or use keyboard shortcuts to jump right in.
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-sm w-full text-xs text-left mb-6">
            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-300">Quick Open</span>
              <kbd className="font-mono text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-indigo-400 border border-zinc-700">Ctrl+P</kbd>
            </div>
            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-300">Run Code</span>
              <kbd className="font-mono text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-emerald-400 border border-zinc-700">Ctrl+Enter</kbd>
            </div>
            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-300">Save File</span>
              <kbd className="font-mono text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-amber-400 border border-zinc-700">Ctrl+S</kbd>
            </div>
            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 flex items-center justify-between">
              <span className="text-zinc-300">New File</span>
              <button onClick={onOpenNewTab} className="text-indigo-400 hover:underline">Create</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 w-full h-full overflow-hidden">
          <Editor
            height="100%"
            language={activeLanguage}
            value={activeFile?.content || ''}
            theme={theme === 'vs-dark' ? 'vscode-dark-modern' : 'vs-light'}
            options={{
              fontSize: editorSettings?.fontSize || 14,
              tabSize: editorSettings?.tabSize || 2,
              minimap: { enabled: editorSettings?.minimap ?? true },
              wordWrap: editorSettings?.wordWrap || 'on',
              lineNumbers: 'on',
              lineHeight: 22,
              fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, monospace",
              fontLigatures: true,
              automaticLayout: true,
              scrollBeyondLastLine: false,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              smoothScrolling: true,
              renderLineHighlight: 'all',
              bracketPairColorization: { enabled: true },
              guides: { indentation: true },
              padding: { top: 12, bottom: 12 }
            }}
            onMount={handleEditorMount}
          />
        </div>
      )}

      {/* Quick Open Palette (Ctrl+P Modal) */}
      {isQuickOpenOpen && (
        <div 
          onClick={() => setIsQuickOpenOpen(false)}
          className="absolute inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-12 animate-in fade-in duration-100"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#18181b] border border-zinc-700 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-100"
          >
            <div className="p-2.5 border-b border-zinc-800 flex items-center gap-2">
              <Search className="w-4 h-4 text-zinc-400" />
              <input
                type="text"
                autoFocus
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder="Type file name to open..."
                className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
              />
              <kbd className="text-[10px] text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700">Esc</kbd>
            </div>

            <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
              {filteredQuickFiles.map(file => (
                <button
                  key={file.id}
                  onClick={() => {
                    onSelectTab(file.id);
                    setIsQuickOpenOpen(false);
                    setQuickSearch('');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-800 flex items-center justify-between text-xs text-slate-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{file.name}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 uppercase">{file.language}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
