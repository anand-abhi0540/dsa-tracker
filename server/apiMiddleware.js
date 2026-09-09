import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../dsa-tracker.json');

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
  }
}

function normalizeHelp(val) {
  if (!val) return 'No Hint';
  const s = String(val).trim().toLowerCase();
  if (s === 'no hint' || s === 'nohint' || s === 'no') return 'No Hint';
  if (s === 'hint' || s === 'clue') return 'Hint';
  if (s === 'full soln' || s === 'full solution' || s === 'solution') return 'Full Solution';
  return val;
}

function normalizeProblem(p) {
  const category = p.category || p.topic || 'Array';
  const timeTaken = Number(p.timeTaken ?? p.minutes ?? 0);
  const hintStatus = normalizeHelp(p.hintStatus || p.help || 'No Hint');
  const tags = Array.isArray(p.tags) && p.tags.length > 0 
    ? p.tags 
    : (category ? [category] : []);

  return {
    id: p.id || (crypto.randomUUID ? crypto.randomUUID() : `dsa-${Date.now()}`),
    title: p.title || 'Untitled Problem',
    url: p.url || '',
    topic: p.topic || category,
    category: category,
    difficulty: p.difficulty || 'Medium',
    minutes: timeTaken,
    timeTaken: timeTaken,
    help: hintStatus,
    hintStatus: hintStatus,
    tags: tags,
    date: p.date || (p.createdAt ? p.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
    notes: p.notes || '',
    createdAt: p.createdAt || new Date().toISOString()
  };
}

function readProblems() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw || '[]');
    if (Array.isArray(parsed)) {
      return parsed.map(normalizeProblem);
    }
    return [];
  } catch (err) {
    console.error('Error reading dsa-tracker.json:', err);
    return [];
  }
}

function writeProblems(problems) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(problems, null, 2), 'utf-8');
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

export function problemsApiMiddleware() {
  return {
    name: 'problems-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const parsedUrl = new URL(req.url, 'http://localhost');
        const pathname = parsedUrl.pathname;

        if (!pathname.startsWith('/api/problems')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');

        try {
          // GET /api/problems
          if (req.method === 'GET' && pathname === '/api/problems') {
            const problems = readProblems();
            res.statusCode = 200;
            res.end(JSON.stringify(problems));
            return;
          }

          // POST /api/problems/import
          if (req.method === 'POST' && pathname === '/api/problems/import') {
            const items = await parseJsonBody(req);
            if (!Array.isArray(items)) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Payload must be an array of problems' }));
              return;
            }
            const normalizedItems = items.map(normalizeProblem);
            writeProblems(normalizedItems);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, count: normalizedItems.length, problems: normalizedItems }));
            return;
          }

          // POST /api/problems
          if (req.method === 'POST' && pathname === '/api/problems') {
            const newProblem = await parseJsonBody(req);
            const problems = readProblems();
            
            const category = newProblem.category || newProblem.topic || 'Array';
            const timeTaken = Number(newProblem.timeTaken ?? newProblem.minutes ?? 0);
            const hintStatus = normalizeHelp(newProblem.hintStatus || newProblem.help || 'No Hint');
            const tags = Array.isArray(newProblem.tags) && newProblem.tags.length > 0
              ? newProblem.tags
              : (category ? [category] : []);

            const problemToSave = {
              id: newProblem.id || (crypto.randomUUID ? crypto.randomUUID() : `dsa-${Date.now()}`),
              title: newProblem.title || 'Untitled Problem',
              url: newProblem.url || '',
              topic: category,
              category: category,
              difficulty: newProblem.difficulty || 'Medium',
              minutes: timeTaken,
              timeTaken: timeTaken,
              help: hintStatus === 'No Hint' ? 'No hint' : hintStatus,
              hintStatus: hintStatus,
              tags: tags,
              date: newProblem.date || new Date().toISOString().split('T')[0],
              notes: newProblem.notes || '',
              createdAt: newProblem.createdAt || new Date().toISOString()
            };

            // Append to the list in dsa-tracker.json
            const updated = [...problems, problemToSave];
            writeProblems(updated);

            res.statusCode = 201;
            res.end(JSON.stringify(problemToSave));
            return;
          }

          // PUT /api/problems/:id
          if (req.method === 'PUT' && pathname.startsWith('/api/problems/')) {
            const id = pathname.replace('/api/problems/', '').trim();
            const updates = await parseJsonBody(req);
            const problems = readProblems();
            const index = problems.findIndex((p) => String(p.id) === id);

            if (index === -1) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Problem not found' }));
              return;
            }

            const category = updates.category || updates.topic || problems[index].category;
            const timeTaken = Number(updates.timeTaken ?? updates.minutes ?? problems[index].timeTaken);
            const hintStatus = normalizeHelp(updates.hintStatus || updates.help || problems[index].hintStatus);

            problems[index] = {
              ...problems[index],
              ...updates,
              topic: category,
              category: category,
              minutes: timeTaken,
              timeTaken: timeTaken,
              help: hintStatus,
              hintStatus: hintStatus,
              id: problems[index].id, // preserve ID
              updatedAt: new Date().toISOString()
            };

            writeProblems(problems);
            res.statusCode = 200;
            res.end(JSON.stringify(problems[index]));
            return;
          }

          // DELETE /api/problems/:id
          if (req.method === 'DELETE' && pathname.startsWith('/api/problems/')) {
            const id = pathname.replace('/api/problems/', '').trim();
            const problems = readProblems();
            const filtered = problems.filter((p) => String(p.id) !== id);

            if (filtered.length === problems.length) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Problem not found' }));
              return;
            }

            writeProblems(filtered);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, id }));
            return;
          }

          // Unhandled route
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'API route not found' }));
        } catch (err) {
          console.error('API Error:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Internal Server Error', details: err.message }));
        }
      });
    },
    configurePreviewServer(server) {
      this.configureServer(server);
    }
  };
}
