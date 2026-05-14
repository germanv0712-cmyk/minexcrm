const router = require('express').Router();
const express = require('express');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../middleware/auth');
const { requireTenant, tid, assertOwnership } = require('../middleware/tenant');
const wa = require('../services/whatsapp');

const prisma = new PrismaClient();
const ok     = (res, data, status = 200) => res.status(status).json(data);
const guard  = [requireAuth, requireTenant];
const validate = (req, res, next) => {
  const e = validationResult(req); if (!e.isEmpty()) return res.status(422).json({ errors: e.array() }); next();
};

// ── WhatsApp Business inbound webhook ─────────────────────────────────────────

/**
 * GET /webhooks/whatsapp — Meta challenge verification
 */
router.get('/whatsapp', (req, res) => {
  try {
    const challenge = wa.verifyChallenge(req.query);
    res.status(200).send(challenge);
  } catch {
    res.status(403).send('Forbidden');
  }
});

/**
 * POST /webhooks/whatsapp — receive inbound messages
 * Note: uses express.raw() to preserve raw body for HMAC validation.
 */
router.post('/whatsapp',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      wa.validateSignature(req.body, req.headers['x-hub-signature-256']);

      const body    = JSON.parse(req.body.toString());
      const events  = wa.parseInboundEvents(body);

      // Process each inbound message (save to DB, trigger business logic, etc.)
      for (const evt of events) {
        await prisma.auditLog.create({
          data: {
            tenantId:   'system',  // inbound messages don't have tenant context yet
            action:     'WHATSAPP_INBOUND',
            resource:   'message',
            after:      evt,
            ip:         req.ip,
          },
        }).catch(() => {}); // non-blocking

        // TODO: route inbound message to a conversation thread or support ticket
        // based on the phone number (evt.from) → look up client or contact
        console.info('[WhatsApp]', evt.type, 'from', evt.from);
      }

      res.status(200).json({ status: 'ok' });
    } catch (err) {
      if (err.status === 401 || err.status === 403) return res.status(err.status).send(err.message);
      console.error('[WhatsApp webhook error]', err);
      res.status(200).json({ status: 'ignored' }); // always 200 to Meta
    }
  }
);

// ── Outbound webhook configuration (ERP, etc.) ────────────────────────────────

router.get('/outbound', guard, async (req, res, next) => {
  try {
    const hooks = await prisma.webhook.findMany({
      where:   tid(req),
      include: { _count: { select: { deliveries: true } } },
    });
    ok(res, hooks);
  } catch (err) { next(err); }
});

router.post('/outbound', guard,
  body('name').notEmpty(),
  body('url').isURL(),
  body('events').isArray({ min: 1 }),
  validate,
  async (req, res, next) => {
    try {
      const { name, url, events } = req.body;
      const secret = crypto.randomBytes(32).toString('hex');
      const hook = await prisma.webhook.create({
        data: { ...tid(req), name, url, events, secret },
      });
      ok(res, hook, 201);
    } catch (err) { next(err); }
  }
);

router.patch('/outbound/:id', guard, async (req, res, next) => {
  try {
    const existing = await prisma.webhook.findUnique({ where: { id: req.params.id } });
    assertOwnership(existing, req);
    const allowed = ['name', 'url', 'events', 'active'];
    const data = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const updated = await prisma.webhook.update({ where: { id: req.params.id }, data });
    ok(res, updated);
  } catch (err) { next(err); }
});

router.delete('/outbound/:id', guard, async (req, res, next) => {
  try {
    const existing = await prisma.webhook.findUnique({ where: { id: req.params.id } });
    assertOwnership(existing, req);
    await prisma.webhook.delete({ where: { id: req.params.id } });
    ok(res, { ok: true });
  } catch (err) { next(err); }
});

// POST /webhooks/outbound/:id/test
router.post('/outbound/:id/test', guard, async (req, res, next) => {
  try {
    const hook = await prisma.webhook.findUnique({ where: { id: req.params.id } });
    assertOwnership(hook, req);

    const payload = { event: 'test', tenantId: req.tenantId, ts: new Date().toISOString() };
    const body    = JSON.stringify(payload);
    const sig     = 'sha256=' + crypto.createHmac('sha256', hook.secret).update(body).digest('hex');

    const resp = await fetch(hook.url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'X-MinexCRM-Signature': sig },
      body,
      signal:  AbortSignal.timeout(10_000),
    });

    await prisma.webhookDelivery.create({
      data: {
        webhookId:   hook.id,
        event:       'test',
        payload,
        statusCode:  resp.status,
        response:    (await resp.text()).slice(0, 500),
        deliveredAt: new Date(),
      },
    });

    ok(res, { statusCode: resp.status, ok: resp.ok });
  } catch (err) { next(err); }
});

/**
 * Internal helper — fire an outbound webhook event to all registered hooks.
 * Called from other route handlers after write operations.
 */
async function fireEvent(tenantId, event, payload) {
  const hooks = await prisma.webhook.findMany({
    where: { tenantId, active: true, events: { has: event } },
  });

  for (const hook of hooks) {
    const body = JSON.stringify({ event, tenantId, ts: new Date().toISOString(), data: payload });
    const sig  = 'sha256=' + crypto.createHmac('sha256', hook.secret).update(body).digest('hex');

    fetch(hook.url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'X-MinexCRM-Signature': sig },
      body,
      signal:  AbortSignal.timeout(10_000),
    })
    .then(async (resp) => {
      await prisma.webhook.update({ where: { id: hook.id }, data: { lastFiredAt: new Date() } });
      await prisma.webhookDelivery.create({
        data: { webhookId: hook.id, event, payload, statusCode: resp.status, deliveredAt: new Date() },
      });
    })
    .catch(() => {}); // non-blocking, add retry queue (SQS/BullMQ) for production
  }
}

module.exports = router;
module.exports.fireEvent = fireEvent;
