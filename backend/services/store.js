/**
 * Simple in-memory project store
 * Uses only Node.js built-ins
 */

const { randomUUID } = require('crypto');

const projects = new Map();
const messages = new Map(); // projectId -> array of messages

function createProject(name = 'Untitled Project') {
  const id = randomUUID();
  const project = {
    id,
    name,
    files: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lastMessage: null,
  };
  projects.set(id, project);
  messages.set(id, []);
  return project;
}

function getProjects() {
  return Array.from(projects.values()).sort((a, b) => b.updatedAt - a.updatedAt);
}

function getProject(id) {
  return projects.get(id) || null;
}

function updateProject(id, updates) {
  const project = projects.get(id);
  if (!project) return null;
  Object.assign(project, updates, { updatedAt: Date.now() });
  projects.set(id, project);
  return project;
}

function deleteProject(id) {
  const existed = projects.delete(id);
  messages.delete(id);
  return existed;
}

function updateFile(projectId, filePath, content) {
  const project = projects.get(projectId);
  if (!project) return false;
  project.files = project.files || {};
  project.files[filePath] = content;
  project.updatedAt = Date.now();
  return true;
}

function addMessage(projectId, message) {
  if (!messages.has(projectId)) messages.set(projectId, []);
  const list = messages.get(projectId);
  list.push({
    id: randomUUID(),
    role: message.role,
    content: message.content,
    timestamp: Date.now(),
  });
  if (list.length > 100) list.splice(0, list.length - 100);
}

function getMessages(projectId) {
  return messages.get(projectId) || [];
}

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  updateFile,
  addMessage,
  getMessages,
};
