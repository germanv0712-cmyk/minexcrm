const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../middleware/auth');
const { requireTenant, tid, assertOwnership } = require('../middleware/tenant');
const wa = require('../services/whatsapp');

const prisma = new PrismaClient();
const guard  = [requireAuth, requireTenant];
const ok     = (res, data, status = 200) => res.status(status).json(data);
const validate = (req, res, next) => {
  const e = validationResult(req); if (!e.isEmpty()) return res.status(422).json({ errors: e.array() }); next();
};

// ── Incidents ──────────────────────────────────────────────────────────────────

router.get('/incidents', guard, async (req, res, next) => {
  try {
    const { status, severity, projectId } = req.query;
    const where = {
      ...tid(req),
      ...(status    ? { status }    : {}),
      ...(severity  ? { severity }  : {}),
      ...(projectId ? { projectId } : {}),
    };
    const incidents = await prisma.incident.findMany({
      where, orderBy: { occurredAt: 'desc' },
      include: { files: { take: 3 } },
    });
    ok(res, incidents);
  } catch (err) { next(err); }
});

router.post('/incidents', guard,
  body('type').notEmpty(),
  body('severity').notEmpty(),
  body('description').notEmpty(),
  body('occurredAt').isISO8601(),
  validate,
  async (req, res, next) => {
    try {
      const { type, severity, description, location, injuredName, projectId, occurredAt, notifyPhone } = req.body;

      const incident = await prisma.incident.create({
        data: {
          ...tid(req),
          type, severity, description, location, injuredName,
          projectId:  projectId || null,
          reportedBy: req.user.name,
          occurredAt: new Date(occurredAt),
        },
      });

      // WhatsApp notification if a contact phone is provided
      if (notifyPhone && process.env.WA_PHONE_ID) {
        const project = projectId
          ? await prisma.project.findUnique({ where: { id: projectId }, select: { name: true } })
          : null;
        await wa.notifyIncident(notifyPhone, {
          projectName:  project?.name || 'N/A',
          incidentType: type,
          severity,
        }).catch(() => {}); // non-blocking
      }

      ok(res, incident, 201);
    } catch (err) { next(err); }
  }
);

router.patch('/incidents/:id', guard, async (req, res, next) => {
  try {
    const existing = await prisma.incident.findUnique({ where: { id: req.params.id } });
    assertOwnership(existing, req);
    const allowed = ['status','description','location','closedAt'];
    const data = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    if (data.closedAt) data.closedAt = new Date(data.closedAt);
    const updated = await prisma.incident.update({ where: { id: req.params.id }, data });
    ok(res, updated);
  } catch (err) { next(err); }
});

// ── Permits ────────────────────────────────────────────────────────────────────

router.get('/permits', guard, async (req, res, next) => {
  try {
    const { status, projectId } = req.query;
    const where = { ...tid(req), ...(status ? { status } : {}), ...(projectId ? { projectId } : {}) };
    const permits = await prisma.permit.findMany({ where, orderBy: { expiresAt: 'asc' }, include: { files: true } });
    ok(res, permits);
  } catch (err) { next(err); }
});

router.post('/permits', guard,
  body('type').notEmpty(),
  body('issuedAt').isISO8601(),
  body('expiresAt').isISO8601(),
  validate,
  async (req, res, next) => {
    try {
      const { type, description, assignedTo, issuedAt, expiresAt, projectId, notifyPhone } = req.body;
      const permit = await prisma.permit.create({
        data: {
          ...tid(req),
          type, description: description || '', assignedTo,
          projectId: projectId || null,
          issuedAt:  new Date(issuedAt),
          expiresAt: new Date(expiresAt),
        },
      });

      if (notifyPhone && process.env.WA_PHONE_ID) {
        await wa.notifyPermitApproval(notifyPhone, { permitType: type, expiresAt }).catch(() => {});
      }

      ok(res, permit, 201);
    } catch (err) { next(err); }
  }
);

router.patch('/permits/:id', guard, async (req, res, next) => {
  try {
    const existing = await prisma.permit.findUnique({ where: { id: req.params.id } });
    assertOwnership(existing, req);
    const allowed = ['status', 'signatureUrl', 'description'];
    const data = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const updated = await prisma.permit.update({ where: { id: req.params.id }, data });
    ok(res, updated);
  } catch (err) { next(err); }
});

// ── Certifications ─────────────────────────────────────────────────────────────

router.get('/certifications', guard, async (req, res, next) => {
  try {
    const certs = await prisma.certification.findMany({
      where:   { user: { tenantId: req.tenantId } },
      include: { user: { select: { id: true, name: true, avatar: true, color: true, position: true } } },
      orderBy: { expiresAt: 'asc' },
    });
    ok(res, certs);
  } catch (err) { next(err); }
});

module.exports = router;
