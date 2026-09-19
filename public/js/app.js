/**
 * BuildForge AI — Frontend Application
 * Connects to the backend API for generation
 */

const API_BASE = window.location.origin + '/api';

// ===== State =====
const state = {
  projects: [],
  currentProjectId: null,
  isBuilding: false,
  files: {},
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
function addMessage(role, content) {
  const msg = document.createElement('div');
  msg.className = `message ${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = role === 'ai' ? '⚡' : 'You';

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  contentDiv.innerHTML = content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code>$1</code>');

  bubble.appendChild(contentDiv);
  msg.appendChild(avatar);
  msg.appendChild(bubble);
  els.chatMessages.appendChild(msg);
  els.chatMessages.scrollTop = els.chatMessages.scrollHeight;

  state.messages.push({ role, content });
}

// ===== API helpers =====
async function api(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

// ===== Project Management =====
async function loadProjects() {
  try {
    state.projects = await api('/projects');
    renderProjectList();
  } catch (e) {
    log('Could not load projects: ' + e.message, 'warning');
  }
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
    el.addEventListener('click', async () => {
      state.currentProjectId = el.dataset.id;
      const project = state.projects.find(p => p.id === state.currentProjectId);
      state.files = { ...(project.files || {}) };
      renderProjectList();
      updateProjectUI();
      renderFileTree();
      renderFileSelector();
      log(`Switched to project: ${project.name}`, 'info');
    });
  });
}

// ===== File System =====
function setFiles(files) {
  state.files = files || {};
  renderFileTree();
  renderFileSelector();
}

function renderFileTree() {
  const paths = Object.keys(state.files).sort();
  if (paths.length === 0) {
    els.fileTree.innerHTML = '<div class="empty-state">No project files yet</div>';
    return;
  }

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

// ===== Main Build (calls backend) =====
async function handleBuild(userRequest) {
  if (state.isBuilding) return;
  state.isBuilding = true;
  setStatus('Building…', 'busy');
  els.btnSend.disabled = true;

  log(`Starting build: "${userRequest}"`, 'info');
  showProgress('Analyzing requirements…', 10);

  // Fake progress while waiting for backend
  const progressSteps = [
    { t: 'Creating project plan…', p: 25 },
    { t: 'Selecting technology…', p: 40 },
    { t: 'Generating files…', p: 65 },
    { t: 'Validating…', p: 85 },
  ];
  let stepIdx = 0;
  const progressInterval = setInterval(() => {
    if (stepIdx < progressSteps.length) {
      showProgress(progressSteps[stepIdx].t, progressSteps[stepIdx].p);
      stepIdx++;
    }
  }, 400);

  try {
    const result = await api('/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: userRequest,
        projectId: state.currentProjectId,
      }),
    });

    clearInterval(progressInterval);
    showProgress('Build complete', 100);

    // Update state
    state.currentProjectId = result.projectId;
    state.files = result.files || {};

    // Refresh project list
    await loadProjects();
    updateProjectUI();
    renderFileTree();
    renderFileSelector();

    if (result.previewHtml) {
      showPreview(result.previewHtml);
    }

    const firstFile = Object.keys(state.files)[0];
    if (firstFile) showFile(firstFile);

    addMessage('ai', result.summary);
    log('Build completed successfully', 'success');

    setTimeout(() => switchTab('preview'), 600);
  } catch (err) {
    clearInterval(progressInterval);
    log('Build failed: ' + err.message, 'error');
    addMessage('ai', `Sorry, something went wrong: ${err.message}`);
    setStatus('Error', 'error');
  } finally {
    hideProgress();
    setStatus('Ready', 'ready');
    state.isBuilding = false;
    els.btnSend.disabled = false;
  }
}

// ===== Event Listeners =====
function init() {
  els.btnSend.addEventListener('click', handleSend);
  els.userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  els.userInput.addEventListener('input', () => {
    els.userInput.style.height = 'auto';
    els.userInput.style.height = Math.min(els.userInput.scrollHeight, 120) + 'px';
  });

  $$('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  els.fileSelector.addEventListener('change', () => {
    if (els.fileSelector.value) showFile(els.fileSelector.value);
  });

  els.btnCopyCode.addEventListener('click', () => {
    navigator.clipboard.writeText(els.codeContent.textContent).then(() => {
      log('Code copied to clipboard', 'success');
    });
  });

  els.btnNewProject.addEventListener('click', async () => {
    try {
      const project = await api('/projects', {
        method: 'POST',
        body: JSON.stringify({ name: 'Untitled Project' }),
      });
      state.currentProjectId = project.id;
      state.files = {};
      await loadProjects();
      updateProjectUI();
      renderFileTree();
      renderFileSelector();
      clearPreview();
      els.codeContent.textContent = '// Code will appear here after generation';
      addMessage('ai', 'New project created. Describe what you want to build.');
      log('New project started', 'info');
    } catch (e) {
      log('Failed to create project: ' + e.message, 'error');
    }
  });

  els.btnExport.addEventListener('click', () => {
    if (Object.keys(state.files).length === 0) {
      log('Nothing to export', 'warning');
      return;
    }
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

  document.addEventListener('click', (e) => {
    if (e.target.matches('.example-list li')) {
      const text = e.target.textContent.replace(/[“”]/g, '').trim();
      els.userInput.value = text;
      handleSend();
    }
  });

  $('#btnToggleSidebar')?.addEventListener('click', () => {
    els.sidebar.classList.toggle('collapsed');
  });

  // Initial load
  loadProjects();
  log('BuildForge AI frontend connected to backend', 'success');
  setStatus('Ready', 'ready');
}

function handleSend() {
  const text = els.userInput.value.trim();
  if (!text || state.isBuilding) return;

  addMessage('user', text);
  els.userInput.value = '';
  els.userInput.style.height = 'auto';

  handleBuild(text);
}

// Boot
document.addEventListener('DOMContentLoaded', init);
