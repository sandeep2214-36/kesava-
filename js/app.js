/**
 * BuildForge AI — Frontend Application
 * Simulates the full AI coding agent experience
 */

// ===== State =====
const state = {
  projects: [],
  currentProjectId: null,
  isBuilding: false,
  files: {},           // { path: content }
  currentFile: null,
  messages: [],
};

// ===== DOM References =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const els = {
  chatMessages: $('#chatMessages'),
  userInput: $('#userInput'),
  btnSend: $('#btnSend'),
  btnAttach: $('#btnAttach'),
  btnNewProject: $('#btnNewProject'),
  btnExport: $('#btnExport'),
  btnRun: $('#btnRun'),
  btnStop: $('#btnStop'),
  btnReset: $('#btnReset'),
  btnCopyCode: $('#btnCopyCode'),
  projectName: $('#projectName'),
  statusDot: $('#statusDot'),
  statusText: $('#statusText'),
  progressBar: $('#progressBar'),
  progressFill: $('#progressFill'),
  progressText: $('#progressText'),
  projectList: $('#projectList'),
  fileTree: $('#fileTree'),
  fileSelector: $('#fileSelector'),
  codeContent: $('#codeContent'),
  consoleOutput: $('#consoleOutput'),
  previewContainer: $('#previewContainer'),
  sidebar: $('#sidebar'),
};

// ===== Utilities =====
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function log(msg, type = 'info') {
  const line = document.createElement('div');
  line.className = `console-line ${type}`;
  line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  els.consoleOutput.appendChild(line);
  els.consoleOutput.scrollTop = els.consoleOutput.scrollHeight;
}

function setStatus(text, status = 'ready') {
  els.statusText.textContent = text;
  els.statusDot.className = 'status-dot';
  if (status === 'busy') els.statusDot.classList.add('busy');
  if (status === 'error') els.statusDot.classList.add('error');
}

function showProgress(text, percent = 0) {
  els.progressBar.classList.remove('hidden');
  els.progressText.textContent = text;
  els.progressFill.style.width = `${percent}%`;
}

function hideProgress() {
  els.progressBar.classList.add('hidden');
  els.progressFill.style.width = '0%';
}

// ===== Chat =====
function addMessage(role, content, isHtml = false) {
  const msg = document.createElement('div');
  msg.className = `message ${role}`;
  
  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = role === 'ai' ? '⚡' : 'You';
  
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  
  if (isHtml) {
    contentDiv.innerHTML = content;
  } else {
    contentDiv.innerHTML = content
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
  }
  
  bubble.appendChild(contentDiv);
  msg.appendChild(avatar);
  msg.appendChild(bubble);
  els.chatMessages.appendChild(msg);
  els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
  
  state.messages.push({ role, content });
}

// ===== Project Management =====
function createProject(name) {
  const project = {
    id: uid(),
    name: name || 'Untitled Project',
    createdAt: Date.now(),
    files: {},
  };
  state.projects.unshift(project);
  state.currentProjectId = project.id;
  state.files = {};
  renderProjectList();
  updateProjectUI();
  return project;
}

function updateProjectUI() {
  const project = state.projects.find(p => p.id === state.currentProjectId);
  els.projectName.textContent = project ? project.name : 'No Project';
}

function renderProjectList() {
  if (state.projects.length === 0) {
    els.projectList.innerHTML = '<div class="empty-state" style="padding:20px 10px;font-size:12px;">No projects yet</div>';
    return;
  }
  
  els.projectList.innerHTML = state.projects.map(p => `
    <div class="project-item ${p.id === state.currentProjectId ? 'active' : ''}" data-id="${p.id}">
      <span class="icon">📁</span>
      <span>${p.name}</span>
    </div>
  `).join('');
  
  $$('.project-item').forEach(el => {
    el.addEventListener('click', () => {
      state.currentProjectId = el.dataset.id;
      const project = state.projects.find(p => p.id === state.currentProjectId);
      state.files = { ...project.files };
      renderProjectList();
      updateProjectUI();
      renderFileTree();
      renderFileSelector();
      log(`Switched to project: ${project.name}`, 'info');
    });
  });
}

// ===== File System Simulation =====
function setFiles(files) {
  state.files = files;
  const project = state.projects.find(p => p.id === state.currentProjectId);
  if (project) project.files = { ...files };
  renderFileTree();
  renderFileSelector();
}

function renderFileTree() {
  const paths = Object.keys(state.files).sort();
  if (paths.length === 0) {
    els.fileTree.innerHTML = '<div class="empty-state">No project files yet</div>';
    return;
  }
  
  // Simple tree view
  let html = '';
  const folders = new Set();
  
  paths.forEach(path => {
    const parts = path.split('/');
    let current = '';
    parts.forEach((part, i) => {
      if (i < parts.length - 1) {
        current += (current ? '/' : '') + part;
        if (!folders.has(current)) {
          folders.add(current);
          html += `<div class="file-item" style="padding-left:${i * 16 + 10}px">
            <span class="folder">📁</span> ${part}
          </div>`;
        }
      } else {
        html += `<div class="file-item file-clickable" data-path="${path}" style="padding-left:${i * 16 + 10}px">
          <span class="file">📄</span> ${part}
        </div>`;
      }
    });
  });
  
  els.fileTree.innerHTML = html;
  
  $$('.file-clickable').forEach(el => {
    el.addEventListener('click', () => {
      showFile(el.dataset.path);
      // Switch to Code tab
      switchTab('code');
    });
  });
}

function renderFileSelector() {
  const paths = Object.keys(state.files).sort();
  els.fileSelector.innerHTML = '<option value="">Select a file…</option>' +
    paths.map(p => `<option value="${p}">${p}</option>`).join('');
}

function showFile(path) {
  if (!state.files[path]) return;
  state.currentFile = path;
  els.fileSelector.value = path;
  els.codeContent.textContent = state.files[path];
}

// ===== Tabs =====
function switchTab(tabName) {
  $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
  $$('.tab-pane').forEach(p => p.classList.toggle('active', p.id === `pane-${tabName}`));
}

// ===== Preview =====
function showPreview(htmlContent) {
  els.previewContainer.innerHTML = '';
  const iframe = document.createElement('iframe');
  iframe.id = 'previewFrame';
  iframe.sandbox = 'allow-scripts allow-same-origin';
  els.previewContainer.appendChild(iframe);
  
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(htmlContent);
  doc.close();
  
  switchTab('preview');
  log('Preview updated', 'success');
}

function clearPreview() {
  els.previewContainer.innerHTML = `
    <div class="preview-placeholder">
      <div class="placeholder-icon">🖥️</div>
      <h3>Live Preview</h3>
      <p>Generated applications and games will appear here.</p>
      <p class="small">Start by describing what you want to build.</p>
    </div>
  `;
}

// ===== Agent Simulation =====
const BUILD_STEPS = [
  { text: 'Analyzing requirements…', percent: 10 },
  { text: 'Creating project plan…', percent: 20 },
  { text: 'Selecting technology stack…', percent: 30 },
  { text: 'Generating project structure…', percent: 45 },
  { text: 'Writing source files…', percent: 65 },
  { text: 'Adding styles & assets…', percent: 80 },
  { text: 'Validating & testing…', percent: 90 },
  { text: 'Build complete', percent: 100 },
];

async function simulateBuild(userRequest) {
  if (state.isBuilding) return;
  state.isBuilding = true;
  setStatus('Building…', 'busy');
  els.btnSend.disabled = true;
  els.btnRun.disabled = true;
  
  // Create or update project
  let projectName = extractProjectName(userRequest);
  if (!state.currentProjectId) {
    createProject(projectName);
  } else {
    const project = state.projects.find(p => p.id === state.currentProjectId);
    if (project && project.name === 'Untitled Project') {
      project.name = projectName;
      updateProjectUI();
      renderProjectList();
    }
  }
  
  log(`Starting build: "${userRequest}"`, 'info');
  
  // Show plan
  addMessage('ai', `**Plan:**\n1. Understand requirements\n2. Choose tech stack (HTML + CSS + JS)\n3. Create file structure\n4. Implement core features\n5. Add UI & polish\n6. Validate & test`);
  
  for (const step of BUILD_STEPS) {
    showProgress(step.text, step.percent);
    log(step.text, 'dim');
    await sleep(400 + Math.random() * 300);
  }
  
  // Generate actual content based on request
  const result = generateProject(userRequest);
  
  setFiles(result.files);
  
  if (result.previewHtml) {
    showPreview(result.previewHtml);
  }
  
  // Show first file in code view
  const firstFile = Object.keys(result.files)[0];
  if (firstFile) showFile(firstFile);
  
  hideProgress();
  setStatus('Ready', 'ready');
  state.isBuilding = false;
  els.btnSend.disabled = false;
  els.btnRun.disabled = false;
  
  // Success message
  addMessage('ai', result.summary);
  log('Build completed successfully', 'success');
  
  // Switch to files briefly then preview
  switchTab('files');
  setTimeout(() => switchTab('preview'), 800);
}

function extractProjectName(request) {
  const lower = request.toLowerCase();
  if (lower.includes('snake')) return 'Snake Game';
  if (lower.includes('portfolio')) return 'Portfolio Website';
  if (lower.includes('calculator')) return 'Calculator App';
  if (lower.includes('todo') || lower.includes('task')) return 'Task Manager';
  if (lower.includes('quiz')) return 'Quiz App';
  if (lower.includes('space') || lower.includes('shooter')) return 'Space Shooter';
  if (lower.includes('pong')) return 'Pong Game';
  if (lower.includes('tetris')) return 'Tetris';
  if (lower.includes('flappy')) return 'Flappy Bird';
  if (lower.includes('dashboard')) return 'Dashboard';
  if (lower.includes('landing')) return 'Landing Page';
  if (lower.includes('platformer')) return 'Platformer Game';
  if (lower.includes('racing')) return 'Racing Game';
  // Generic
  const words = request.replace(/[^\w\s]/g, '').split(/\s+/).slice(0, 4);
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'New Project';
}

function generateProject(request) {
  const lower = request.toLowerCase();
  
  // Snake Game
  if (lower.includes('snake')) {
    return generateSnakeGame();
  }
  
  // Portfolio
  if (lower.includes('portfolio')) {
    return generatePortfolio();
  }
  
  // Calculator
  if (lower.includes('calculator')) {
    return generateCalculator();
  }
  
  // Todo / Task
  if (lower.includes('todo') || lower.includes('task')) {
    return generateTodoApp();
  }
  
  // Default: generic landing / starter
  return generateStarterApp(request);
}

// ===== Generators =====
function generateSnakeGame() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Snake Game — BuildForge AI</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0d1117;
      color: #e6edf3;
      font-family: Inter, system-ui, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    h1 { font-size: 24px; margin-bottom: 8px; color: #a371f7; }
    .score { font-size: 18px; margin-bottom: 16px; color: #8b949e; }
    canvas {
      background: #161b22;
      border: 2px solid #30363d;
      border-radius: 8px;
      max-width: 100%;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    .controls { margin-top: 16px; display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
    button {
      background: #a371f7;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s;
    }
    button:hover { background: #bc8cff; }
    .hint { margin-top: 12px; font-size: 13px; color: #6e7681; text-align: center; }
  </style>
</head>
<body>
  <h1>🐍 Snake Game</h1>
  <div class="score">Score: <span id="score">0</span></div>
  <canvas id="game" width="400" height="400"></canvas>
  <div class="controls">
    <button id="startBtn">Start / Restart</button>
  </div>
  <p class="hint">Use Arrow Keys or WASD to move</p>
  <script>
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const grid = 20;
    let snake, direction, food, score, gameLoop, running;

    function init() {
      snake = [{x: 10, y: 10}];
      direction = {x: 1, y: 0};
      food = randomFood();
      score = 0;
      document.getElementById('score').textContent = score;
      running = true;
      if (gameLoop) clearInterval(gameLoop);
      gameLoop = setInterval(update, 100);
    }

    function randomFood() {
      return {
        x: Math.floor(Math.random() * (canvas.width / grid)),
        y: Math.floor(Math.random() * (canvas.height / grid))
      };
    }

    function update() {
      if (!running) return;
      const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};

      // Wall collision
      if (head.x < 0 || head.x >= canvas.width/grid || head.y < 0 || head.y >= canvas.height/grid) {
        gameOver(); return;
      }
      // Self collision
      if (snake.some(s => s.x === head.x && s.y === head.y)) {
        gameOver(); return;
      }

      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById('score').textContent = score;
        food = randomFood();
      } else {
        snake.pop();
      }
      draw();
    }

    function draw() {
      ctx.fillStyle = '#161b22';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Food
      ctx.fillStyle = '#f85149';
      ctx.beginPath();
      ctx.roundRect(food.x * grid, food.y * grid, grid - 2, grid - 2, 4);
      ctx.fill();

      // Snake
      snake.forEach((s, i) => {
        ctx.fillStyle = i === 0 ? '#a371f7' : '#58a6ff';
        ctx.beginPath();
        ctx.roundRect(s.x * grid, s.y * grid, grid - 2, grid - 2, 4);
        ctx.fill();
      });
    }

    function gameOver() {
      running = false;
      clearInterval(gameLoop);
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#e6edf3';
      ctx.font = 'bold 28px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', canvas.width/2, canvas.height/2 - 10);
      ctx.font = '16px Inter, sans-serif';
      ctx.fillStyle = '#8b949e';
      ctx.fillText('Score: ' + score, canvas.width/2, canvas.height/2 + 20);
    }

    document.addEventListener('keydown', e => {
      const key = e.key.toLowerCase();
      if ((key === 'arrowup' || key === 'w') && direction.y === 0) direction = {x:0, y:-1};
      if ((key === 'arrowdown' || key === 's') && direction.y === 0) direction = {x:0, y:1};
      if ((key === 'arrowleft' || key === 'a') && direction.x === 0) direction = {x:-1, y:0};
      if ((key === 'arrowright' || key === 'd') && direction.x === 0) direction = {x:1, y:0};
    });

    document.getElementById('startBtn').addEventListener('click', init);
    // Auto start
    init();
  </script>
</body>
</html>`;

  return {
    files: {
      'index.html': html,
      'README.md': '# Snake Game\n\nBuilt with BuildForge AI\n\n## Controls\n- Arrow keys or WASD to move\n- Click Start/Restart to play again\n\n## Features\n- Score tracking\n- Collision detection\n- Smooth gameplay\n- Responsive canvas'
    },
    previewHtml: html,
    summary: `**Snake Game** built successfully.\n\n✓ Game loop & canvas rendering\n✓ Keyboard controls (Arrow / WASD)\n✓ Score system\n✓ Collision detection (walls + self)\n✓ Restart button\n✓ Modern dark UI\n\nPreview is ready. Use the arrow keys to play!`
  };
}

function generatePortfolio() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portfolio — BuildForge AI</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Inter, system-ui, sans-serif; background: #0d1117; color: #e6edf3; line-height: 1.6; }
    header { padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #30363d; }
    .logo { font-weight: 700; font-size: 20px; color: #a371f7; }
    nav a { color: #8b949e; text-decoration: none; margin-left: 24px; font-size: 14px; }
    nav a:hover { color: #e6edf3; }
    .hero { text-align: center; padding: 100px 20px; }
    .hero h1 { font-size: 48px; margin-bottom: 16px; background: linear-gradient(135deg, #a371f7, #58a6ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero p { font-size: 18px; color: #8b949e; max-width: 500px; margin: 0 auto 32px; }
    .btn { display: inline-block; background: #a371f7; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .btn:hover { background: #bc8cff; }
    section { max-width: 900px; margin: 0 auto; padding: 60px 20px; }
    h2 { font-size: 28px; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
    .card { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 24px; }
    .card h3 { margin-bottom: 8px; color: #a371f7; }
    .card p { color: #8b949e; font-size: 14px; }
    footer { text-align: center; padding: 40px; color: #6e7681; font-size: 13px; border-top: 1px solid #30363d; }
  </style>
</head>
<body>
  <header>
    <div class="logo">Alex Rivera</div>
    <nav>
      <a href="#about">About</a>
      <a href="#projects">Projects</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>
  <section class="hero">
    <h1>Full-Stack Developer</h1>
    <p>I build modern web applications and delightful user experiences with clean code and thoughtful design.</p>
    <a href="#projects" class="btn">View My Work</a>
  </section>
  <section id="about">
    <h2>About Me</h2>
    <p style="color:#8b949e">Passionate developer with experience in React, Node.js, and modern web technologies. I love turning ideas into polished products.</p>
  </section>
  <section id="projects">
    <h2>Featured Projects</h2>
    <div class="grid">
      <div class="card"><h3>Project Alpha</h3><p>A real-time collaboration tool built with React and WebSockets.</p></div>
      <div class="card"><h3>Dashboard Pro</h3><p>Analytics dashboard with beautiful charts and dark mode.</p></div>
      <div class="card"><h3>Mobile First</h3><p>Responsive e-commerce experience optimized for conversion.</p></div>
    </div>
  </section>
  <section id="contact">
    <h2>Get In Touch</h2>
    <p style="color:#8b949e">Email: hello@alexrivera.dev</p>
  </section>
  <footer>Built with BuildForge AI • © 2026</footer>
</body>
</html>`;

  return {
    files: {
      'index.html': html,
      'README.md': '# Portfolio Website\n\nModern personal portfolio built with BuildForge AI.\n\n## Features\n- Responsive design\n- Dark theme\n- Smooth sections\n- Clean typography'
    },
    previewHtml: html,
    summary: `**Portfolio Website** built successfully.\n\n✓ Modern dark theme\n✓ Responsive layout\n✓ Hero + About + Projects + Contact\n✓ Smooth navigation\n✓ Clean typography & cards\n\nPreview is ready.`
  };
}

function generateCalculator() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Calculator — BuildForge AI</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0d1117;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: Inter, system-ui, sans-serif;
    }
    .calc {
      background: #161b22;
      border-radius: 16px;
      padding: 20px;
      width: 300px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.5);
      border: 1px solid #30363d;
    }
    .display {
      background: #0d1117;
      border-radius: 10px;
      padding: 20px;
      text-align: right;
      font-size: 32px;
      color: #e6edf3;
      margin-bottom: 16px;
      min-height: 70px;
      word-break: break-all;
      font-family: 'JetBrains Mono', monospace;
    }
    .keys {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    button {
      border: none;
      border-radius: 10px;
      padding: 18px;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      background: #21262d;
      color: #e6edf3;
    }
    button:hover { background: #30363d; }
    button.op { background: #a371f7; color: white; }
    button.op:hover { background: #bc8cff; }
    button.eq { background: #58a6ff; color: white; grid-column: span 2; }
    button.eq:hover { background: #79b8ff; }
    button.clear { background: #f85149; color: white; }
  </style>
</head>
<body>
  <div class="calc">
    <div class="display" id="display">0</div>
    <div class="keys">
      <button class="clear" onclick="clearDisplay()">C</button>
      <button onclick="append('(')">(</button>
      <button onclick="append(')')">)</button>
      <button class="op" onclick="append('/')">÷</button>
      <button onclick="append('7')">7</button>
      <button onclick="append('8')">8</button>
      <button onclick="append('9')">9</button>
      <button class="op" onclick="append('*')">×</button>
      <button onclick="append('4')">4</button>
      <button onclick="append('5')">5</button>
      <button onclick="append('6')">6</button>
      <button class="op" onclick="append('-')">−</button>
      <button onclick="append('1')">1</button>
      <button onclick="append('2')">2</button>
      <button onclick="append('3')">3</button>
      <button class="op" onclick="append('+')">+</button>
      <button onclick="append('0')">0</button>
      <button onclick="append('.')">.</button>
      <button class="eq" onclick="calculate()">=</button>
    </div>
  </div>
  <script>
    const display = document.getElementById('display');
    let expr = '';
    function append(val) {
      if (expr === '0' && val !== '.') expr = '';
      expr += val;
      display.textContent = expr;
    }
    function clearDisplay() {
      expr = '';
      display.textContent = '0';
    }
    function calculate() {
      try {
        const result = Function('"use strict"; return (' + expr.replace(/×/g,'*').replace(/÷/g,'/') + ')')();
        expr = String(result);
        display.textContent = expr;
      } catch {
        display.textContent = 'Error';
        expr = '';
      }
    }
  </script>
</body>
</html>`;

  return {
    files: {
      'index.html': html,
      'README.md': '# Calculator App\n\nClean calculator built with BuildForge AI.'
    },
    previewHtml: html,
    summary: `**Calculator App** built successfully.\n\n✓ Clean modern UI\n✓ Basic operations (+ − × ÷)\n✓ Clear & equals\n✓ Error handling\n✓ Responsive layout\n\nPreview is ready.`
  };
}

function generateTodoApp() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Task Manager — BuildForge AI</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0d1117; color: #e6edf3; font-family: Inter, system-ui, sans-serif; min-height: 100vh; padding: 40px 20px; }
    .container { max-width: 520px; margin: 0 auto; }
    h1 { font-size: 28px; margin-bottom: 8px; color: #a371f7; }
    .subtitle { color: #8b949e; margin-bottom: 24px; font-size: 14px; }
    .input-row { display: flex; gap: 10px; margin-bottom: 24px; }
    input { flex: 1; background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 12px 16px; color: #e6edf3; font-size: 14px; outline: none; }
    input:focus { border-color: #a371f7; }
    button.add { background: #a371f7; color: white; border: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    button.add:hover { background: #bc8cff; }
    .task { display: flex; align-items: center; gap: 12px; background: #161b22; border: 1px solid #30363d; border-radius: 10px; padding: 14px 16px; margin-bottom: 10px; }
    .task.done span { text-decoration: line-through; color: #6e7681; }
    .task input[type=checkbox] { width: 18px; height: 18px; accent-color: #a371f7; cursor: pointer; }
    .task span { flex: 1; font-size: 14px; }
    .task button { background: none; border: none; color: #f85149; cursor: pointer; font-size: 16px; opacity: 0.7; }
    .task button:hover { opacity: 1; }
    .empty { text-align: center; color: #6e7681; padding: 40px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Task Manager</h1>
    <p class="subtitle">Stay organized. Get things done.</p>
    <div class="input-row">
      <input type="text" id="taskInput" placeholder="Add a new task…" />
      <button class="add" onclick="addTask()">Add</button>
    </div>
    <div id="taskList"></div>
  </div>
  <script>
    let tasks = JSON.parse(localStorage.getItem('bf-tasks') || '[]');
    function render() {
      const list = document.getElementById('taskList');
      if (tasks.length === 0) {
        list.innerHTML = '<div class="empty">No tasks yet. Add one above!</div>';
        return;
      }
      list.innerHTML = tasks.map((t, i) => \`
        <div class="task \${t.done ? 'done' : ''}">
          <input type="checkbox" \${t.done ? 'checked' : ''} onchange="toggle(\${i})" />
          <span>\${t.text}</span>
          <button onclick="remove(\${i})">✕</button>
        </div>
      \`).join('');
    }
    function addTask() {
      const input = document.getElementById('taskInput');
      const text = input.value.trim();
      if (!text) return;
      tasks.push({ text, done: false });
      input.value = '';
      save();
      render();
    }
    function toggle(i) { tasks[i].done = !tasks[i].done; save(); render(); }
    function remove(i) { tasks.splice(i, 1); save(); render(); }
    function save() { localStorage.setItem('bf-tasks', JSON.stringify(tasks)); }
    document.getElementById('taskInput').addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
    render();
  </script>
</body>
</html>`;

  return {
    files: {
      'index.html': html,
      'README.md': '# Task Manager\n\nSimple & clean todo app with localStorage persistence.\n\nBuilt with BuildForge AI.'
    },
    previewHtml: html,
    summary: `**Task Manager** built successfully.\n\n✓ Add / complete / delete tasks\n✓ Persistent storage (localStorage)\n✓ Clean modern UI\n✓ Keyboard support (Enter to add)\n✓ Empty state\n\nPreview is ready.`
  };
}

function generateStarterApp(request) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>App — BuildForge AI</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0d1117;
      color: #e6edf3;
      font-family: Inter, system-ui, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
    }
    h1 { font-size: 36px; margin-bottom: 12px; background: linear-gradient(135deg, #a371f7, #58a6ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    p { color: #8b949e; max-width: 400px; margin-bottom: 24px; }
    .badge { background: #21262d; border: 1px solid #30363d; padding: 6px 14px; border-radius: 20px; font-size: 13px; color: #a371f7; }
  </style>
</head>
<body>
  <h1>Your App is Ready</h1>
  <p>This is a starter template generated for: <strong>${request.slice(0, 80)}</strong></p>
  <div class="badge">Built with BuildForge AI</div>
</body>
</html>`;

  return {
    files: {
      'index.html': html,
      'README.md': `# Generated App\n\nRequest: ${request}\n\nBuilt with BuildForge AI.`
    },
    previewHtml: html,
    summary: `**Project** created successfully.\n\nI generated a clean starter based on your request.\nYou can continue refining it by telling me what features to add.`
  };
}

// ===== Helpers =====
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ===== Event Listeners =====
function init() {
  // Send message
  els.btnSend.addEventListener('click', handleSend);
  els.userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // Auto-resize textarea
  els.userInput.addEventListener('input', () => {
    els.userInput.style.height = 'auto';
    els.userInput.style.height = Math.min(els.userInput.scrollHeight, 120) + 'px';
  });

  // Tabs
  $$('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // File selector
  els.fileSelector.addEventListener('change', () => {
    if (els.fileSelector.value) showFile(els.fileSelector.value);
  });

  // Copy code
  els.btnCopyCode.addEventListener('click', () => {
    navigator.clipboard.writeText(els.codeContent.textContent).then(() => {
      log('Code copied to clipboard', 'success');
    });
  });

  // New Project
  els.btnNewProject.addEventListener('click', () => {
    createProject('Untitled Project');
    state.files = {};
    renderFileTree();
    renderFileSelector();
    clearPreview();
    els.codeContent.textContent = '// Code will appear here after generation';
    addMessage('ai', 'New project created. Describe what you want to build.');
    log('New project started', 'info');
  });

  // Export
  els.btnExport.addEventListener('click', () => {
    if (Object.keys(state.files).length === 0) {
      log('Nothing to export', 'warning');
      return;
    }
    // Simple download of index.html if present
    const content = state.files['index.html'] || Object.values(state.files)[0];
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (state.projects.find(p => p.id === state.currentProjectId)?.name || 'project') + '.html';
    a.click();
    URL.revokeObjectURL(url);
    log('Project exported', 'success');
  });

  // Run / Stop / Reset
  els.btnRun.addEventListener('click', () => {
    if (state.files['index.html']) {
      showPreview(state.files['index.html']);
      log('Running project…', 'info');
    } else {
      log('No runnable files found', 'warning');
    }
  });

  els.btnReset.addEventListener('click', () => {
    clearPreview();
    log('Preview reset', 'info');
  });

  // Example clicks
  document.addEventListener('click', (e) => {
    if (e.target.matches('.example-list li')) {
      const text = e.target.textContent.replace(/[“”]/g, '').trim();
      els.userInput.value = text;
      handleSend();
    }
  });

  // Sidebar toggle
  $('#btnToggleSidebar')?.addEventListener('click', () => {
    els.sidebar.classList.toggle('collapsed');
  });

  log('BuildForge AI initialized', 'success');
  setStatus('Ready', 'ready');
}

function handleSend() {
  const text = els.userInput.value.trim();
  if (!text || state.isBuilding) return;
  
  addMessage('user', text);
  els.userInput.value = '';
  els.userInput.style.height = 'auto';
  
  // Simulate agent response
  simulateBuild(text);
}

// Boot
document.addEventListener('DOMContentLoaded', init);
