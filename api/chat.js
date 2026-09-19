/**
 * Vercel Serverless Function — /api/chat
 * Uses Gemini 3.5 Flash to generate complete apps/games
 */

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

function extractProjectName(request) {
  const lower = (request || '').toLowerCase();
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
  const words = (request || '').replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean).slice(0, 4);
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') || 'New Project';
}

async function callGemini(prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Add it in Vercel → Settings → Environment Variables.');
  }

  const body = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 8192 },
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Gemini API error (${res.status})`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return text;
}

function buildPrompt(userRequest) {
  return `You are BuildForge AI, an expert full-stack coding agent.

The user requested: "${userRequest}"

Generate a COMPLETE, WORKING, single-file HTML application.

Rules:
- Prefer a single self-contained index.html with embedded CSS and JavaScript.
- Modern professional dark theme.
- Fully functional and runnable in a browser.
- Games must have game loop, controls, score, restart.
- Apps must have real working features (no placeholders).
- No external CDNs unless absolutely necessary.
- Output ONLY in this exact format:

===FILE: index.html===
<!DOCTYPE html>
...full html...
===END===

===SUMMARY===
**Project Name** built successfully.
✓ Feature 1
✓ Feature 2
===END===

Start generating now.`;
}

function parseGeminiResponse(text) {
  const files = {};
  let summary = 'Project generated with Gemini.';

  const fileRegex = /===FILE:\s*([^\n=]+?)===\s*([\s\S]*?)===END===/gi;
  let match;
  while ((match = fileRegex.exec(text)) !== null) {
    const p = match[1].trim();
    const content = match[2].trim();
    if (p && content) files[p] = content;
  }

  const summaryMatch = text.match(/===SUMMARY===\s*([\s\S]*?)(?:===END===|$)/i);
  if (summaryMatch) summary = summaryMatch[1].trim();

  if (Object.keys(files).length === 0) {
    const htmlMatch = text.match(/<!DOCTYPE html>[\s\S]*<\/html>/i);
    if (htmlMatch) {
      files['index.html'] = htmlMatch[0];
    } else {
      files['index.html'] = `<!DOCTYPE html><html><body><pre>${text.replace(/</g, '&lt;')}</pre></body></html>`;
    }
  }

  return { files, summary };
}

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, projectId } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const prompt = buildPrompt(message.trim());
    const responseText = await callGemini(prompt);
    const parsed = parseGeminiResponse(responseText);

    const projectName = extractProjectName(message);
    const previewHtml = parsed.files['index.html'] || null;

    return res.status(200).json({
      success: true,
      projectId: projectId || null,
      projectName,
      summary: parsed.summary + '\n\n_Powered by Gemini 3.5 Flash_',
      plan: ['Understand requirements', 'Generate with Gemini', 'Structure files', 'Validate'],
      files: parsed.files,
      previewHtml,
      steps: [],
    });
  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({
      error: err.message || 'Generation failed',
      details: String(err),
    });
  }
};
