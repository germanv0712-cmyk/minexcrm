// Netlify Function — MinexCRM Express API wrapper
// Requires DATABASE_URL env var for a hosted PostgreSQL (e.g. Neon, Supabase, Railway).
// Without it the API returns 503 gracefully; the frontend operates in demo mode.
const serverless = require('serverless-http');
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

let handler = null;
let initError = null;

async function buildHandler() {
  if (handler) return handler;
  if (initError) throw initError;

  if (!process.env.DATABASE_URL) {
    initError = Object.assign(
      new Error('DATABASE_URL is not configured. Set it in Netlify → Site configuration → Environment variables.'),
      { status: 503 }
    );
    throw initError;
  }

  const express = require('express');
  const cors    = require('cors');
  const helmet  = require('helmet');

  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({
    origin:         process.env.CORS_ORIGIN?.split(',') || '*',
    credentials:    true,
    methods:        ['GET','POST','PATCH','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
  }));

  app.use('/webhooks', require('../../backend/src/routes/webhooks'));
  app.use(express.json({ limit: '2mb' }));

  app.get('/health', (_req, res) =>
    res.json({ status: 'ok', db: 'connected', ts: new Date() })
  );

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
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    const status = err.status || 500;
    if (status >= 500) console.error('[ERROR]', err);
    res.status(status).json({ error: err.message || 'Internal server error' });
  });

  handler = serverless(app);
  return handler;
}

exports.handler = async (event, context) => {
  // Strip /.netlify/functions/api prefix → routes resolve as /auth/login etc.
  event.path = event.path.replace(/^\/.netlify\/functions\/api/, '') || '/';

  try {
    const fn = await buildHandler();
    return fn(event, context);
  } catch (err) {
    const status = err.status || 500;
    return {
      statusCode: status,
      headers:    { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body:       JSON.stringify({ error: err.message }),
    };
  }
};
