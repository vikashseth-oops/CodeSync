import { useState } from 'react';
import { Plus, X, Sparkles, Code2, Globe, FileTerminal, Cpu } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../utils/languages';

const TEMPLATES = [
  {
    id: 'javascript',
    name: 'JavaScript / Node',
    desc: 'Modern ES6+ JavaScript sandbox with utility modules',
    icon: Code2,
    language: 'javascript',
    files: [
      {
        id: 'file-main',
        name: 'index.js',
        language: 'javascript',
        content: `// Real-Time Collaborative Workspace
console.log("🚀 Project initialized!");

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const terms = 10;
const series = Array.from({ length: terms }, (_, i) => fibonacci(i));
console.log(\`First \${terms} Fibonacci numbers:\`, series);
`
      },
      {
        id: 'file-utils',
        name: 'helpers.js',
        language: 'javascript',
        content: `export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}
`
      }
    ]
  },
  {
    id: 'python',
    name: 'Python Sandbox',
    desc: 'Standard Python script with clean execution and algorithms',
    icon: FileTerminal,
    language: 'python',
    files: [
      {
        id: 'file-py',
        name: 'main.py',
        language: 'python',
        content: `# Collaborative Python Workspace

def calculate_primes(limit):
    primes = []
    for num in range(2, limit + 1):
        if all(num % i != 0 for i in range(2, int(num**0.5) + 1)):
            primes.append(num)
    return primes

print("⚡ Prime numbers up to 50:")
print(calculate_primes(50))
`
      }
    ]
  },
  {
    id: 'web',
    name: 'Web Sandbox (HTML/CSS)',
    desc: 'Full web development playground with index.html, styles, and script',
    icon: Globe,
    language: 'html',
    files: [
      {
        id: 'file-html',
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CodeSync Web App</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="card">
    <h1>🚀 Hello CodeSync!</h1>
    <p>Real-time collaborative web development.</p>
    <button id="btn">Click me</button>
  </div>
  <script src="script.js"></script>
</body>
</html>
`
      },
      {
        id: 'file-css',
        name: 'styles.css',
        language: 'css',
        content: `body {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #0f172a;
  color: #f8fafc;
  font-family: system-ui, sans-serif;
}

.card {
  padding: 2rem;
  background: #1e293b;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  text-align: center;
}

button {
  background: #6366f1;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
}
`
      },
      {
        id: 'file-js',
        name: 'script.js',
        language: 'javascript',
        content: `document.getElementById('btn')?.addEventListener('click', () => {
  alert('Connected collaboratively!');
});
`
      }
    ]
  },
  {
    id: 'algorithms',
    name: 'Data Structures & Algorithms',
    desc: 'Sorting, trees, graphs, and benchmark testing playground',
    icon: Cpu,
    language: 'javascript',
    files: [
      {
        id: 'file-ds',
        name: 'binarySearch.js',
        language: 'javascript',
        content: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

const list = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
console.log("Array:", list);
console.log("Search for 23 index:", binarySearch(list, 23));
`
      }
    ]
  }
];

export default function NewProjectModal({
  isOpen,
  onClose,
  onCreateProject,
  currentUser
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a project name');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const template = TEMPLATES.find(t => t.id === selectedTemplate) || TEMPLATES[0];

      // Call backend API to create project and obtain verified unique Project ID
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || template.desc,
          language: template.language,
          owner: currentUser?.name || 'Dev User',
          ownerId: currentUser?.id || 'user-default',
          initialFiles: template.files
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.project) {
        onCreateProject(data.project);
        onClose();
      } else {
        setError(data.message || 'Failed to create project on server');
      }
    } catch {
      // Offline fallback: generate locally
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let localId = "PRJ-";
      for (let i = 0; i < 6; i++) localId += chars.charAt(Math.floor(Math.random() * chars.length));

      const template = TEMPLATES.find(t => t.id === selectedTemplate) || TEMPLATES[0];
      const localProject = {
        id: localId,
        name: name.trim(),
        description: description.trim() || template.desc,
        language: template.language,
        owner: currentUser?.name || 'You',
        ownerId: currentUser?.id || 'user-local',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        files: template.files
      };
      onCreateProject(localProject);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#1c1c20] border border-[#2e2e35] rounded-xl shadow-2xl overflow-hidden text-[#e8e8ed] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2e2e35] bg-[#17171a]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#6366f1]/10 border border-[#6366f1]/25 flex items-center justify-center text-[#6366f1]">
              <Plus className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Create New Project</h2>
              <p className="text-[11px] text-[#9999a8]">Start a collaborative workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#9999a8] hover:text-white p-1 rounded hover:bg-[#26262c] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-[#9999a8] mb-1.5">
              Project Name <span className="text-[#ef4444]">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Distributed Cache or Live Game Engine"
              className="w-full px-3 py-2 rounded-md bg-[#17171a] border border-[#2e2e35] text-white placeholder-[#5c5c6a] text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#9999a8] mb-1.5">
              Description <span className="text-[#5c5c6a] lowercase">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief project goal or architecture summary"
              className="w-full px-3 py-2 rounded-md bg-[#17171a] border border-[#2e2e35] text-white placeholder-[#5c5c6a] text-sm focus:outline-none focus:border-[#6366f1] transition-colors"
            />
          </div>

          {/* Starter Templates */}
          <div>
            <label className="block text-[11px] font-medium text-[#9999a8] mb-1.5">
              Starter Template
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map(t => {
                const Icon = t.icon;
                const isSelected = selectedTemplate === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#6366f1]/10 border-[#6366f1] text-white'
                        : 'bg-[#17171a] border-[#2e2e35] text-[#9999a8] hover:border-[#383840] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#6366f1]' : 'text-[#9999a8]'}`} />
                      <span className="text-xs font-semibold truncate">
                        {t.name}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#5c5c6a] line-clamp-2 leading-relaxed">
                      {t.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-[#ef4444]/10 border border-[#ef4444]/25 rounded-md text-xs text-[#ef4444]">
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-[#2e2e35] flex items-center justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-[#9999a8] hover:text-white rounded hover:bg-[#202024] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-2 bg-[#6366f1] hover:bg-[#5254cc] disabled:opacity-40 text-white font-medium rounded-md text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

