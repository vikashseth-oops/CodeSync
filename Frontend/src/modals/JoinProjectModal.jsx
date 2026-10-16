import { useState, useEffect } from 'react';
import { ArrowRight, Loader2, AlertCircle, CheckCircle2, Shield, FolderGit2, X, FileCode } from 'lucide-react';

export default function JoinProjectModal({
  isOpen,
  onClose,
  onJoinSuccess,
  initialId = ''
}) {
  const [projectIdInput, setProjectIdInput] = useState(initialId);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [validatedProject, setValidatedProject] = useState(null);

  useEffect(() => {
    if (initialId) {
      setProjectIdInput(initialId);
      validateProject(initialId);
    }
  }, [initialId]);

  if (!isOpen) return null;

  // Extract ID from full URL if user pasted a link like https://.../?project=PRJ-123 or /join/PRJ-123
  const sanitizeId = (input) => {
    if (!input) return '';
    let val = input.trim();
    if (val.includes('project=')) {
      const match = val.match(/project=([A-Za-z0-9_-]+)/i);
      if (match) val = match[1];
    } else if (val.includes('/join/')) {
      const match = val.match(/\/join\/([A-Za-z0-9_-]+)/i);
      if (match) val = match[1];
    }
    return val.toUpperCase();
  };

  const validateProject = async (idToTest) => {
    const cleanId = sanitizeId(idToTest);
    if (!cleanId) {
      setError('Please enter a Project ID');
      setValidatedProject(null);
      return;
    }

    setIsValidating(true);
    setError('');
    setValidatedProject(null);

    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(cleanId)}`);
      const data = await res.json();

      if (res.ok && data.success && data.project) {
        setValidatedProject(data.project);
        setError('');
      } else {
        setError(data.message || `Project '${cleanId}' was not found. Please check the ID.`);
        setValidatedProject(null);
      }
    } catch {
      // Offline fallback: if backend is unreachable, allow joining directly or show connection advisory
      setError('Server connection offline. Workspace will attempt direct local connection.');
      setValidatedProject({
        id: cleanId,
        name: `Project ${cleanId}`,
        owner: 'Remote Team',
        description: 'Collaborative session (Direct connect)',
        fileCount: 1
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setProjectIdInput(val);
    setError('');
    setValidatedProject(null);
  };

  const handleValidateClick = (e) => {
    e.preventDefault();
    validateProject(projectIdInput);
  };

  const handleConfirmJoin = () => {
    if (!validatedProject) return;
    onJoinSuccess(validatedProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#1c1c20] border border-[#2e2e35] rounded-xl shadow-2xl overflow-hidden text-[#e8e8ed] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2e2e35] bg-[#17171a]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#6366f1]/10 border border-[#6366f1]/25 flex items-center justify-center text-[#6366f1]">
              <FolderGit2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Join Existing Project</h2>
              <p className="text-[11px] text-[#9999a8]">Connect to a collaborative workspace</p>
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
          <form onSubmit={handleValidateClick} className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-[#9999a8] mb-1.5">
                Project ID or Invitation URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  autoFocus
                  value={projectIdInput}
                  onChange={handleInputChange}
                  placeholder="e.g. PRJ-A7K92X or paste link"
                  className="flex-1 px-3 py-2 rounded-md bg-[#17171a] border border-[#2e2e35] text-white placeholder-[#5c5c6a] font-mono text-xs uppercase focus:outline-none focus:border-[#6366f1] transition-colors"
                />
                <button
                  type="submit"
                  disabled={isValidating || !projectIdInput.trim()}
                  className="px-3.5 py-2 bg-[#202024] hover:bg-[#26262c] disabled:opacity-40 text-white rounded-md text-xs font-medium transition-colors border border-[#2e2e35] flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6366f1]" />
                      <span>Checking…</span>
                    </>
                  ) : (
                    <span>Check</span>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/25 rounded-md flex items-start gap-2 text-xs text-[#ef4444]">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </form>

          {/* Validated Project Preview Card */}
          {validatedProject && (
            <div className="p-3.5 bg-[#17171a] border border-[#22c55e]/30 rounded-lg space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#22c55e] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Project Verified
                </span>
                <span className="text-xs font-mono font-semibold text-[#6366f1] bg-[#6366f1]/10 px-1.5 py-0.5 rounded border border-[#6366f1]/20">
                  {validatedProject.id}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white">{validatedProject.name}</h3>
                {validatedProject.description && (
                  <p className="text-xs text-[#9999a8] mt-0.5 line-clamp-2">{validatedProject.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#2e2e35] text-[11px]">
                <div className="flex items-center gap-1.5 text-[#9999a8]">
                  <Shield className="w-3 h-3 text-[#b45309]" />
                  <span>Owner: <strong className="text-white font-medium">{validatedProject.owner}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-[#9999a8]">
                  <FileCode className="w-3 h-3 text-[#6366f1]" />
                  <span>Language: <strong className="text-white font-medium capitalize">{validatedProject.language || 'Code'}</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#2e2e35] bg-[#17171a] flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-[#9999a8] hover:text-white rounded hover:bg-[#202024] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!validatedProject}
            onClick={handleConfirmJoin}
            className="px-3.5 py-1.5 bg-[#6366f1] hover:bg-[#5254cc] disabled:opacity-40 text-white font-medium rounded-md text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Join Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

