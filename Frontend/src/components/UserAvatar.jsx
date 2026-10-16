import { useMemo } from 'react';
import { generateAvatarSvg, getUserColor, getInitials } from '../utils/colors';

/**
 * Universal UserAvatar component:
 * - Deterministic, illustrated human profile vector avatar
 * - Online status indicator badge
 * - Native accessible title / tooltip with collaborator name and status
 * - Subtle border in the user's signature collaborator color
 */
export default function UserAvatar({
  name = 'User',
  size = 26,
  customColor = null,
  showStatus = false,
  isOnline = true,
  isOwner = false,
  className = '',
  title = null
}) {
  const color = useMemo(() => {
    return customColor ? { hex: customColor } : getUserColor(name);
  }, [customColor, name]);

  const avatarSrc = useMemo(() => {
    return generateAvatarSvg(name, Math.max(size * 2, 64), color.hex);
  }, [name, size, color.hex]);

  const tooltip = title ?? `${name}${isOwner ? ' (Owner)' : ''} • ${isOnline ? 'Online' : 'Offline'}`;

  // Indicator size calculation
  const statusSize = Math.max(6, Math.round(size * 0.28));

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 group select-none ${className}`}
      style={{ width: size, height: size }}
      title={tooltip}
    >
      <img
        src={avatarSrc}
        alt={getInitials(name)}
        width={size}
        height={size}
        className="rounded-full object-cover transition-transform group-hover:scale-105"
        style={{
          border: `1.5px solid ${color.hex}55`,
          backgroundColor: '#18181c'
        }}
        loading="lazy"
      />

      {showStatus && (
        <span
          className="absolute bottom-0 right-0 rounded-full ring-2 ring-[#17171a]"
          style={{
            width: statusSize,
            height: statusSize,
            backgroundColor: isOnline ? '#22c55e' : '#71717a'
          }}
        />
      )}
    </div>
  );
}
