// Curated developer-friendly colors – warm, distinctive, not screaming-blue
export const COLLABORATOR_COLORS = [
  { name: 'Teal',    hex: '#0d9488', bg: 'rgba(13, 148, 136, 0.15)' },
  { name: 'Violet',  hex: '#7c3aed', bg: 'rgba(124, 58, 237, 0.15)' },
  { name: 'Amber',   hex: '#d97706', bg: 'rgba(217, 119, 6, 0.15)'   },
  { name: 'Rose',    hex: '#be185d', bg: 'rgba(190, 24, 93, 0.15)'  },
  { name: 'Sky',     hex: '#0284c7', bg: 'rgba(2, 132, 199, 0.15)'  },
  { name: 'Emerald', hex: '#059669', bg: 'rgba(5, 150, 105, 0.15)'  },
  { name: 'Indigo',  hex: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)' },
  { name: 'Coral',   hex: '#ea580c', bg: 'rgba(234, 88, 12, 0.15)'  },
  { name: 'Slate',   hex: '#64748b', bg: 'rgba(100, 116, 139, 0.15)' },
];

// Stable hash -> deterministic, no random on re-render
export function getUserColor(identifier) {
  if (!identifier) return COLLABORATOR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLLABORATOR_COLORS.length;
  return COLLABORATOR_COLORS[index];
}

export function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// Generate a stable avatar style index (0-7) from name
export function getAvatarIndex(name) {
  if (!name) return 0;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 8;
}

/**
 * Renders a clean, illustrated human profile avatar.
 * Fully deterministic: same username = same face & hair style & color every time.
 * Returns a data URI for use in <img src={...}>.
 */
export function generateAvatarSvg(name, size = 32, customColorHex = null) {
  const color = customColorHex ? { hex: customColorHex } : getUserColor(name);
  const idx = getAvatarIndex(name);
  const accent = color.hex;
  const skin = '#f1c27d'; // warm natural tone
  const shirt = '#272730';
  const bg = '#18181c';

  // Base body & head present in all illustrated avatars
  const baseBody = `
    <rect width="100" height="100" fill="${bg}"/>
    <circle cx="50" cy="50" r="48" fill="${accent}" opacity="0.12"/>
    <path d="M 22 96 C 22 75, 34 67, 50 67 C 66 67, 78 75, 78 96 Z" fill="${shirt}"/>
    <path d="M 40 68 Q 50 76 60 68" stroke="${accent}" stroke-width="2" fill="none" opacity="0.7"/>
    <rect x="44" y="50" width="12" height="16" rx="4" fill="${skin}"/>
    <ellipse cx="50" cy="42" rx="18" ry="21" fill="${skin}"/>
  `;

  // 8 distinct human illustrated hair & accessory variations
  const hairStyles = [
    // 0: Sleek side-part + stylish glasses
    `
      <path d="M 31 38 C 31 22, 44 18, 58 18 C 70 18, 71 25, 71 30 C 62 25, 45 25, 34 35 Z" fill="${accent}"/>
      <rect x="34" y="38" width="12" height="9" rx="2.5" fill="none" stroke="${accent}" stroke-width="2.2"/>
      <rect x="54" y="38" width="12" height="9" rx="2.5" fill="none" stroke="${accent}" stroke-width="2.2"/>
      <line x1="46" y1="42.5" x2="54" y2="42.5" stroke="${accent}" stroke-width="2.2"/>
      <circle cx="40" cy="42.5" r="1.8" fill="#18181c"/>
      <circle cx="60" cy="42.5" r="1.8" fill="#18181c"/>
      <path d="M 45 54 Q 50 58 55 54" stroke="#18181c" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    `,
    // 1: Cozy beanie / knit cap
    `
      <path d="M 29 36 C 29 20, 39 13, 50 13 C 61 13, 71 20, 71 36 Z" fill="${accent}"/>
      <rect x="27" y="32" width="46" height="7" rx="3" fill="${accent}" opacity="0.88"/>
      <line x1="50" y1="13" x2="50" y2="10" stroke="${accent}" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="41" cy="44" r="2" fill="#18181c"/>
      <circle cx="59" cy="44" r="2" fill="#18181c"/>
      <path d="M 46 54 Q 50 57 54 54" stroke="#18181c" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    `,
    // 2: Curly / Afro volume
    `
      <circle cx="32" cy="34" r="11" fill="${accent}"/>
      <circle cx="50" cy="23" r="13" fill="${accent}"/>
      <circle cx="68" cy="34" r="11" fill="${accent}"/>
      <circle cx="38" cy="24" r="10" fill="${accent}"/>
      <circle cx="62" cy="24" r="10" fill="${accent}"/>
      <circle cx="41" cy="43" r="2" fill="#18181c"/>
      <circle cx="59" cy="43" r="2" fill="#18181c"/>
      <path d="M 45 53 Q 50 57 55 53" stroke="#18181c" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    `,
    // 3: Over-ear studio headphones
    `
      <path d="M 31 36 C 31 22, 42 19, 50 19 C 58 19, 69 22, 69 36 Z" fill="#2d2d35"/>
      <path d="M 26 43 A 25 25 0 0 1 74 43" fill="none" stroke="${accent}" stroke-width="3.5" stroke-linecap="round"/>
      <rect x="25" y="36" width="6" height="15" rx="3" fill="${accent}"/>
      <rect x="69" y="36" width="6" height="15" rx="3" fill="${accent}"/>
      <circle cx="41" cy="44" r="2" fill="#18181c"/>
      <circle cx="59" cy="44" r="2" fill="#18181c"/>
      <path d="M 45 54 Q 50 57 55 54" stroke="#18181c" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    `,
    // 4: High bun / Topknot
    `
      <circle cx="50" cy="14" r="8" fill="${accent}"/>
      <path d="M 30 40 C 30 23, 40 19, 50 19 C 60 19, 70 23, 70 40 C 66 28, 34 28, 30 40 Z" fill="${accent}"/>
      <circle cx="41" cy="44" r="2" fill="#18181c"/>
      <circle cx="59" cy="44" r="2" fill="#18181c"/>
      <circle cx="31" cy="46" r="1.8" fill="${accent}"/>
      <circle cx="69" cy="46" r="1.8" fill="${accent}"/>
      <path d="M 46 54 Q 50 57 54 54" stroke="#18181c" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    `,
    // 5: Modern bob cut with bangs
    `
      <path d="M 28 44 C 28 23, 40 18, 50 18 C 60 18, 72 23, 72 44 C 72 52, 70 56, 68 58 C 68 44, 66 32, 50 32 C 34 32, 32 44, 32 58 C 30 56, 28 52, 28 44 Z" fill="${accent}"/>
      <circle cx="41" cy="43" r="2" fill="#18181c"/>
      <circle cx="59" cy="43" r="2" fill="#18181c"/>
      <path d="M 45 53 Q 50 57 55 53" stroke="#18181c" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    `,
    // 6: Textured short crop
    `
      <polygon points="30,34 35,21 42,26 50,17 58,26 65,21 70,34 50,26" fill="${accent}"/>
      <circle cx="41" cy="43" r="2" fill="#18181c"/>
      <circle cx="59" cy="43" r="2" fill="#18181c"/>
      <path d="M 45 53 Q 50 56 55 53" stroke="#18181c" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    `,
    // 7: Wavy locks & side sweep
    `
      <path d="M 28 46 C 28 22, 42 17, 56 17 C 68 17, 72 24, 72 34 C 72 48, 66 54, 62 58 C 66 48, 68 36, 52 30 C 38 24, 32 38, 28 46 Z" fill="${accent}"/>
      <circle cx="41" cy="44" r="2" fill="#18181c"/>
      <circle cx="59" cy="44" r="2" fill="#18181c"/>
      <path d="M 45 54 Q 50 57 55 54" stroke="#18181c" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    `
  ];

  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">${baseBody}${hairStyles[idx]}</svg>`;

  return `data:image/svg+xml;base64,${btoa(svgStr)}`;
}

