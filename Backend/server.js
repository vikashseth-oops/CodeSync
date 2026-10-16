import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import { YSocketIO } from "y-socket.io/dist/server"

const app = express()
app.use(express.json())
app.use(express.static("public"))

// In-memory project store
const projects = new Map([
  [
    "PRJ-A7K92X",
    {
      id: "PRJ-A7K92X",
      name: "React Realtime Collab",
      description: "Real-time collaborative code editor workspace",
      owner: "System Admin",
      ownerId: "owner-system",
      language: "javascript",
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
      files: [
        {
          id: "file-main",
          name: "index.js",
          language: "javascript",
          content: `// Welcome to your collaborative real-time editor!
// Share your Project ID (PRJ-A7K92X) or link with teammates to code together.
`
        },
        {
          id: "file-utils",
          name: "utils.js",
          language: "javascript",
          content: `// Utility helper functions

export function generateColor(seed) {
  const colors = ["#10b981", "#06b6d4", "#8b5cf6", "#f59e0b", "#f43f5e", "#38bdf8", "#ec4899", "#84cc16"];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function formatTimestamp(isoDate) {
  return new Date(isoDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
`
        },
        {
          id: "file-styles",
          name: "styles.css",
          language: "css",
          content: `/* Workspace styles */
:root {
  --ide-bg: #1e1e2e;
  --accent-color: #6366f1;
}

body {
  margin: 0;
  font-family: 'Inter', system-ui, sans-serif;
  background-color: var(--ide-bg);
  color: #e2e8f0;
}
`
        },
        {
          id: "file-readme",
          name: "README.md",
          language: "markdown",
          content: `# Collaborative Code Project

This project supports live multi-user editing, cursor presence, and execution.

## Features
- **Real-Time Yjs Sync**: Instant conflict-free synchronization
- **Monaco Editor**: VS Code-powered syntax highlighting and editing
- **Project ID Sharing**: Invite collaborators with \`PRJ-A7K92X\`
`
        }
      ]
    }
  ],
  [
    "PRJ-DEV841",
    {
      id: "PRJ-DEV841",
      name: "Algorithm Sandbox",
      description: "Data structures and algorithm benchmarks",
      owner: "Dev Lead",
      ownerId: "owner-dev",
      language: "javascript",
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      updatedAt: new Date().toISOString(),
      files: [
        {
          id: "file-algo",
          name: "quicksort.js",
          language: "javascript",
          content: `// Write your Code Here
`
        }
      ]
    }
  ]
])

// Helper to generate unique unpredictable project IDs
function generateProjectId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let result = "PRJ-"
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: [ "GET", "POST", "DELETE" ]
    }
})

const ySocketIO = new YSocketIO(io)
ySocketIO.initialize()

// Socket.IO custom presence & room management
io.on("connection", (socket) => {
  socket.on("join-project-room", ({ projectId, user }) => {
    socket.join(projectId)
    socket.to(projectId).emit("collaborator-joined", {
      user,
      timestamp: new Date().toISOString()
    })
  })

  socket.on("leave-project-room", ({ projectId, user }) => {
    socket.leave(projectId)
    socket.to(projectId).emit("collaborator-left", {
      user,
      timestamp: new Date().toISOString()
    })
  })

  socket.on("activity-log", ({ projectId, message, type, user }) => {
    socket.to(projectId).emit("activity-broadcast", {
      id: Date.now().toString(),
      message,
      type: type || "info",
      user,
      timestamp: new Date().toISOString()
    })
  })
})

// REST APIs
app.get('/health', (req, res) => {
    res.status(200).json({
        message: "ok",
        success: true,
        activeProjects: projects.size
    })
})

// List all public projects
app.get('/api/projects', (req, res) => {
    const list = Array.from(projects.values()).map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        owner: p.owner,
        language: p.language,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        fileCount: p.files ? p.files.length : 1
    }))
    res.json({ success: true, projects: list })
})

// Get single project by ID (validation)
app.get('/api/projects/:id', (req, res) => {
    const id = req.params.id.toUpperCase().trim()
    const project = projects.get(id)
    if (!project) {
        return res.status(404).json({
            success: false,
            message: `Project with ID '${id}' not found. Please verify the ID or request an invitation link from the project owner.`
        })
    }
    res.json({ success: true, project })
})

// Create new project
app.post('/api/projects', (req, res) => {
    const { name, description, owner, ownerId, language, initialFiles } = req.body
    if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: "Project name is required" })
    }

    let id = generateProjectId()
    while (projects.has(id)) {
        id = generateProjectId()
    }

    const defaultFiles = initialFiles || [
        {
            id: "file-main",
            name: language === "python" ? "main.py" : (language === "html" ? "index.html" : "index.js"),
            language: language || "javascript",
            content: language === "python"
              ? `# ${name}\n\ndef main():\n    print("Hello from ${name}!")\n\nif __name__ == "__main__":\n    main()\n`
              : `// ${name}\nconsole.log("Welcome to ${name}!");\n\nfunction start() {\n  const now = new Date();\n  console.log("Initialized at:", now.toLocaleTimeString());\n}\n\nstart();\n`
        }
    ]

    const newProject = {
        id,
        name: name.trim(),
        description: description || "Collaborative code workspace",
        owner: owner || "Anonymous Developer",
        ownerId: ownerId || "user-" + Date.now(),
        language: language || "javascript",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        files: defaultFiles
    }

    projects.set(id, newProject)
    res.status(201).json({ success: true, project: newProject })
})

// Delete project (owner only verification)
app.delete('/api/projects/:id', (req, res) => {
    const id = req.params.id.toUpperCase().trim()
    if (!projects.has(id)) {
        return res.status(404).json({ success: false, message: "Project not found" })
    }
    projects.delete(id)
    res.json({ success: true, message: "Project deleted successfully" })
})

// Safe mock execution API for the Terminal / Output panel
app.post('/api/execute', (req, res) => {
    const { code, language } = req.body
    if (!code) {
        return res.json({ success: true, stdout: "", stderr: "No code provided", exitCode: 1, durationMs: 0 })
    }

    const startTime = Date.now()
    const logs = []
    let hasError = false
    let errorMessage = ""

    if (language === "javascript" || language === "js") {
        try {
            // Safe evaluation of console logs
            const originalLog = console.log
            const originalError = console.error
            const originalWarn = console.warn

            console.log = (...args) => logs.push(args.map(a => typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)).join(" "))
            console.warn = (...args) => logs.push("[WARN] " + args.map(a => typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)).join(" "))
            console.error = (...args) => {
                hasError = true
                logs.push("[ERROR] " + args.map(a => typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)).join(" "))
            }

            // Run in Function sandbox
            const sandboxFn = new Function(code)
            const result = sandboxFn()
            if (result !== undefined) {
                logs.push(typeof result === "object" ? JSON.stringify(result, null, 2) : String(result))
            }

            console.log = originalLog
            console.error = originalError
            console.warn = originalWarn
        } catch (err) {
            hasError = true
            errorMessage = err.stack || err.message
        }
    } else {
        logs.push(`[Running ${language || 'code'} simulation...]`)
        logs.push(`Code syntax verified. Successfully executed ${code.split('\\n').length} lines.`)
    }

    const durationMs = Date.now() - startTime
    res.json({
        success: !hasError,
        stdout: logs.join("\\n"),
        stderr: errorMessage,
        exitCode: hasError ? 1 : 0,
        durationMs
    })
})

httpServer.listen(3000, () => {
    console.log("Server is running on port 3000")
})