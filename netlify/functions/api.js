// Netlify Function wrapper for the Express backend using serverless-http.
// Deployed at: /.netlify/functions/api → rewritten to /api/* via netlify.toml
const serverless = require('serverless-http');

// Patch express app to work in serverless (no prisma $connect needed at cold start)
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

let handler;

async function getHandler() {
  if (handler) return handler;

  // Lazy-require so Prisma client only initialises on first invocation
  const express    = require('express');
  const cors       = require('cors');
  const helmet     = require('helmet');

  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({
    origin:      process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
    methods:     ['GET','POST','PATCH','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
  }));

  // WhatsApp webhook needs raw body → mount first
  app.use('/webhooks', require('../../backend/src/routes/webhooks'));
  app.use(express.json({ limit: '2mb' }));

  app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }));

  app.use('/auth',      require('../../backend/src/routes/auth'));
  app.use('/dashboard', require('../../backend/src/routes/dashboard'));
  app.use('/projects',  require('../../backend/src/routes/projects'));
  app.use('/clients',   require('../../backend/src/routes/clients'));
  app.use('/pipeline',  require('../../backend/src/routes/pipeline'));
  app.use('/wells',     require('../../backend/src/routes/wells'));
  app.use('/hse',       require('../../backend/src/routes/hse'));
  app.use('/fleet',     require('../../backend/src/routes/fleet'));
  app.use('/personnel', require('../../backend/src/routes/personnel'));
  app.use('/visits',    require('../../backend/src/routes/visits'));
  app.use('/files',     require('../../backend/src/routes/files'));

  app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
  app.use((err, _req, res, _next) => {
    const status = err.status || 500;
    if (status >= 500) console.error('[ERROR]', err);
    res.status(status).json({ error: err.message || 'Internal server error' });
  });

  handler = serverless(app);
  return handler;
}

exports.handler = async (event, context) => {
  // Strip the /.netlify/functions/api prefix so routes match /auth/login, etc.
  event.path = event.path.replace(/^\/.netlify\/functions\/api/, '') || '/';
  const fn = await getHandler();
  return fn(event, context);
};
