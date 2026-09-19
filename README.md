# BuildForge AI

**Full-stack AI Coding Agent** — Describe any application or game in natural language and get a complete, runnable project.

## Architecture

```
buildforge-ai/
├── backend/
│   ├── server.js              # Express API server
│   └── services/
│       ├── generator.js       # Code generation engine
│       └── store.js           # In-memory project store
├── public/                    # Frontend (served by Express)
│   ├── index.html
│   ├── css/styles.css
│   └── js/app.js
├── package.json
└── README.md
```

## Features

- Modern chat interface with project history
- Live Preview / Code / Files / Console panels
- Backend API for generation & project management
- Built-in generators: Snake, Space Shooter, Portfolio, Calculator, Todo, and more
- Iterative development via conversation
- Export functionality
- Responsive dark theme

## Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start

# Open in browser
http://localhost:3000
```

Development mode (auto-restart on changes):

```bash
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/health` | Health check |
| GET    | `/api/projects` | List all projects |
| POST   | `/api/projects` | Create project |
| GET    | `/api/projects/:id` | Get project |
| DELETE | `/api/projects/:id` | Delete project |
| POST   | `/api/chat` | **Main agent endpoint** — send natural language request |
| GET    | `/api/projects/:id/files` | Get project files |
| GET    | `/api/projects/:id/messages` | Chat history |

### Example chat request

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Build a Snake game"}'
```

## Usage

1. Open http://localhost:3000
2. Type a request:
   - “Build a Snake game”
   - “Create a portfolio website”
   - “Make a space shooter”
   - “Build a task management app”
3. Watch the agent plan → generate → preview
4. Continue the conversation to modify the project

## Technology

- **Backend**: Node.js + Express
- **Frontend**: Vanilla HTML / CSS / JS
- **Storage**: In-memory (easy to swap for SQLite/Postgres)
- **Preview**: Sandboxed iframe

## Extending

- Add new generators in `backend/services/generator.js`
- Replace in-memory store with a real database
- Connect a real LLM by modifying the `build()` function
- Add authentication middleware as needed

## License

MIT
