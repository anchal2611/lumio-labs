# LUMIO — Collaborative Virtual Laboratory Platform

> **Tagline:** Virtual Labs. Limitless Learning.  
> **Brand Statement:** Explore. Experiment. Execute.

---

## 🌟 1. Product Overview

**LUMIO** is a university-oriented collaborative digital laboratory platform designed for computer science and engineering education. Rather than a basic online code snippet viewer or college ERP, LUMIO provides a unified ecosystem where students and faculty conduct practical experiments, write and execute software across multiple languages, simulate microcontrollers and digital circuits, collaborate in real time, and manage the full academic practical coursework lifecycle.

---

## 🚀 2. Core Portals & User Roles

LUMIO supports three dedicated role-based portals with protected routing:

### 🎓 A. Student Portal (`/student/*`)
- **Interactive Overview**: Personalized welcome, semester tracking, pending coursework alerts, and recent experiment history.
- **Laboratory Ecosystem**:
  - **Programming Labs**: Python 3.11, C/C++ Systems, Java OOP, Web Development (HTML/CSS/JS sandbox).
  - **Relational DBMS & SQL Lab**: Browser-local **SQLite WebAssembly** with visual schema explorer across University, Library, Employee, and E-commerce databases.
  - **IoT & Virtual Circuit Lab**: Interactive breadboard simulator featuring **ESP32 MCU**, LEDs, tactile pushbuttons, resistors, buzzers, and IR sensors with live **Virtual Serial Monitor** telemetry.
- **Dual Laboratory Modes**:
  - **Guided Practicals**: Objectives, theoretical background, procedure checklists, starter code, expected verification outputs, and interactive **Viva Voce oral quizzes** with instant grading explanations.
  - **Open Workspace**: Blank IDE for unconstrained algorithm development, custom file management, and instant execution.
- **Assignments & Coursework**: View deadlines, run test cases, write notes, and submit code for faculty grading.
- **Group Projects & Collaboration**: Study rooms with real-time multi-peer code synchronization, line cursor indicators, and in-room chat.
- **Ask a Teacher Doubt Forum**: Direct academic question thread with code snippet attachments and faculty-verified solution endorsements.
- **University Resource Library**: Download official PDF laboratory manuals, starter boilerplates, and dataset files.

### 🔬 B. Teacher / Faculty Portal (`/teacher/*`)
- **Teaching Overview**: Aggregated student metrics, pending submission notifications, and active laboratory sessions.
- **Curriculum & Practical Management**: Author, publish, and archive practical exercises and viva voice question banks.
- **Assignment Oversight & Evaluation**:
  - Interactive **Grading Drawer**: Inspect student source code and execution stdout, award marks per rubric criterion, and write constructive feedback.
- **Student Directory**: Monitor individual lab completion rates, submission timeliness, and academic progress.
- **Faculty Co-Authoring Space**: Real-time collaborative drafting of department laboratory manuals and starter templates.
- **Direct Consultations**: Individual guidance messaging with students.
- **Academic Analytics**: Department pass rates, average marks, and practical time-to-completion metrics.

### 🏛️ C. Administrative Portal (`/admin/*`)
- **Institutional Ecosystem Dashboard**: Monitor active students, faculty verifications, concurrent WebSocket connections, and cluster health.
- **User Directory**: Verify teacher credentials, elevate roles, and configure department allocations.
- **Laboratory Provisioning**: Configure compiler sandbox limits and enable/disable lab modules.
- **System Audit Trail**: Complete log of administrative actions, role changes, and security events.

---

## 🤝 3. Three-Way Collaboration Ecosystem

1. **Student-to-Student**:
   - Live pair programming rooms with Monaco code synchronization.
   - Participant presence markers, typing indicators, and room chat.
   - Group capstone project collaboration.
2. **Teacher-to-Teacher**:
   - Faculty co-authoring of curriculum manuals and viva voice sets.
   - Department discussion lounge.
   - Shared teaching templates and benchmarks.
3. **Student-to-Teacher**:
   - "Ask a Teacher" doubt threads with code references.
   - Faculty-endorsed solution pills.
   - Submission grading feedback and resubmission requests.

---

## 🛠️ 4. Technology Stack & Architecture

- **Frontend**:
  - **Framework**: React 18.3.1 with TypeScript
  - **Bundler**: Vite 5.4.x
  - **Styling**: Tailwind CSS 3.4.17 (strict v3 configuration avoiding v4 conflicts)
  - **Routing**: React Router 6.28.x
  - **Icons**: Lucide React
  - **Code Editor**: `@monaco-editor/react` (Python, C, C++, Java, SQL, JS)
  - **Database Engine**: `sql.js` (SQLite 3 WebAssembly loaded locally from `public/sql-wasm.wasm`)
  - **Circuit Engine**: Modular JavaScript DC/logic propagation engine with virtual serial monitoring
  - **State Management**: Zustand & `@tanstack/react-query`
- **Backend**:
  - **Runtime**: Node.js & Express with TypeScript
  - **Real-Time Engine**: Socket.IO for rooms, cursor broadcasting, and chat
  - **Security**: Helmet, CORS origin validation, sandboxed code execution
- **Execution Adapters**:
  - **Production Mode**: Configured Judge0 API cluster via `JUDGE0_API_URL` and `JUDGE0_API_KEY`.
  - **Demo / Standalone Mode**: Built-in intelligent sandbox execution simulator capable of running standard algorithms with timing and memory metrics without requiring external API keys.

---

## 💻 5. Getting Started & Local Installation

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later

### Step 1: Install Dependencies
From the repository root:
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### Step 2: Start Development Servers
Run client and server concurrently:
```bash
# In terminal 1 (Client):
cd client
npm run dev

# In terminal 2 (Server):
cd server
npm run dev
```

The application will be available at:
- **Frontend Web Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API & Sockets**: [http://localhost:5000](http://localhost:5000)

---

## ⚙️ 6. Environment Configuration

### Client (`client/.env`)
```ini
VITE_APP_NAME=LUMIO
VITE_APP_TAGLINE=Virtual Labs. Limitless Learning.
VITE_APP_BRAND_STATEMENT=Explore. Experiment. Execute.
VITE_APP_ENV=development

VITE_ENABLE_DEMO_MODE=true
VITE_ENABLE_IOT_LAB=true
VITE_ENABLE_AI_LAB=true
VITE_ENABLE_COLLABORATION=true

VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_COLLABORATION_URL=http://localhost:5000

# Optional Firebase integration:
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Server (`server/.env`)
```ini
PORT=5000
CORS_ORIGIN=http://localhost:5173
SESSION_SECRET=lumio_super_secret_session_key_2026
LOG_LEVEL=info

# Code Execution (Judge0 API)
CODE_EXECUTION_PROVIDER=judge0
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=
CODE_EXECUTION_TIMEOUT=10000
CODE_EXECUTION_MEMORY_LIMIT=128000

# Real-Time Collaboration
COLLABORATION_PROVIDER=socketio
COLLABORATION_SERVER_URL=http://localhost:5000
COLLABORATION_API_SECRET=collab_secret_key
SOCKET_CORS_ORIGIN=http://localhost:5173
```

---

## 🎭 7. Instant Demo Personas (1-Click Testing)

LUMIO is preloaded with realistic university data. Use the floating persona pill in the bottom-left corner of the screen or the login screen shortcuts to instantly switch personas:

1. **Student Persona**: Alex Chen (`alex.chen@university.edu`)
   - 4th Semester CSE, Software Engineering Major, Roll No: `CS-2024-042`.
2. **Teacher Persona**: Prof. Marcus Vance (`marcus.vance@university.edu`)
   - Associate Professor & Systems Lab Director, Computer Science Department.
3. **Administrator Persona**: Dean Sarah Jenkins (`dean.jenkins@university.edu`)
   - Dean of Academic Affairs & Digital Infrastructure.

---

## 🧪 8. Production Build Verification

To verify complete TypeScript typechecking and production bundling:
```bash
# In client:
npm run build
# -> Output: dist/ (Vite bundles index.html, JS, CSS, and SQLite WASM)

# In server:
npm run build
# -> Output: dist/ (tsc compiles to dist/index.js)
```

---

## 🚀 9. Hosting & Deployment

LUMIO is configured to be deployed as a single full-stack unified service or as separate frontend/backend services.

### Option 1: 1-Click Render Deployment (Recommended - Free Tier with WebSockets)

Render supports WebSockets and will host both the frontend and backend from a single URL using our pre-configured [`render.yaml`](./render.yaml):

1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Blueprint**.
3. Connect your repository: `anchal2611/lumio-labs`.
4. Render will read `render.yaml` automatically and configure:
   - **Build Command**: `npm run install:all && npm run build`
   - **Start Command**: `npm start`
5. Click **Apply**. Within 2-3 minutes, your live URL will be active!

### Option 2: Railway.app Deployment

1. Go to [Railway](https://railway.app).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select `anchal2611/lumio-labs`.
4. Railway will automatically detect the root `Dockerfile` and provision your application with a public domain.

### Option 3: Docker / Self-Hosted VPS (AWS, DigitalOcean, Hetzner, GCP)

Run the containerized application with a single command:
```bash
docker compose up -d --build
```
Your instance will be running on port `5000`.

### Option 4: Split Hosting (Vercel Frontend + Render Backend)

- **Frontend on Vercel:** Import `client/` subdirectory. Framework preset: **Vite**. Output: `dist`. Routing rewrites are handled by [`client/vercel.json`](./client/vercel.json).
  - Set Environment Variables:
    - `VITE_API_BASE_URL=https://<your-backend-url>/api`
    - `VITE_SOCKET_URL=https://<your-backend-url>`
- **Backend on Render/Railway:** Deploy `server/` directory or run `npm start` from root.

---

*Explore. Experiment. Execute.*  
**LUMIO Engineering Team**

