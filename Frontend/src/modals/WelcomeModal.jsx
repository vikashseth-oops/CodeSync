import { useState } from 'react';
import { Terminal, ArrowRight, Shield } from 'lucide-react';
import { COLLABORATOR_COLORS } from '../utils/colors';
import UserAvatar from '../components/UserAvatar';

export default function WelcomeModal({ isOpen, onSubmit, initialName = '' }) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLLABORATOR_COLORS[0].hex);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a display name to continue');
      return;
    }
    if (trimmed.length < 2) {
      setError('Display name must be at least 2 characters');
      return;
    }
    if (trimmed.length > 28) {
      setError('Display name must be less than 28 characters');
      return;
    }
    setError('');
    onSubmit(trimmed, selectedColor);
  };

  const displayName = name.trim() || 'Developer';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#1c1c20] border border-[#2e2e35] rounded-xl shadow-2xl overflow-hidden p-6 text-[#e8e8ed] animate-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-[#6366f1]/10 border border-[#6366f1]/25 flex items-center justify-center text-[#6366f1]">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight text-white">
              Welcome to CodeSync
            </h2>
            <p className="text-xs text-[#9999a8]">Set your identity for collaborative coding</p>
          </div>
        </div>

        {/* Live Preview Illustrated Human Avatar */}
        <div className="flex flex-col items-center justify-center py-4 px-4 bg-[#17171a] rounded-lg border border-[#2e2e35] mb-5">
          <UserAvatar
            name={displayName}
            customColor={selectedColor}
            size={56}
            showStatus={true}
            isOnline={true}
          />
          <div className="mt-2.5 font-medium text-white text-sm">
            {displayName}
          </div>
          <div className="text-[11px] text-[#9999a8] flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selectedColor }} />
            <span>Collaboration cursor & avatar</span>
          </div>

          {/* Color Picker Swatches */}
          <div className="flex items-center gap-2 mt-3.5">
            {COLLABORATOR_COLORS.map(c => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setSelectedColor(c.hex)}
                className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                  selectedColor === c.hex 
                    ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#17171a]' 
                    : 'opacity-70 hover:opacity-100 hover:scale-110'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#9999a8] mb-1.5">
              Display Name <span className="text-[#ef4444]">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Sarah or Alex Dev"
              className="w-full px-3 py-2 rounded-md bg-[#17171a] border border-[#2e2e35] text-white placeholder-[#5c5c6a] text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
            />
            {error && (
              <p className="mt-1.5 text-xs text-[#ef4444] flex items-center gap-1">
                <span>•</span> {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-[#6366f1] hover:bg-[#5254cc] active:bg-[#4338ca] text-white font-medium rounded-md text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Enter Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

