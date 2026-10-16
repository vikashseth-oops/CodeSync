import { useState } from 'react';
import { Copy, Check, X, Users, Shield, Link2, Key, Radio, Trash2 } from 'lucide-react';
import UserAvatar from '../components/UserAvatar';

export default function ShareProjectModal({
  isOpen,
  onClose,
  project,
  isOwner,
  activeUsers = [],
  onRemoveUser,
  onAddToast
}) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !project) return null;

  const joinLink = `${window.location.origin}/?project=${project.id}`;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(project.id);
      setCopiedId(true);
      onAddToast?.({
        type: 'success',
        title: 'Project ID Copied',
        message: `${project.id} copied to clipboard.`
      });
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      onAddToast?.({
        type: 'error',
        title: 'Copy Failed',
        message: 'Could not copy to clipboard. Please copy manually.'
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(joinLink);
      setCopiedLink(true);
      onAddToast?.({
        type: 'success',
        title: 'Invite Link Copied',
        message: 'Share this link with teammates to invite them.'
      });
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      onAddToast?.({
        type: 'error',
        title: 'Copy Failed',
        message: 'Could not copy link to clipboard.'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#1c1c20] border border-[#2e2e35] rounded-xl shadow-2xl overflow-hidden text-[#e8e8ed] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2e2e35] bg-[#17171a]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#6366f1]/10 border border-[#6366f1]/25 flex items-center justify-center text-[#6366f1]">
              <Key className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Share Project</h2>
              <p className="text-[11px] text-[#9999a8]">Invite collaborators with Project ID or link</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#9999a8] hover:text-white p-1 rounded hover:bg-[#26262c] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Project Details Banner */}
          <div className="p-3 bg-[#17171a] rounded-lg border border-[#2e2e35] flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-[10px] text-[#5c5c6a] uppercase font-semibold tracking-wider">Project</div>
              <div className="text-xs font-semibold text-white truncate max-w-[200px]">{project.name}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-[#5c5c6a] uppercase font-semibold tracking-wider">Owner</div>
              <div className="text-xs font-medium text-[#b45309] flex items-center gap-1 justify-end">
                <Shield className="w-3 h-3" />
                <span>{project.owner || 'You'} {isOwner && '(You)'}</span>
              </div>
            </div>
          </div>

          {/* Unique Project ID section */}
          <div>
            <label className="block text-[11px] font-medium text-[#9999a8] mb-1.5">
              Unique Project ID
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center justify-between px-3 py-2 bg-[#17171a] border border-[#2e2e35] rounded-md font-mono text-sm tracking-wider text-[#6366f1] font-semibold select-all">
                <span>{project.id}</span>
                <span className="text-[9px] font-sans font-normal text-[#5c5c6a] uppercase px-1.5 py-0.5 rounded bg-[#202024]">
                  ID
                </span>
              </div>
              <button
                onClick={handleCopyId}
                className="h-9 px-3 bg-[#6366f1] hover:bg-[#5254cc] active:bg-[#4338ca] text-white font-medium rounded-md text-xs flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
              >
                {copiedId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#22c55e]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Direct Invitation Link */}
          <div>
            <label className="block text-[11px] font-medium text-[#9999a8] mb-1.5">
              Direct Invitation Link
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-[#17171a] border border-[#2e2e35] rounded-md text-xs text-[#9999a8] font-mono truncate select-all">
                {joinLink}
              </div>
              <button
                onClick={handleCopyLink}
                className="h-9 px-3 bg-[#202024] hover:bg-[#26262c] text-[#e8e8ed] hover:text-white rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors flex-shrink-0 border border-[#2e2e35] cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#22c55e]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Active Collaborators Summary */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-medium text-[#9999a8] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#6366f1]" />
                Active Collaborators ({activeUsers.length})
              </label>
              <span className="text-[10px] text-[#22c55e] flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 animate-status-pulse" />
                Live Sync
              </span>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-0.5">
              {activeUsers.length === 0 ? (
                <div className="p-3 text-center text-xs text-[#5c5c6a] bg-[#17171a] rounded-md border border-[#2e2e35]">
                  No other collaborators currently connected.
                </div>
              ) : (
                activeUsers.map((user, idx) => {
                  const isUserOwner = user.username === project.owner || user.isOwner;
                  return (
                    <div
                      key={user.id || user.username || idx}
                      className="flex items-center justify-between px-3 py-2 rounded-md bg-[#17171a] border border-[#2e2e35] text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <UserAvatar
                          name={user.username || 'Collaborator'}
                          customColor={user.color}
                          size={24}
                          showStatus={true}
                          isOnline={true}
                          isOwner={isUserOwner}
                        />
                        <div>
                          <div className="font-medium text-white flex items-center gap-1.5">
                            {user.username}
                            {isUserOwner && (
                              <span className="px-1.5 py-0.2 bg-[#b45309]/10 text-[#b45309] border border-[#b45309]/20 text-[9px] rounded font-medium">
                                Owner
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#22c55e] flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-[#22c55e]"></span>
                            Online now
                          </div>
                        </div>
                      </div>

                      {/* Owner controls: remove participant */}
                      {isOwner && !isUserOwner && onRemoveUser && (
                        <button
                          onClick={() => onRemoveUser(user)}
                          title="Remove collaborator"
                          className="p-1 text-[#5c5c6a] hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded transition-colors cursor-pointer"
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
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#2e2e35] bg-[#17171a] flex items-center justify-between text-xs">
          <div className="text-[11px] text-[#5c5c6a]">
            {isOwner ? 'You have owner privileges' : 'Connected as collaborator'}
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-[#202024] hover:bg-[#26262c] text-white rounded-md text-xs font-medium border border-[#2e2e35] transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

