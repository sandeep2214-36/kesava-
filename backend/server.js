/**
 * BuildForge AI — Backend Server (zero external dependencies)
 * Uses only Node.js built-in modules
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { randomUUID } = require('crypto');

const generator = require('./services/generator');
const store = require('./services/store');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '../public');

// MIME types
const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown',
};

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 2 * 1024 * 1024) {
        reject(new Error('Body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function serveStatic(req, res, urlPath) {
  let filePath = path.join(PUBLIC_DIR, urlPath === '/' ? 'index.html' : urlPath);
  // Security: prevent path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback
      fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (err2, html) => {
        if (err2) {
          res.writeHead(404);
          return res.end('Not found');
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
      });
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

async function handleApi(req, res, pathname) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  // Health
  if (pathname === '/api/health' && req.method === 'GET') {
    return sendJson(res, 200, { status: 'ok', service: 'BuildForge AI', version: '1.0.0' });
  }

  // List projects
  if (pathname === '/api/projects' && req.method === 'GET') {
    return sendJson(res, 200, store.getProjects());
  }

  // Create project
  if (pathname === '/api/projects' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const project = store.createProject(body.name || 'Untitled Project');
      return sendJson(res, 201, project);
    } catch (e) {
      return sendJson(res, 400, { error: e.message });
    }
  }

  // Get / Delete project
  const projectMatch = pathname.match(/^\/api\/projects\/([^/]+)$/);
  if (projectMatch) {
    const id = projectMatch[1];
    if (req.method === 'GET') {
      const project = store.getProject(id);
      if (!project) return sendJson(res, 404, { error: 'Project not found' });
      return sendJson(res, 200, project);
    }
    if (req.method === 'DELETE') {
      const ok = store.deleteProject(id);
      if (!ok) return sendJson(res, 404, { error: 'Project not found' });
      return sendJson(res, 200, { success: true });
    }
  }

  // Project files
  const filesMatch = pathname.match(/^\/api\/projects\/([^/]+)\/files$/);
  if (filesMatch && req.method === 'GET') {
    const project = store.getProject(filesMatch[1]);
    if (!project) return sendJson(res, 404, { error: 'Project not found' });
    return sendJson(res, 200, project.files || {});
  }

  // Messages
  const msgMatch = pathname.match(/^\/api\/projects\/([^/]+)\/messages$/);
  if (msgMatch && req.method === 'GET') {
    return sendJson(res, 200, store.getMessages(msgMatch[1]));
  }

  // Main chat / build endpoint
  if (pathname === '/api/chat' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const { message, projectId } = body;

      if (!message || typeof message !== 'string' || !message.trim()) {
        return sendJson(res, 400, { error: 'Message is required' });
      }

      let project = projectId ? store.getProject(projectId) : null;
      if (!project) {
        const name = generator.extractProjectName(message);
        project = store.createProject(name);
      }

      const result = await generator.build(message, project);

      store.updateProject(project.id, {
        name: result.projectName || project.name,
        files: result.files,
        lastMessage: message,
        updatedAt: Date.now(),
      });

      store.addMessage(project.id, { role: 'user', content: message });
      store.addMessage(project.id, { role: 'ai', content: result.summary });

      return sendJson(res, 200, {
        success: true,
        projectId: project.id,
        projectName: result.projectName || project.name,
        summary: result.summary,
        plan: result.plan,
        files: result.files,
        previewHtml: result.previewHtml || null,
        steps: result.steps || [],
      });
    } catch (err) {
      console.error('Chat error:', err);
      return sendJson(res, 500, { error: 'Generation failed', details: err.message });
    }
  }

  sendJson(res, 404, { error: 'Not found' });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    if (pathname.startsWith('/api/')) {
      await handleApi(req, res, pathname);
    } else {
      serveStatic(req, res, pathname);
    }
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: 'Internal server error' });
  }
});

server.listen(PORT, () => {
  console.log(`\n⚡ BuildForge AI server running at http://localhost:${PORT}`);
  console.log(`   API:     http://localhost:${PORT}/api/health`);
  console.log(`   Frontend served from /public\n`);
});
