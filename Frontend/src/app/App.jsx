import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import * as Y from 'yjs';
import { SocketIOProvider } from 'y-socket.io';
import './App.css';

// Utilities
import { getStoredUser, saveStoredUser, getRecentProjects, addRecentProject, removeRecentProject, getEditorSettings, saveEditorSettings } from '../utils/storage';
import { getUserColor } from '../utils/colors';
import { getLanguageByFilename } from '../utils/languages';

// Components
import Navbar from '../components/Navbar';
import ActivityBar from '../components/ActivityBar';
import Sidebar from '../components/Sidebar';
import EditorPanel from '../components/EditorPanel';
import BottomPanel from '../components/BottomPanel';
import StatusBar from '../components/StatusBar';
import Dashboard from '../components/Dashboard';
import ToastContainer from '../components/ToastContainer';

// Modals
import WelcomeModal from '../modals/WelcomeModal';
import ShareProjectModal from '../modals/ShareProjectModal';
import JoinProjectModal from '../modals/JoinProjectModal';
import NewProjectModal from '../modals/NewProjectModal';

export default function App() {
  // 1. User Identity State
  const [currentUser, setCurrentUser] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlUsername = urlParams.get('username');
    const stored = getStoredUser();
    const name = urlUsername || stored.name || '';
    const color = getUserColor(name || 'Dev');
    return { name, id: stored.id || 'usr_' + Math.random().toString(36).substring(2, 8), color: color.hex };
  });

  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(!currentUser.name);

  // 2. Navigation & Workspace State
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' | 'workspace'
  const [activeProject, setActiveProject] = useState(null);
  const [recentProjects, setRecentProjects] = useState(() => getRecentProjects());
  const [activeSidebarView, setActiveSidebarView] = useState('explorer'); // 'explorer' | 'collaborators' | 'search' | 'activity' | 'settings'
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(260);

  // 3. Multi-file & Editor State
  const [files, setFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [openTabIds, setOpenTabIds] = useState([]);
  const [editorSettings, setEditorSettings] = useState(() => getEditorSettings());
  const [theme, setTheme] = useState('vs-dark');

  // 4. Real-time Collaboration & Socket State
  const [activeUsers, setActiveUsers] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('offline'); // 'connected' | 'connecting' | 'offline'
  const [syncStatus, setSyncStatus] = useState('saved'); // 'saved' | 'syncing'
  const [activityLogs, setActivityLogs] = useState([]);
  const [collaborationLogs, setCollaborationLogs] = useState([]);

  // 5. Bottom Panel & Code Execution State
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(true);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(200);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  // 6. Modals & Notifications
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [joinModalInitialId, setJoinModalInitialId] = useState('');
  const [toasts, setToasts] = useState([]);

  // Yjs Doc & Provider References
  const ydoc = useMemo(() => new Y.Doc(), []);
  const providerRef = useRef(null);

  // References for stable callback access without re-triggering effects
  const currentUserRef = useRef(currentUser);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

  const activeProjectRef = useRef(activeProject);
  useEffect(() => { activeProjectRef.current = activeProject; }, [activeProject]);

  const viewModeRef = useRef(viewMode);
  useEffect(() => { viewModeRef.current = viewMode; }, [viewMode]);

  // Toast Dispatcher with Timer cleanup and Deduplication
  const toastTimersRef = useRef(new Map());

  const dismissToast = useCallback((id) => {
    if (toastTimersRef.current.has(id)) {
      clearTimeout(toastTimersRef.current.get(id));
      toastTimersRef.current.delete(id);
    }
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);

    setToasts(prev => {
      // Deduplicate: Don't show identical toast if already visible
      if (prev.some(t => t.title === title && t.message === message)) {
        return prev;
      }
      // Cap max concurrent toasts to 3
      const trimmed = prev.length >= 3 ? prev.slice(prev.length - 2) : prev;
      return [...trimmed, { id, type, title, message }];
    });

    const timer = setTimeout(() => {
      dismissToast(id);
    }, duration);
    toastTimersRef.current.set(id, timer);
  }, [dismissToast]);

  // Update URL helper (uses replaceState to avoid flooding browser history)
  const syncUrlParams = useCallback((projectId, username) => {
    const url = new URL(window.location.href);
    if (projectId) url.searchParams.set('project', projectId);
    else url.searchParams.delete('project');

    if (username) url.searchParams.set('username', username);
    window.history.replaceState({}, '', url.toString());
  }, []);

  // Load project by ID from backend or recent cache (completely stable reference)
  const openProjectById = useCallback(async (projectId, fallbackProject = null) => {
    if (!projectId) return;

    // Guard: If this project is already active in workspace view, avoid redundant reloading
    if (activeProjectRef.current?.id === projectId && viewModeRef.current === 'workspace') {
      return;
    }

    try {
      let projectToLoad = null;
      if (fallbackProject && fallbackProject.id === projectId) {
        projectToLoad = fallbackProject;
      } else {
        const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}`);
        const data = await res.json();
        if (res.ok && data.success && data.project) {
          projectToLoad = data.project;
        } else {
          const cached = getRecentProjects().find(p => p.id === projectId);
          if (cached) projectToLoad = cached;
        }
      }

      if (!projectToLoad) {
        addToast({
          type: 'error',
          title: 'Project Not Found',
          message: `Workspace '${projectId}' could not be located.`
        });
        setViewMode('dashboard');
        return;
      }

      // Default files if project has none
      const initialFiles = projectToLoad.files && projectToLoad.files.length > 0
        ? projectToLoad.files
        : [
            {
              id: 'file-main',
              name: 'index.js',
              language: 'javascript',
              content: `// Project: ${projectToLoad.name}\nconsole.log("Welcome to ${projectToLoad.name}!");\n`
            }
          ];

      setActiveProject(projectToLoad);
      setFiles(initialFiles);
      setActiveFileId(initialFiles[0].id);
      setOpenTabIds(initialFiles.map(f => f.id));
      setViewMode('workspace');

      // Update recents
      const updatedRecents = addRecentProject({
        ...projectToLoad,
        isOwner: projectToLoad.owner === currentUserRef.current?.name
      });
      if (updatedRecents) setRecentProjects(updatedRecents);

      // Sync URL
      syncUrlParams(projectToLoad.id, currentUserRef.current?.name);

      addToast({
        type: 'success',
        title: 'Workspace Loaded',
        message: `Connected to ${projectToLoad.name} (${projectToLoad.id})`
      });
    } catch (err) {
      console.error('Failed to open project:', err);
      if (fallbackProject) {
        setActiveProject(fallbackProject);
        setFiles(fallbackProject.files || []);
        setActiveFileId(fallbackProject.files?.[0]?.id || 'file-1');
        setOpenTabIds((fallbackProject.files || []).map(f => f.id));
        setViewMode('workspace');
      }
    }
  }, [addToast, syncUrlParams]);

  // Initial Deep-link URL checks - runs once on startup or when username is first set
  const deepLinkHandledRef = useRef(false);

  useEffect(() => {
    if (deepLinkHandledRef.current) return;

    const urlParams = new URLSearchParams(window.location.search);
    const path = window.location.pathname;

    let targetProjectId = urlParams.get('project');
    if (!targetProjectId && path.startsWith('/join/')) {
      targetProjectId = path.replace('/join/', '').trim().toUpperCase();
    }

    if (targetProjectId) {
      if (!currentUser.name) {
        // Open welcome modal first and store target project
        setJoinModalInitialId(targetProjectId);
        setIsWelcomeModalOpen(true);
      } else {
        deepLinkHandledRef.current = true;
        openProjectById(targetProjectId);
      }
    } else {
      deepLinkHandledRef.current = true;
    }
  }, [currentUser.name, openProjectById]);

  // Handle Welcome Modal submission
  const handleWelcomeSubmit = (name, color) => {
    const saved = saveStoredUser(name);
    const user = { name: saved.name, id: saved.id, color };
    setCurrentUser(user);
    setIsWelcomeModalOpen(false);
    syncUrlParams(activeProject?.id, user.name);

    addToast({
      type: 'success',
      title: 'Profile Ready',
      message: `Welcome aboard, ${user.name}!`
    });

    if (joinModalInitialId) {
      deepLinkHandledRef.current = true;
      openProjectById(joinModalInitialId);
      setJoinModalInitialId('');
    }
  };

  // Real-Time Socket.IO & Yjs Provider Effect
  useEffect(() => {
    if (!activeProject?.id || !currentUser?.name || viewMode !== 'workspace') {
      return;
    }

    setConnectionStatus('connecting');
    const roomName = `prj-${activeProject.id}`;

    // Connect to YSocketIO provider
    const provider = new SocketIOProvider('/', roomName, ydoc, {
      autoConnect: true,
      query: {
        projectId: activeProject.id,
        username: currentUser.name
      }
    });

    providerRef.current = provider;

    // Set local presence state (User info + cursor color)
    provider.awareness.setLocalStateField('user', {
      username: currentUser.name,
      color: currentUser.color,
      id: currentUser.id,
      activeFileId,
      isOwner: activeProject.owner === currentUser.name
    });

    // Awareness change handler for live collaborator list & cursor coordinates
    const handleAwarenessChange = () => {
      const states = Array.from(provider.awareness.getStates().entries());
      const remoteUsers = states
        .map(([clientId, state]) => {
          if (!state || !state.user || !state.user.username) return null;
          return {
            clientId,
            ...state.user
          };
        })
        .filter(Boolean);

      setActiveUsers(remoteUsers);

      setCollaborationLogs(prev => [
        {
          time: new Date().toLocaleTimeString(),
          type: 'sync',
          message: `Awareness state synchronized (${remoteUsers.length} active peers)`
        },
        ...prev.slice(0, 40)
      ]);
    };

    provider.awareness.on('change', handleAwarenessChange);
    handleAwarenessChange();

    // Provider status updates
    const handleStatus = (event) => {
      if (event.status === 'connected') {
        setConnectionStatus('connected');
        addToast({
          type: 'success',
          title: 'Connected to Collaboration Hub',
          message: `Real-time synchronization active for ${activeProject.id}`
        });
      } else if (event.status === 'connecting') {
        setConnectionStatus('connecting');
      } else {
        setConnectionStatus('offline');
      }
    };

    provider.on('status', handleStatus);

    // Track Yjs document updates to reflect sync state
    const handleDocUpdate = () => {
      setSyncStatus('syncing');
      const timer = setTimeout(() => setSyncStatus('saved'), 600);
      return () => clearTimeout(timer);
    };

    ydoc.on('update', handleDocUpdate);

    // Activity broadcast logger
    setActivityLogs(prev => [
      {
        id: Date.now().toString(),
        user: currentUser.name,
        time: new Date().toLocaleTimeString(),
        message: `Joined workspace ${activeProject.id}`
      },
      ...prev
    ]);

    // Cleanup on unmount or project change
    return () => {
      try {
        provider.awareness.setLocalStateField('user', null);
        provider.awareness.off('change', handleAwarenessChange);
        provider.off('status', handleStatus);
        ydoc.off('update', handleDocUpdate);
        provider.disconnect();
      } catch (err) {
        console.warn('Provider disconnect cleanup error:', err);
      }
    };
  }, [activeProject?.id, currentUser?.name, currentUser?.color, currentUser?.id, viewMode, ydoc, addToast]);

  // Update awareness when active file changes
  useEffect(() => {
    if (providerRef.current?.awareness && activeFileId) {
      providerRef.current.awareness.setLocalStateField('user', {
        username: currentUser.name,
        color: currentUser.color,
        id: currentUser.id,
        activeFileId,
        isOwner: activeProject?.owner === currentUser.name
      });
    }
  }, [activeFileId, currentUser, activeProject]);

  // File Operations
  const handleSelectFile = (fileId) => {
    setActiveFileId(fileId);
    if (!openTabIds.includes(fileId)) {
      setOpenTabIds(prev => [...prev, fileId]);
    }
  };

  const handleCloseTab = (fileIdToClose) => {
    const updatedTabs = openTabIds.filter(id => id !== fileIdToClose);
    setOpenTabIds(updatedTabs);

    if (activeFileId === fileIdToClose) {
      if (updatedTabs.length > 0) {
        setActiveFileId(updatedTabs[updatedTabs.length - 1]);
      } else {
        setActiveFileId(null);
      }
    }
  };

  const handleCreateFile = ({ name, language, content }) => {
    const newFile = {
      id: 'file-' + Date.now().toString(36),
      name,
      language: language || getLanguageByFilename(name),
      content: content || `// ${name}\n`
    };

    setFiles(prev => [...prev, newFile]);
    setOpenTabIds(prev => [...prev, newFile.id]);
    setActiveFileId(newFile.id);

    addToast({
      type: 'success',
      title: 'File Created',
      message: `Created ${newFile.name}`
    });

    setActivityLogs(prev => [
      {
        id: Date.now().toString(),
        user: currentUser.name,
        time: new Date().toLocaleTimeString(),
        message: `Created new file ${name}`
      },
      ...prev
    ]);
  };

  const handleRenameFile = (fileId, newName) => {
    const lang = getLanguageByFilename(newName);
    setFiles(prev => prev.map(f => {
      if (f.id === fileId) {
        return { ...f, name: newName, language: lang };
      }
      return f;
    }));

    addToast({
      type: 'info',
      title: 'File Renamed',
      message: `Renamed file to ${newName}`
    });
  };

  const handleDeleteFile = (fileId) => {
    const fileToDelete = files.find(f => f.id === fileId);
    if (!fileToDelete) return;

    if (files.length <= 1) {
      addToast({
        type: 'error',
        title: 'Action Denied',
        message: 'Cannot delete the only remaining file in the project.'
      });
      return;
    }

    setFiles(prev => prev.filter(f => f.id !== fileId));
    handleCloseTab(fileId);

    addToast({
      type: 'info',
      title: 'File Deleted',
      message: `Deleted ${fileToDelete.name}`
    });
  };

  // Run Code Execution Handler
  const handleRunCode = async () => {
    const activeFile = files.find(f => f.id === activeFileId);
    if (!activeFile) return;

    setIsRunningCode(true);
    setIsBottomPanelOpen(true);
    setExecutionResult(null);

    // Read current code from Yjs Text or fallback
    const yText = ydoc.getText(`file:${activeFile.id}`);
    const codeToRun = yText.toString() || activeFile.content || '';

    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeToRun,
          language: activeFile.language || getLanguageByFilename(activeFile.name)
        })
      });

      const data = await res.json();
      setExecutionResult(data);

      addToast({
        type: data.success ? 'success' : 'error',
        title: data.success ? 'Execution Finished' : 'Execution Error',
        message: `Completed in ${data.durationMs || 15}ms with exit code ${data.exitCode}`
      });
    } catch {
      // Offline mock runner
      const logs = [];
      try {
        const originalLog = console.log;
        console.log = (...args) => logs.push(args.join(' '));
        const fn = new Function(codeToRun);
        const result = fn();
        if (result !== undefined) logs.push(String(result));
        console.log = originalLog;

        setExecutionResult({
          success: true,
          stdout: logs.join('\n') || '[Process exited cleanly with no output]',
          stderr: '',
          exitCode: 0,
          durationMs: 8
        });
      } catch (err) {
        setExecutionResult({
          success: false,
          stdout: logs.join('\n'),
          stderr: err.message,
          exitCode: 1,
          durationMs: 5
        });
      }
    } finally {
      setIsRunningCode(false);
    }
  };

  // Resizing Handlers
  const handleSidebarResize = (e) => {
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMouseMove = (moveEvent) => {
      const newWidth = Math.min(500, Math.max(180, startWidth + (moveEvent.clientX - startX)));
      setSidebarWidth(newWidth);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleBottomPanelResize = (e) => {
    const startY = e.clientY;
    const startHeight = bottomPanelHeight;

    const onMouseMove = (moveEvent) => {
      const newHeight = Math.min(600, Math.max(100, startHeight - (moveEvent.clientY - startY)));
      setBottomPanelHeight(newHeight);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Delete project handler
  const handleDeleteProject = async (projectId) => {
    try {
      await fetch(`/api/projects/${encodeURIComponent(projectId)}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend delete project call error:', err);
    }

    const updated = removeRecentProject(projectId);
    setRecentProjects(updated);
    setViewMode('dashboard');
    setActiveProject(null);
    syncUrlParams(null, currentUser.name);

    addToast({
      type: 'info',
      title: 'Project Removed',
      message: `Project ${projectId} was closed.`
    });
  };

  // Return to Dashboard handler
  const handleNavigateHome = () => {
    setViewMode('dashboard');
    setActiveProject(null);
    syncUrlParams(null, currentUser.name);
  };

  const isOwner = activeProject ? (activeProject.owner === currentUser?.name || activeProject.ownerId === currentUser?.id) : false;
  const activeFile = files.find(f => f.id === activeFileId);

  return (
    <div className={`h-screen w-full flex flex-col bg-[#121215] text-slate-100 overflow-hidden font-sans ${theme === 'vs-dark' ? 'dark' : ''}`}>

      {/* 1. WELCOME MODAL FOR FIRST-TIME USERS */}
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        initialName={currentUser.name}
        onSubmit={handleWelcomeSubmit}
      />

      {/* 2. SHARE PROJECT MODAL */}
      <ShareProjectModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        project={activeProject}
        isOwner={isOwner}
        activeUsers={activeUsers}
        onAddToast={addToast}
        onRemoveUser={(userToRemove) => {
          addToast({
            type: 'info',
            title: 'Collaborator Removed',
            message: `${userToRemove.username} access was revoked.`
          });
        }}
      />

      {/* 3. JOIN PROJECT MODAL */}
      <JoinProjectModal
        isOpen={isJoinModalOpen}
        initialId={joinModalInitialId}
        onClose={() => {
          setIsJoinModalOpen(false);
          setJoinModalInitialId('');
        }}
        onJoinSuccess={(project) => {
          openProjectById(project.id, project);
        }}
      />

      {/* 4. NEW PROJECT MODAL */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        currentUser={currentUser}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreateProject={(newProj) => {
          openProjectById(newProj.id, newProj);
        }}
      />

      {/* RENDER VIEW: DASHBOARD OR WORKSPACE */}
      {viewMode === 'dashboard' ? (
        <Dashboard
          currentUser={currentUser}
          recentProjects={recentProjects}
          onOpenProject={(proj) => openProjectById(proj.id, proj)}
          onCreateProjectClick={() => setIsNewProjectModalOpen(true)}
          onJoinProjectClick={() => setIsJoinModalOpen(true)}
          onShareProjectClick={(proj) => {
            setActiveProject(proj);
            setIsShareModalOpen(true);
          }}
          onDeleteRecentProject={(id) => {
            const updated = removeRecentProject(id);
            setRecentProjects(updated);
            addToast({ type: 'info', title: 'Removed', message: 'Workspace removed from recents.' });
          }}
          onOpenSettings={() => {
            setIsWelcomeModalOpen(true);
          }}
        />
      ) : (
        /* WORKSPACE: VS CODE / REPLIT INSPIRED FULL IDE */
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Top Navbar */}
          <Navbar
            project={activeProject}
            isOwner={isOwner}
            connectionStatus={connectionStatus}
            syncStatus={syncStatus}
            activeUsers={activeUsers}
            currentUser={currentUser}
            isRunningCode={isRunningCode}
            activeLanguage={activeFile ? (activeFile.language || getLanguageByFilename(activeFile.name)) : 'javascript'}
            onLanguageChange={(newLang) => {
              if (activeFile) {
                setFiles(prev => prev.map(f => f.id === activeFile.id ? { ...f, language: newLang } : f));
              }
            }}
            onRunCode={handleRunCode}
            onStopCode={() => setIsRunningCode(false)}
            onShareClick={() => setIsShareModalOpen(true)}
            onNavigateHome={handleNavigateHome}
            onAddToast={addToast}
            theme={theme}
            onToggleTheme={() => setTheme(prev => prev === 'vs-dark' ? 'vs-light' : 'vs-dark')}
          />

          {/* Main IDE Body */}
          <div className="flex-1 flex overflow-hidden">
            {/* Activity Bar (Far Left Slim Vertical Strip) */}
            <ActivityBar
              activeView={activeSidebarView}
              onSelectView={(view) => {
                if (activeSidebarView === view && isSidebarOpen) {
                  setIsSidebarOpen(false);
                } else {
                  setActiveSidebarView(view);
                  setIsSidebarOpen(true);
                }
              }}
              collaboratorCount={activeUsers.length}
              currentUser={currentUser}
              onNavigateHome={handleNavigateHome}
              theme={theme}
              onToggleTheme={() => setTheme(prev => prev === 'vs-dark' ? 'vs-light' : 'vs-dark')}
            />

            {/* Sidebar (Explorer, Collaborators, Search, Activity, Settings) */}
            {isSidebarOpen && (
              <Sidebar
                activeView={activeSidebarView}
                project={activeProject}
                isOwner={isOwner}
                files={files}
                activeFileId={activeFileId}
                onSelectFile={handleSelectFile}
                onCreateFile={handleCreateFile}
                onDeleteFile={handleDeleteFile}
                onRenameFile={handleRenameFile}
                activeUsers={activeUsers}
                currentUser={currentUser}
                onShareClick={() => setIsShareModalOpen(true)}
                activityLogs={activityLogs}
                editorSettings={editorSettings}
                onUpdateEditorSettings={(newSettings) => {
                  const merged = { ...editorSettings, ...newSettings };
                  setEditorSettings(merged);
                  saveEditorSettings(merged);
                }}
                onDeleteProject={handleDeleteProject}
                onAddToast={addToast}
                width={sidebarWidth}
                onStartResize={handleSidebarResize}
              />
            )}

            {/* Central Code Area: Editor + Bottom Panel */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Central Editor Panel */}
              <EditorPanel
                files={files}
                activeFileId={activeFileId}
                openTabIds={openTabIds}
                onSelectTab={handleSelectFile}
                onCloseTab={handleCloseTab}
                onOpenNewTab={() => {
                  setActiveSidebarView('explorer');
                  setIsSidebarOpen(true);
                }}
                ydoc={ydoc}
                provider={providerRef.current}
                activeUsers={activeUsers}
                editorSettings={editorSettings}
                theme={theme}
                onRunCode={handleRunCode}
                onAddToast={addToast}
              />

              {/* Bottom Terminal & Output Panel */}
              <BottomPanel
                isOpen={isBottomPanelOpen}
                onClose={() => setIsBottomPanelOpen(false)}
                height={bottomPanelHeight}
                onStartResize={handleBottomPanelResize}
                executionResult={executionResult}
                isRunning={isRunningCode}
                collaborationLogs={collaborationLogs}
                onClearOutput={() => setExecutionResult(null)}
              />
            </div>
          </div>

          {/* Bottom Status Bar */}
          <StatusBar
            activeLanguage={activeFile ? (activeFile.language || getLanguageByFilename(activeFile.name)) : 'javascript'}
            collaboratorCount={activeUsers.length}
            isBottomPanelOpen={isBottomPanelOpen}
            onToggleBottomPanel={() => setIsBottomPanelOpen(prev => !prev)}
            tabSize={editorSettings?.tabSize || 2}
            onShareClick={() => setIsShareModalOpen(true)}
          />
        </div>
      )}

      {/* Toast Notifications at root z-[100] */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
