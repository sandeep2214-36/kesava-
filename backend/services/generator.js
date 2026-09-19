/**
 * BuildForge AI — Code Generation Service
 * Uses Gemini 3.5 Flash when GEMINI_API_KEY is set, otherwise falls back to templates
 */

const https = require('https');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

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

function callGemini(prompt) {
  return new Promise((resolve, reject) => {
    if (!GEMINI_API_KEY) return reject(new Error('GEMINI_API_KEY not set'));

    const body = JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 8192 },
    });

    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + GEMINI_MODEL + ':generateContent?key=' + GEMINI_API_KEY;

    const req = https.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) return reject(new Error(json.error.message || 'Gemini API error'));
          const text = json.candidates && json.candidates[0] && json.candidates[0].content && json.candidates[0].content.parts && json.candidates[0].content.parts[0] && json.candidates[0].content.parts[0].text;
          if (!text) return reject(new Error('Empty response from Gemini'));
          resolve(text);
        } catch (e) {
          reject(new Error('Failed to parse Gemini response'));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function buildPrompt(userRequest) {
  return 'You are BuildForge AI, an expert full-stack coding agent.\n\n' +
    'The user requested: "' + userRequest + '"\n\n' +
    'Generate a COMPLETE, WORKING, single-file HTML application (or multi-file if truly needed).\n\n' +
    'Rules:\n' +
    '- Prefer a single self-contained index.html with embedded CSS and JavaScript.\n' +
    '- Make it look modern and professional (dark theme preferred).\n' +
    '- It must be fully functional and runnable in a browser.\n' +
    '- Include proper error handling, responsive design, and clean UI.\n' +
    '- For games: implement full game loop, controls, score, restart.\n' +
    '- For apps: implement real working features, not placeholders.\n' +
    '- Do NOT use external CDNs unless absolutely necessary.\n' +
    '- Output ONLY valid files in this exact format:\n\n' +
    '===FILE: index.html===\n<!DOCTYPE html>\n...full html content...\n===END===\n\n' +
    'You may add more files if needed.\n\n' +
    'After the files, add a short summary starting with:\n' +
    '===SUMMARY===\n**Project Name** built successfully.\n✓ Feature 1\n✓ Feature 2\n===END===\n\n' +
    'Start generating now.';
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
      files['index.html'] = '<!DOCTYPE html><html><body><pre>' + text.replace(/</g, '&lt;') + '</pre></body></html>';
    }
  }

  return { files, summary };
}

async function build(userRequest, existingProject) {
  const steps = [
    { text: 'Analyzing requirements…', percent: 15 },
    { text: 'Creating project plan…', percent: 30 },
    { text: 'Generating with AI…', percent: 55 },
    { text: 'Assembling files…', percent: 80 },
    { text: 'Validating output…', percent: 95 },
    { text: 'Build complete', percent: 100 },
  ];

  if (GEMINI_API_KEY) {
    try {
      console.log('[BuildForge] Using Gemini (' + GEMINI_MODEL + ') for: ' + userRequest.slice(0, 60));
      const prompt = buildPrompt(userRequest);
      const responseText = await callGemini(prompt);
      const parsed = parseGeminiResponse(responseText);
      const previewHtml = parsed.files['index.html'] || null;

      return {
        projectName: extractProjectName(userRequest),
        plan: ['Understand requirements', 'Generate complete application with Gemini', 'Structure files', 'Validate output'],
        steps,
        files: parsed.files,
        previewHtml,
        summary: parsed.summary + '\n\n_Powered by Gemini 3.5 Flash_',
        usedAI: true,
      };
    } catch (err) {
      console.error('[BuildForge] Gemini failed, falling back to templates:', err.message);
    }
  }

  // Template fallback - keep simple for size
  await sleep(300);
  const lower = userRequest.toLowerCase();

  // Minimal fallback for common requests
  const name = extractProjectName(userRequest);
  const html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>' + name + '</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0d1117;color:#e6edf3;font-family:system-ui,sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center}h1{font-size:32px;margin-bottom:12px;color:#a371f7}p{color:#8b949e;max-width:400px}</style></head><body><h1>' + name + '</h1><p>Generated by BuildForge AI (template fallback). Set GEMINI_API_KEY for full AI generation.</p></body></html>';

  return {
    projectName: name,
    plan: ['Understand requirements', 'Use template fallback'],
    steps,
    files: { 'index.html': html, 'README.md': '# ' + name + '\n\nBuilt with BuildForge AI (template mode).' },
    previewHtml: html,
    summary: '**' + name + '** created (template mode).\n\nSet GEMINI_API_KEY environment variable for full AI-powered generation.',
    usedAI: false,
  };
}

module.exports = { build, extractProjectName };
