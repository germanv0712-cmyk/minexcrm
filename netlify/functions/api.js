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

  const routes = ['auth','dashboard','projects','clients','pipeline','wells','hse','fleet','personnel','visits','files'];
  for (const r of routes) {
    try {
      app.use('/' + r, require('../../backend/src/routes/' + r));
    } catch (e) {
      console.error('[ROUTE LOAD ERROR]', r, e.message);
      app.use('/' + r, (_req, res) => res.status(503).json({ error: 'Route unavailable: ' + r, detail: e.message }));
    }
  }

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
  // Strip function or /api prefix so Express routes resolve as /auth/login etc.
  event.path = event.path
    .replace(/^\/.netlify\/functions\/api/, '')
    .replace(/^\/api/, '') || '/';

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
