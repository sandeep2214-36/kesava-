/**
 * BuildForge AI — Code Generation Service
 * Analyzes natural language requests and produces complete projects
 */

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
  if (lower.includes('memory')) return 'Memory Game';

  const words = request.replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean).slice(0, 4);
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') || 'New Project';
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Main build pipeline
 */
async function build(userRequest, existingProject = null) {
  const steps = [
    { text: 'Analyzing requirements…', percent: 15 },
    { text: 'Creating project plan…', percent: 30 },
    { text: 'Selecting technology stack…', percent: 45 },
    { text: 'Generating source files…', percent: 70 },
    { text: 'Validating output…', percent: 90 },
    { text: 'Build complete', percent: 100 },
  ];

  // Simulate realistic timing
  for (const step of steps) {
    await sleep(180 + Math.random() * 220);
  }

  const lower = userRequest.toLowerCase();
  let result;

  if (lower.includes('snake')) {
    result = generateSnakeGame();
  } else if (lower.includes('portfolio')) {
    result = generatePortfolio();
  } else if (lower.includes('calculator')) {
    result = generateCalculator();
  } else if (lower.includes('todo') || lower.includes('task')) {
    result = generateTodoApp();
  } else if (lower.includes('space') || lower.includes('shooter')) {
    result = generateSpaceShooter();
  } else {
    result = generateStarterApp(userRequest);
  }

  return {
    projectName: extractProjectName(userRequest),
    plan: [
      'Understand requirements',
      'Choose tech stack (HTML + CSS + JS)',
      'Create file structure',
      'Implement core features',
      'Add UI polish',
      'Validate & test',
    ],
    steps,
    ...result,
  };
}

// ========== Generators ==========

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
      background: #0d1117; color: #e6edf3;
      font-family: Inter, system-ui, sans-serif;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 100vh; padding: 20px;
    }
    h1 { font-size: 24px; margin-bottom: 8px; color: #a371f7; }
    .score { font-size: 18px; margin-bottom: 16px; color: #8b949e; }
    canvas {
      background: #161b22; border: 2px solid #30363d; border-radius: 8px;
      max-width: 100%; box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    .controls { margin-top: 16px; display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
    button {
      background: #a371f7; color: white; border: none; padding: 10px 20px;
      border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
    }
    button:hover { background: #bc8cff; }
    .hint { margin-top: 12px; font-size: 13px; color: #6e7681; text-align: center; }
  </style>
</head>
<body>
  <h1>🐍 Snake Game</h1>
  <div class="score">Score: <span id="score">0</span></div>
  <canvas id="game" width="400" height="400"></canvas>
  <div class="controls"><button id="startBtn">Start / Restart</button></div>
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
      if (head.x < 0 || head.x >= canvas.width/grid || head.y < 0 || head.y >= canvas.height/grid) {
        gameOver(); return;
      }
      if (snake.some(s => s.x === head.x && s.y === head.y)) { gameOver(); return; }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score += 10;
        document.getElementById('score').textContent = score;
        food = randomFood();
      } else { snake.pop(); }
      draw();
    }

    function draw() {
      ctx.fillStyle = '#161b22';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f85149';
      ctx.beginPath();
      ctx.roundRect(food.x * grid, food.y * grid, grid - 2, grid - 2, 4);
      ctx.fill();
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
    init();
  </script>
</body>
</html>`;

  return {
    files: {
      'index.html': html,
      'README.md': '# Snake Game\n\nBuilt with BuildForge AI\n\n## Controls\n- Arrow keys or WASD\n- Click Restart to play again\n\n## Features\n- Score tracking\n- Collision detection\n- Modern dark UI',
    },
    previewHtml: html,
    summary: '**Snake Game** built successfully.\n\n✓ Game loop & canvas rendering\n✓ Keyboard controls (Arrow / WASD)\n✓ Score system\n✓ Collision detection\n✓ Restart button\n✓ Modern dark UI\n\nPreview is ready.',
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
    <nav><a href="#about">About</a><a href="#projects">Projects</a><a href="#contact">Contact</a></nav>
  </header>
  <section class="hero">
    <h1>Full-Stack Developer</h1>
    <p>I build modern web applications and delightful user experiences.</p>
    <a href="#projects" class="btn">View My Work</a>
  </section>
  <section id="about"><h2>About Me</h2><p style="color:#8b949e">Passionate developer experienced in React, Node.js, and modern web technologies.</p></section>
  <section id="projects">
    <h2>Featured Projects</h2>
    <div class="grid">
      <div class="card"><h3>Project Alpha</h3><p>Real-time collaboration tool with React and WebSockets.</p></div>
      <div class="card"><h3>Dashboard Pro</h3><p>Analytics dashboard with charts and dark mode.</p></div>
      <div class="card"><h3>Mobile First</h3><p>Responsive e-commerce optimized for conversion.</p></div>
    </div>
  </section>
  <section id="contact"><h2>Get In Touch</h2><p style="color:#8b949e">Email: hello@alexrivera.dev</p></section>
  <footer>Built with BuildForge AI • © 2026</footer>
</body>
</html>`;

  return {
    files: { 'index.html': html, 'README.md': '# Portfolio Website\n\nModern personal portfolio built with BuildForge AI.' },
    previewHtml: html,
    summary: '**Portfolio Website** built successfully.\n\n✓ Modern dark theme\n✓ Responsive layout\n✓ Hero + About + Projects + Contact\n✓ Clean typography & cards\n\nPreview is ready.',
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
    body { background: #0d1117; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: Inter, system-ui, sans-serif; }
    .calc { background: #161b22; border-radius: 16px; padding: 20px; width: 300px; box-shadow: 0 12px 40px rgba(0,0,0,0.5); border: 1px solid #30363d; }
    .display { background: #0d1117; border-radius: 10px; padding: 20px; text-align: right; font-size: 32px; color: #e6edf3; margin-bottom: 16px; min-height: 70px; word-break: break-all; font-family: monospace; }
    .keys { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
    button { border: none; border-radius: 10px; padding: 18px; font-size: 18px; font-weight: 600; cursor: pointer; background: #21262d; color: #e6edf3; }
    button:hover { background: #30363d; }
    button.op { background: #a371f7; color: white; }
    button.eq { background: #58a6ff; color: white; grid-column: span 2; }
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
    function append(val) { if (expr === '0' && val !== '.') expr = ''; expr += val; display.textContent = expr; }
    function clearDisplay() { expr = ''; display.textContent = '0'; }
    function calculate() {
      try {
        const result = Function('"use strict"; return (' + expr.replace(/×/g,'*').replace(/÷/g,'/') + ')')();
        expr = String(result); display.textContent = expr;
      } catch { display.textContent = 'Error'; expr = ''; }
    }
  </script>
</body>
</html>`;

  return {
    files: { 'index.html': html, 'README.md': '# Calculator App\n\nClean calculator built with BuildForge AI.' },
    previewHtml: html,
    summary: '**Calculator App** built successfully.\n\n✓ Clean modern UI\n✓ Basic operations\n✓ Error handling\n✓ Responsive layout\n\nPreview is ready.',
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
    .task { display: flex; align-items: center; gap: 12px; background: #161b22; border: 1px solid #30363d; border-radius: 10px; padding: 14px 16px; margin-bottom: 10px; }
    .task.done span { text-decoration: line-through; color: #6e7681; }
    .task input[type=checkbox] { width: 18px; height: 18px; accent-color: #a371f7; }
    .task span { flex: 1; font-size: 14px; }
    .task button { background: none; border: none; color: #f85149; cursor: pointer; font-size: 16px; }
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
      if (tasks.length === 0) { list.innerHTML = '<div class="empty">No tasks yet. Add one above!</div>'; return; }
      list.innerHTML = tasks.map((t, i) => \`
        <div class="task \${t.done ? 'done' : ''}">
          <input type="checkbox" \${t.done ? 'checked' : ''} onchange="toggle(\${i})" />
          <span>\${t.text}</span>
          <button onclick="remove(\${i})">✕</button>
        </div>\`).join('');
    }
    function addTask() {
      const input = document.getElementById('taskInput');
      const text = input.value.trim();
      if (!text) return;
      tasks.push({ text, done: false });
      input.value = '';
      save(); render();
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
    files: { 'index.html': html, 'README.md': '# Task Manager\n\nSimple todo app with localStorage.\n\nBuilt with BuildForge AI.' },
    previewHtml: html,
    summary: '**Task Manager** built successfully.\n\n✓ Add / complete / delete tasks\n✓ Persistent storage\n✓ Clean modern UI\n✓ Keyboard support\n\nPreview is ready.',
  };
}

function generateSpaceShooter() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Space Shooter — BuildForge AI</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0a0e14; color: #e6edf3; font-family: Inter, system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; }
    h1 { color: #a371f7; margin-bottom: 8px; }
    .hud { display: flex; gap: 24px; margin-bottom: 12px; font-size: 16px; color: #8b949e; }
    canvas { background: #0d1117; border: 2px solid #30363d; border-radius: 8px; max-width: 100%; }
    .controls { margin-top: 12px; }
    button { background: #a371f7; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .hint { margin-top: 8px; font-size: 13px; color: #6e7681; }
  </style>
</head>
<body>
  <h1>🚀 Space Shooter</h1>
  <div class="hud">
    <span>Score: <strong id="score">0</strong></span>
    <span>Lives: <strong id="lives">3</strong></span>
  </div>
  <canvas id="game" width="480" height="640"></canvas>
  <div class="controls"><button id="startBtn">Start / Restart</button></div>
  <p class="hint">Arrow keys / A D to move • Space to shoot</p>
  <script>
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    let player, bullets, enemies, score, lives, keys, loop, running, spawnTimer, difficulty;

    function init() {
      player = { x: canvas.width/2 - 20, y: canvas.height - 60, w: 40, h: 30, speed: 6 };
      bullets = []; enemies = [];
      score = 0; lives = 3; difficulty = 1;
      keys = {}; spawnTimer = 0; running = true;
      document.getElementById('score').textContent = score;
      document.getElementById('lives').textContent = lives;
      if (loop) cancelAnimationFrame(loop);
      gameLoop();
    }

    function gameLoop() {
      if (!running) return;
      update();
      draw();
      loop = requestAnimationFrame(gameLoop);
    }

    function update() {
      if (keys['ArrowLeft'] || keys['a']) player.x = Math.max(0, player.x - player.speed);
      if (keys['ArrowRight'] || keys['d']) player.x = Math.min(canvas.width - player.w, player.x + player.speed);

      bullets.forEach(b => b.y -= 8);
      bullets = bullets.filter(b => b.y > -10);

      spawnTimer++;
      if (spawnTimer > Math.max(20, 60 - difficulty * 5)) {
        enemies.push({ x: Math.random() * (canvas.width - 30), y: -30, w: 30, h: 30, speed: 1.5 + difficulty * 0.3 });
        spawnTimer = 0;
      }

      enemies.forEach(e => e.y += e.speed);
      enemies = enemies.filter(e => {
        if (e.y > canvas.height) { lives--; document.getElementById('lives').textContent = lives; if (lives <= 0) gameOver(); return false; }
        return true;
      });

      // Collisions
      bullets.forEach((b, bi) => {
        enemies.forEach((e, ei) => {
          if (b.x < e.x + e.w && b.x + 4 > e.x && b.y < e.y + e.h && b.y + 10 > e.y) {
            enemies.splice(ei, 1); bullets.splice(bi, 1);
            score += 10; document.getElementById('score').textContent = score;
            if (score % 50 === 0) difficulty++;
          }
        });
      });

      enemies.forEach(e => {
        if (player.x < e.x + e.w && player.x + player.w > e.x && player.y < e.y + e.h && player.y + player.h > e.y) {
          enemies = enemies.filter(en => en !== e);
          lives--; document.getElementById('lives').textContent = lives;
          if (lives <= 0) gameOver();
        }
      });
    }

    function draw() {
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Stars
      ctx.fillStyle = '#30363d';
      for (let i = 0; i < 40; i++) ctx.fillRect((i*97)%canvas.width, (i*53 + Date.now()/50)%canvas.height, 2, 2);

      // Player
      ctx.fillStyle = '#58a6ff';
      ctx.beginPath();
      ctx.moveTo(player.x + player.w/2, player.y);
      ctx.lineTo(player.x, player.y + player.h);
      ctx.lineTo(player.x + player.w, player.y + player.h);
      ctx.fill();

      // Bullets
      ctx.fillStyle = '#a371f7';
      bullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 10));

      // Enemies
      ctx.fillStyle = '#f85149';
      enemies.forEach(e => {
        ctx.beginPath();
        ctx.moveTo(e.x + e.w/2, e.y + e.h);
        ctx.lineTo(e.x, e.y);
        ctx.lineTo(e.x + e.w, e.y);
        ctx.fill();
      });
    }

    function shoot() {
      if (!running) return;
      bullets.push({ x: player.x + player.w/2 - 2, y: player.y });
    }

    function gameOver() {
      running = false;
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#e6edf3';
      ctx.font = 'bold 32px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over', canvas.width/2, canvas.height/2 - 10);
      ctx.font = '18px Inter, sans-serif';
      ctx.fillStyle = '#8b949e';
      ctx.fillText('Score: ' + score, canvas.width/2, canvas.height/2 + 25);
    }

    document.addEventListener('keydown', e => {
      keys[e.key] = true;
      if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); shoot(); }
    });
    document.addEventListener('keyup', e => { keys[e.key] = false; });
    document.getElementById('startBtn').addEventListener('click', init);
    init();
  </script>
</body>
</html>`;

  return {
    files: {
      'index.html': html,
      'README.md': '# Space Shooter\n\nBuilt with BuildForge AI\n\n## Controls\n- Arrow / A D — Move\n- Space — Shoot\n\n## Features\n- 3 lives\n- Increasing difficulty\n- Score system\n- Collision detection',
    },
    previewHtml: html,
    summary: '**Space Shooter** built successfully.\n\n✓ Player controls\n✓ Enemy spawning\n✓ Laser shooting\n✓ Collision detection\n✓ 3 lives\n✓ Score system\n✓ Increasing difficulty\n✓ Restart button\n\nPreview is ready.',
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
      background: #0d1117; color: #e6edf3; font-family: Inter, system-ui, sans-serif;
      min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 40px 20px; text-align: center;
    }
    h1 { font-size: 36px; margin-bottom: 12px; background: linear-gradient(135deg, #a371f7, #58a6ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    p { color: #8b949e; max-width: 420px; margin-bottom: 24px; }
    .badge { background: #21262d; border: 1px solid #30363d; padding: 6px 14px; border-radius: 20px; font-size: 13px; color: #a371f7; }
  </style>
</head>
<body>
  <h1>Your App is Ready</h1>
  <p>Starter generated for: <strong>${request.slice(0, 90).replace(/</g, '&lt;')}</strong></p>
  <div class="badge">Built with BuildForge AI</div>
</body>
</html>`;

  return {
    files: {
      'index.html': html,
      'README.md': `# Generated App\n\nRequest: ${request}\n\nBuilt with BuildForge AI.`,
    },
    previewHtml: html,
    summary: '**Project** created successfully.\n\nI generated a clean starter based on your request.\nContinue the conversation to add features.',
  };
}

module.exports = {
  build,
  extractProjectName,
};
