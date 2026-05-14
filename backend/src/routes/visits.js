const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../middleware/auth');
const { requireTenant, tid, assertOwnership } = require('../middleware/tenant');

const prisma = new PrismaClient();
const guard  = [requireAuth, requireTenant];
const ok     = (res, data, status = 200) => res.status(status).json(data);
const validate = (req, res, next) => {
  const e = validationResult(req); if (!e.isEmpty()) return res.status(422).json({ errors: e.array() }); next();
};

router.get('/', guard, async (req, res, next) => {
  try {
    const { projectId, status } = req.query;
    const where = { ...tid(req), ...(projectId ? { projectId } : {}), ...(status ? { status } : {}) };
    const visits = await prisma.visit.findMany({
      where, orderBy: { visitedAt: 'desc' },
      include: {
        project: { select: { id: true, name: true, code: true } },
        files:   { take: 5 },
      },
    });
    ok(res, visits);
  } catch (err) { next(err); }
});

router.post('/', guard,
  body('projectId').notEmpty(),
  body('type').notEmpty(),
  body('visitedAt').isISO8601(),
  validate,
  async (req, res, next) => {
    try {
      const project = await prisma.project.findUnique({ where: { id: req.body.projectId } });
      assertOwnership(project, req);
      const { projectId, type, notes, lat, lng, visitedAt, signature } = req.body;
      const visit = await prisma.visit.create({
        data: {
          ...tid(req),
          projectId, type, notes,
          lat: lat ? Number(lat) : null,
          lng: lng ? Number(lng) : null,
          visitedAt:  new Date(visitedAt),
          visitedBy:  req.user.name,
          signature,
          status: 'COMPLETED',
        },
      });
      ok(res, visit, 201);
    } catch (err) { next(err); }
  }
);

router.get('/:id', guard, async (req, res, next) => {
  try {
    const visit = await prisma.visit.findUnique({
      where: { id: req.params.id },
      include: { project: true, files: true },
    });
    assertOwnership(visit, req);
    ok(res, visit);
  } catch (err) { next(err); }
});

router.patch('/:id', guard, async (req, res, next) => {
  try {
    const existing = await prisma.visit.findUnique({ where: { id: req.params.id } });
    assertOwnership(existing, req);
    const allowed = ['status','notes','signature'];
    const data = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const updated = await prisma.visit.update({ where: { id: req.params.id }, data });
    ok(res, updated);
  } catch (err) { next(err); }
});

module.exports = router;
