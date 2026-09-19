# BuildForge AI

**AI Coding Agent** — Describe any application or game in natural language and get a complete, runnable project.

## Features

- Modern chat interface with project history
- Live Preview / Code / Files / Console panels
- Automatic project planning & generation
- Built-in generators for common apps & games (Snake, Portfolio, Calculator, Todo, and more)
- Iterative development (continue the conversation to modify)
- Export functionality
- Responsive dark theme UI

## How to Run

Simply open `index.html` in a modern browser.

```bash
# Or serve locally
npx serve .
# or
python -m http.server 8000
```

## Usage

1. Type a request such as:
   - “Build a Snake game”
   - “Create a portfolio website”
   - “Make a calculator app”
   - “Build a task management app”

2. Watch the agent:
   - Analyze requirements
   - Create a plan
   - Generate files
   - Validate
   - Show live preview

3. Continue the conversation to add features, fix bugs, or change the design.

## Project Structure

```
buildforge-ai/
├── index.html          # Main application
├── css/
│   └── styles.css      # Modern dark theme
├── js/
│   └── app.js          # Core logic + generators
├── assets/             # (future assets)
└── README.md
```

## Technology

- Pure HTML / CSS / JavaScript (no build step required)
- Modern CSS variables & flexbox/grid
- Sandboxed iframe for live preview
- Local project state (easily extendable to backend)

## Next Steps / Roadmap

- Connect real LLM backend for unlimited generation
- Secure code execution sandbox
- Full GitHub integration (push after every successful build)
- Multi-file project support with proper module system
- Sound effects & advanced game engines
- Authentication & cloud project storage

---

Built with ❤️ by the BuildForge vision.
