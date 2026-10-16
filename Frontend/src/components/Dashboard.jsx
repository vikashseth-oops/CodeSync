import { useState } from 'react';
import { 
  Plus, 
  FolderGit2, 
  Share2, 
  Trash2, 
  Clock, 
  Users, 
  Code2,
  Search,
  ExternalLink,
  Shield,
  Terminal,
  ChevronRight
} from 'lucide-react';
import { getFileBadgeColor } from '../utils/languages';
import UserAvatar from './UserAvatar';

// Language dot color
function LangDot({ language }) {
  const cls = getFileBadgeColor(language || 'javascript');
  return <span className={`inline-block w-2 h-2 rounded-full ${cls.split(' ')[2]?.replace('border-', 'bg-') || 'bg-zinc-500'}`} />;
}

export default function Dashboard({
  currentUser,
  recentProjects = [],
  onOpenProject,
  onCreateProjectClick,
  onJoinProjectClick,
  onShareProjectClick,
  onDeleteRecentProject,
  onOpenSettings
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = recentProjects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.language && p.language.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#17171a] text-[#e8e8ed] flex flex-col">
      {/* ── Top Bar ────────────────────────────────────────── */}
      <header className="h-12 border-b border-[#2e2e35] px-5 flex items-center justify-between bg-[#1c1c20] sticky top-0 z-10 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-[#6366f1] flex items-center justify-center flex-shrink-0">
            <Code2 className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">CodeSync</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onJoinProjectClick}
            className="h-7 px-3 rounded text-xs text-[#9999a8] hover:text-white hover:bg-[#2a2a32] border border-[#2e2e35] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Join via ID</span>
          </button>
          <button
            onClick={onCreateProjectClick}
            className="h-7 px-3 rounded text-xs bg-[#6366f1] hover:bg-[#5254cc] text-white font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
          <div className="w-px h-4 bg-[#2e2e35] mx-1" />
          <button
            title={`Signed in as ${currentUser?.name || 'Developer'}`}
            onClick={onOpenSettings}
            className="cursor-pointer"
          >
            <UserAvatar 
              name={currentUser?.name || 'Developer'} 
              customColor={currentUser?.color}
              size={28} 
              showStatus={true} 
              isOnline={true} 
            />
          </button>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────── */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10 flex flex-col gap-8">

        {/* ── Greeting ──────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">
            Good day, {currentUser?.name?.split(' ')[0] || 'Developer'}
          </h1>
          <p className="text-sm text-[#9999a8]">
            Real-time collaborative code editor. Share a Project ID to code together.
          </p>

          {/* Primary CTA row */}
          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={onCreateProjectClick}
              className="h-9 px-4 rounded-md bg-[#6366f1] hover:bg-[#5254cc] text-white text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
            <button
              onClick={onJoinProjectClick}
              className="h-9 px-4 rounded-md border border-[#2e2e35] text-[#e8e8ed] hover:bg-[#26262c] text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer"
            >
              <FolderGit2 className="w-4 h-4 text-[#6366f1]" />
              Join with Project ID
            </button>
          </div>
        </div>

        {/* ── Stats row (minimal) ───────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Recent Projects', value: recentProjects.length.toString(), icon: Code2, color: '#0d9488' },
            { label: 'Real-Time Engine', value: 'Yjs CRDT', icon: Terminal, color: '#7c3aed' },
            { label: 'Collab Mode', value: 'Multi-User', icon: Users, color: '#b45309' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-md border border-[#2e2e35] bg-[#1c1c20]">
              <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
                <Icon className="w-3.5 h-3.5" style={{ color }} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white leading-none">{value}</div>
                <div className="text-[11px] text-[#5c5c6a] mt-0.5">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Recent Workspaces ─────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#5c5c6a]">Recent Workspaces</h2>
            {recentProjects.length > 0 && (
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5c5c6a]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter…"
                  className="h-7 pl-7 pr-3 text-xs rounded border border-[#2e2e35] bg-[#1c1c20] text-[#e8e8ed] placeholder-[#5c5c6a] focus:outline-none focus:border-[#6366f1] transition-colors w-44"
                />
              </div>
            )}
          </div>

          {recentProjects.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-16 rounded-md border border-dashed border-[#2e2e35] text-center">
              <div className="w-10 h-10 rounded-full bg-[#202024] flex items-center justify-center mb-3">
                <Terminal className="w-5 h-5 text-[#5c5c6a]" />
              </div>
              <p className="text-sm font-medium text-[#9999a8] mb-1">No recent workspaces</p>
              <p className="text-xs text-[#5c5c6a] mb-4">Create your first project to get started.</p>
              <button
                onClick={onCreateProjectClick}
                className="h-8 px-4 rounded bg-[#6366f1] hover:bg-[#5254cc] text-white text-xs font-medium transition-colors cursor-pointer"
              >
                Create Project
              </button>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#5c5c6a]">
              No workspaces matching "{searchQuery}"
            </div>
          ) : (
            /* Compact list rows */
            <div className="rounded-md border border-[#2e2e35] overflow-hidden divide-y divide-[#2e2e35]">
              {filteredProjects.map((p) => {
                const badgeStyle = getFileBadgeColor(p.language || 'javascript');
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 px-4 py-3 bg-[#1c1c20] hover:bg-[#202024] transition-colors group"
                  >
                    {/* Language dot */}
                    <LangDot language={p.language} />

                    {/* Name + ID + meta */}
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => onOpenProject(p)}
                        className="text-sm font-medium text-[#e8e8ed] group-hover:text-white transition-colors text-left truncate block cursor-pointer w-full"
                      >
                        {p.name}
                      </button>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-[#6366f1] opacity-70">{p.id}</span>
                        {p.isOwner && (
                          <span className="flex items-center gap-0.5 text-[10px] text-[#b45309]">
                            <Shield className="w-2.5 h-2.5" />
                            Owner
                          </span>
                        )}
                        <span className={`text-[10px] px-1 rounded border ${badgeStyle} capitalize`}>
                          {p.language || 'js'}
                        </span>
                      </div>
                    </div>

                    {/* Actions (revealed on hover) */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onShareProjectClick(p)}
                        title="Share"
                        className="p-1.5 text-[#5c5c6a] hover:text-[#6366f1] rounded hover:bg-[#26262c] transition-colors cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteRecentProject(p.id)}
                        title="Remove from recents"
                        className="p-1.5 text-[#5c5c6a] hover:text-[#ef4444] rounded hover:bg-[#26262c] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenProject(p)}
                        title="Open"
                        className="p-1.5 text-[#5c5c6a] hover:text-white rounded hover:bg-[#26262c] transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


