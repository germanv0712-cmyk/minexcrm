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

// GET /wells
router.get('/', guard, async (req, res, next) => {
  try {
    const { projectId, status, search } = req.query;
    const where = {
      ...tid(req),
      ...(projectId ? { projectId } : {}),
      ...(status    ? { status }    : {}),
      ...(search    ? { code: { contains: search, mode: 'insensitive' } } : {}),
    };
    const wells = await prisma.well.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        project:  { select: { id: true, name: true, code: true } },
        _count:   { select: { drillLogs: true, coreSamples: true, files: true } },
      },
    });
    ok(res, wells);
  } catch (err) { next(err); }
});

// POST /wells
router.post('/', guard,
  body('projectId').notEmpty(),
  body('code').notEmpty(),
  body('depthTarget').isNumeric(),
  validate,
  async (req, res, next) => {
    try {
      // Verify project belongs to this tenant
      const project = await prisma.project.findUnique({ where: { id: req.body.projectId } });
      assertOwnership(project, req);

      const { projectId, code, type, utmE, utmN, utmZ,
              depthTarget, bit, azimuth, dip } = req.body;

      const well = await prisma.well.create({
        data: {
          ...tid(req),
          projectId, code, type: type || 'Diamantina',
          utmE: utmE ? Number(utmE) : null,
          utmN: utmN ? Number(utmN) : null,
          utmZ: utmZ ? Number(utmZ) : null,
          depthTarget: Number(depthTarget),
          bit, azimuth: azimuth ? Number(azimuth) : null,
          dip: dip ? Number(dip) : null,
        },
      });
      ok(res, well, 201);
    } catch (err) { next(err); }
  }
);

// GET /wells/:id
router.get('/:id', guard, async (req, res, next) => {
  try {
    const well = await prisma.well.findUnique({
      where: { id: req.params.id },
      include: {
        project:     { select: { id: true, name: true, code: true } },
        drillLogs:   { orderBy: { fromDepth: 'asc' } },
        coreSamples: { orderBy: { fromDepth: 'asc' }, include: { files: true } },
        files:       { orderBy: { createdAt: 'desc' } },
      },
    });
    assertOwnership(well, req);
    ok(res, well);
  } catch (err) { next(err); }
});

// PATCH /wells/:id
router.patch('/:id', guard, async (req, res, next) => {
  try {
    const existing = await prisma.well.findUnique({ where: { id: req.params.id } });
    assertOwnership(existing, req);
    const allowed = ['status','depthCurrent','bit','azimuth','dip','lastUpdate'];
    const data = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    if (data.depthCurrent) data.depthCurrent = Number(data.depthCurrent);
    if (data.lastUpdate)   data.lastUpdate   = new Date(data.lastUpdate);
    const updated = await prisma.well.update({ where: { id: req.params.id }, data });
    ok(res, updated);
  } catch (err) { next(err); }
});

// POST /wells/:id/logs — add drill log entry
router.post('/:id/logs', guard,
  body('fromDepth').isNumeric(),
  body('toDepth').isNumeric(),
  body('lithology').notEmpty(),
  validate,
  async (req, res, next) => {
    try {
      const well = await prisma.well.findUnique({ where: { id: req.params.id } });
      assertOwnership(well, req);
      const { fromDepth, toDepth, lithology, recovery, rqd, notes, loggedAt } = req.body;
      const log = await prisma.drillLog.create({
        data: {
          wellId: req.params.id,
          fromDepth: Number(fromDepth),
          toDepth:   Number(toDepth),
          lithology,
          recovery:  recovery ? Number(recovery) : null,
          rqd:       rqd      ? Number(rqd)      : null,
          notes,
          loggedAt:  loggedAt ? new Date(loggedAt) : new Date(),
          loggedBy:  req.user.name,
        },
      });
      ok(res, log, 201);
    } catch (err) { next(err); }
  }
);

// POST /wells/:id/cores — add core sample
router.post('/:id/cores', guard, async (req, res, next) => {
  try {
    const well = await prisma.well.findUnique({ where: { id: req.params.id } });
    assertOwnership(well, req);
    const { box, fromDepth, toDepth, recovery, labResults } = req.body;
    const sample = await prisma.coreSample.create({
      data: { wellId: req.params.id, box: Number(box), fromDepth: Number(fromDepth), toDepth: Number(toDepth), recovery: recovery ? Number(recovery) : null, labResults },
    });
    ok(res, sample, 201);
  } catch (err) { next(err); }
});

module.exports = router;
