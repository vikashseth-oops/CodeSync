export const SUPPORTED_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', ext: '.js', defaultFile: 'index.js' },
  { id: 'typescript', name: 'TypeScript', ext: '.ts', defaultFile: 'index.ts' },
  { id: 'python', name: 'Python', ext: '.py', defaultFile: 'main.py' },
  { id: 'html', name: 'HTML', ext: '.html', defaultFile: 'index.html' },
  { id: 'css', name: 'CSS', ext: '.css', defaultFile: 'styles.css' },
  { id: 'json', name: 'JSON', ext: '.json', defaultFile: 'package.json' },
  { id: 'markdown', name: 'Markdown', ext: '.md', defaultFile: 'README.md' },
  { id: 'rust', name: 'Rust', ext: '.rs', defaultFile: 'main.rs' },
  { id: 'go', name: 'Go', ext: '.go', defaultFile: 'main.go' },
  { id: 'cpp', name: 'C++', ext: '.cpp', defaultFile: 'main.cpp' }
];

export function getLanguageByFilename(filename) {
  if (!filename) return 'javascript';
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  switch (ext) {
    case '.js':
    case '.jsx':
    case '.mjs':
      return 'javascript';
    case '.ts':
    case '.tsx':
      return 'typescript';
    case '.py':
      return 'python';
    case '.html':
    case '.htm':
      return 'html';
    case '.css':
      return 'css';
    case '.json':
      return 'json';
    case '.md':
    case '.markdown':
      return 'markdown';
    case '.rs':
      return 'rust';
    case '.go':
      return 'go';
    case '.cpp':
    case '.cc':
    case '.h':
      return 'cpp';
    default:
      return 'plaintext';
  }
}

export function getFileBadgeColor(language) {
  switch (language) {
    case 'javascript':
      return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    case 'typescript':
      return 'text-sky-400 bg-sky-400/10 border-sky-400/20';
    case 'python':
      return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    case 'html':
      return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    case 'css':
      return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
    case 'json':
      return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    case 'markdown':
      return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    case 'rust':
      return 'text-amber-600 bg-amber-600/10 border-amber-600/20';
    case 'go':
      return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
    default:
      return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
  }
}
