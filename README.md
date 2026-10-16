# CodeSync ⚡

> **A High-Performance Real-Time Collaborative Cloud Code Editor & Workspace IDE**

[![Node.js Version](https://img.shields.io/badge/Node.js-v20-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-v19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-v4-010101?logo=socketdotio&logoColor=white)](https://socket.io/)
[![Yjs CRDT](https://img.shields.io/badge/CRDT-Yjs-orange)](https://github.com/yjs/yjs)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![AWS](https://img.shields.io/badge/AWS-Deployable-FF9900?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)

---

## 📖 Overview

**CodeSync** is a modern, web-based collaborative IDE that enables software development teams to write, review, and execute code together in real-time. Built on top of **Conflict-free Replicated Data Types (CRDTs)** powered by **Yjs** and the **Monaco Editor** (the engine behind Visual Studio Code), CodeSync guarantees instant synchronization across distributed clients with zero merge conflicts.

The application is architected as a lightweight, modular system with an Express + Socket.IO backend and a React 19 frontend, packaged into a single container image using an optimized multi-stage **Dockerfile** engineered for production deployments on **AWS** (ECS, EC2, or App Runner).

---

## ✨ Features

- **🚀 Real-Time Collaborative Editing**:
  - Sub-millisecond text synchronization powered by **Yjs CRDTs** over WebSockets (`y-socket.io`).
  - Remote cursor positions and multi-user selection indicators in real time.
  - Conflict-free concurrent typing across multiple files.

- **💻 Monaco Code Editor (VS Code Powered)**:
  - Rich syntax highlighting for JavaScript, Python, CSS, HTML, Markdown, and JSON.
  - IntelliSense, bracket matching, code folding, line numbering, and indentation guides.
  - Customizable editor themes (`VS Dark`, `Light+`, `Monokai`, `Dracula`).

- **📁 Project & File Management**:
  - Interactive multi-file tree explorer with file creation, deletion, and renaming.
  - Multi-tab navigation with smart dirty-state tracking.
  - Unique shareable Project IDs (e.g. `PRJ-A7K92X`) with one-click URL invitation.
  - Dashboard view with search, recent projects history, and quick-start templates.

- **⚡ Code Execution Engine**:
  - Interactive bottom panel terminal for executing code.
  - Sandboxed execution API (`/api/execute`) with output capturing (`stdout`, `stderr`, execution duration, and exit codes).

- **👥 Presence & Live Activity Feed**:
  - Color-coded collaborator avatars and presence indicators.
  - Live activity log broadcasting real-time actions (joined, file edits, code runs).

- **🐳 Containerized & Cloud Ready**:
  - Multi-stage Dockerfile bundling frontend build artifacts into the backend server.
  - Unified server serving both static production assets and WebSocket/REST APIs on a single port (`3000`).

---

## 🏗️ Architecture

```
                       ┌───────────────────────────────────────────┐
                       │               Web Browser                 │
                       │   React 19 + Monaco Editor + Yjs Client   │
                       └─────────────┬─────────────────────────────┘
                                     │
                        HTTP / REST  │  WebSockets (Socket.IO + Yjs)
                                     │
                       ┌─────────────▼─────────────────────────────┐
                       │          Express & Node.js Server         │
                       │───────────────────────────────────────────┤
                       │  • In-Memory Project Store & REST APIs   │
                       │  • YSocketIO Sync Server (CRDT Rooms)     │
                       │  • Sandboxed Execution Engine             │
                       │  • Static File Server (Frontend bundle)   │
                       └───────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Monaco Editor (`@monaco-editor/react`), `yjs`, `y-monaco`, `y-socket.io`, Lucide Icons |
| **Backend** | Node.js 20, Express 5, `socket.io`, `y-socket.io`, HTTP Server |
| **Collaboration** | Yjs CRDTs (Conflict-free Replicated Data Types) + WebSocket Awareness Provider |
| **DevOps & Cloud** | Docker (Multi-stage build), AWS (EC2 / ECS Fargate / ECR / App Runner) |

---

## 📁 Repository Structure

```
CodeSync/
├── .dockerignore            # Docker build ignore rules
├── .gitignore               # Comprehensive Git ignore rules
├── dockerfile               # Production multi-stage Docker build
├── README.md                # Project documentation
│
├── Backend/                 # Node.js + Express + Socket.IO Server
│   ├── package.json         # Backend dependencies & scripts
│   ├── package-lock.json
│   └── server.js            # Express API, Yjs WebSocket & execution engine
│
└── Frontend/                # React 19 + Vite + Monaco Editor
    ├── package.json         # Frontend dependencies & scripts
    ├── vite.config.js       # Vite configuration with Tailwind CSS plugin
    ├── index.html           # HTML entry point
    └── src/
        ├── app/             # Main Application root & styling
        │   ├── App.jsx      # Workspace orchestrator, Yjs provider & state
        │   └── App.css      # Core IDE layout styles
        ├── components/      # UI Components
        │   ├── Navbar.jsx   # Top navigation, project info & actions
        │   ├── ActivityBar.jsx # VS Code style left icon bar
        │   ├── Sidebar.jsx  # File explorer, collaborators, settings
        │   ├── EditorPanel.jsx # Monaco Editor with Yjs bindings & tabs
        │   ├── BottomPanel.jsx # Terminal & code output console
        │   ├── Dashboard.jsx# Project selection & creation dashboard
        │   ├── StatusBar.jsx# Connection, language, cursor line stats
        │   └── ToastContainer.jsx # Toast notification stack
        ├── modals/          # Modal dialogs
        │   ├── WelcomeModal.jsx
        │   ├── NewProjectModal.jsx
        │   ├── ShareProjectModal.jsx
        │   └── JoinProjectModal.jsx
        └── utils/           # Helper libraries
            ├── colors.js    # Collaborator avatar & cursor color generation
            ├── languages.js # Extension-to-language mappings
            └── storage.js   # LocalStorage persistence helpers
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **Docker**: (Optional) For containerized execution

---

### Local Development Setup

To run CodeSync locally with Hot Module Replacement (HMR):

#### 1. Start the Backend Server

```bash
# Navigate to Backend directory
cd Backend

# Install dependencies
npm install

# Start the server (runs on port 3000)
npm run dev
# or: npm start
```

The backend server will start on `http://localhost:3000`.

#### 2. Start the Frontend Client

Open a second terminal window:

```bash
# Navigate to Frontend directory
cd Frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend will start on `http://localhost:5173` (or the port specified by Vite). Open your browser and navigate to the displayed URL to start coding!

---

## 🐳 Docker Deployment

CodeSync features a production-ready, **multi-stage Docker build** that:
1. Compiles the React frontend using Vite into optimized static assets.
2. Embeds the static bundle directly into the Express backend's `public/` directory.
3. Produces a single lightweight Alpine Linux image running the unified server on port `3000`.

### 1. Build the Docker Image

From the root directory:

```bash
docker build -t codesync:latest .
```

### 2. Run the Container

```bash
docker run -d -p 3000:3000 --name codesync-app codesync:latest
```

Open `http://localhost:3000` in your browser. Both the web interface, REST APIs, and WebSocket collaboration channels will run seamlessly from the container.

---

## ☁️ Deploying to AWS

### Option 1: AWS Elastic Container Service (ECS) with AWS Fargate

1. **Authenticate Docker with Amazon ECR**:
   ```bash
   aws ecr get-login-password --region <your-region> | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.<your-region>.amazonaws.com
   ```

2. **Create an ECR Repository and Push**:
   ```bash
   aws ecr create-repository --repository-name codesync --region <your-region>
   docker tag codesync:latest <aws_account_id>.dkr.ecr.<your-region>.amazonaws.com/codesync:latest
   docker push <aws_account_id>.dkr.ecr.<your-region>.amazonaws.com/codesync:latest
   ```

3. **Deploy with ECS Task Definition**:
   - Create an ECS Cluster.
   - Define a Task Definition pointing to your ECR image with container port `3000`.
   - Launch an ECS Service using **Fargate** behind an **Application Load Balancer (ALB)**.
   - *Note*: Ensure the ALB enables sticky sessions or supports WebSocket upgrade headers for Socket.IO.

### Option 2: AWS EC2 Instance

1. Launch an Amazon Linux 2023 or Ubuntu EC2 instance.
2. Configure Security Group: Inbound rule allowing TCP on port `3000` (or `80`/`443` if using Nginx reverse proxy).
3. Connect via SSH and install Docker:
   ```bash
   sudo dnf install docker -y      # Amazon Linux 2023
   sudo systemctl start docker
   sudo usermod -aG docker ec2-user
   ```
4. Clone repository, build and run:
   ```bash
   git clone <your-repo-url>
   cd CodeSync
   docker build -t codesync .
   docker run -d --restart always -p 3000:3000 codesync
   ```

---

## 📡 API Reference

### REST Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check endpoint returning server status and active project count |
| `GET` | `/api/projects` | List all available workspaces/projects |
| `GET` | `/api/projects/:id` | Fetch project details and files by Project ID (e.g., `PRJ-A7K92X`) |
| `POST` | `/api/projects` | Create a new project workspace |
| `DELETE` | `/api/projects/:id` | Delete a project workspace |
| `POST` | `/api/execute` | Safely evaluate JavaScript code and return `stdout`, `stderr`, and duration |

### WebSocket Events (Socket.IO)

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `join-project-room` | Client ➔ Server | `{ projectId, user }` | Joins a collaborative workspace room |
| `leave-project-room`| Client ➔ Server | `{ projectId, user }` | Leaves a collaborative workspace room |
| `collaborator-joined` | Server ➔ Client | `{ user, timestamp }` | Broadcast to peers when a user enters |
| `collaborator-left` | Server ➔ Client | `{ user, timestamp }` | Broadcast to peers when a user exits |
| `activity-log` | Client ➔ Server | `{ projectId, message, type, user }` | Sends activity event |
| `activity-broadcast` | Server ➔ Client | `{ id, message, type, user, timestamp }` | Dispatches activity update to all room members |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## 👨‍💻 Author

**Vikash Seth**
- 🎓 **Education**: B.Tech in Electronics and Communication Engineering (ECE), 3rd Year
- 🏛️ **College / Institution**: National Institute of Technology, Patna (NIT Patna)
- 📬 **Connect with me**: [sethv4506@gmail.com](mailto:sethv4506@gmail.com)

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
