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
    const { status, type, projectId } = req.query;
    const where = { ...tid(req), ...(status ? { status } : {}), ...(type ? { type } : {}), ...(projectId ? { projectId } : {}) };
    const items = await prisma.equipment.findMany({
      where, orderBy: { code: 'asc' },
      include: { maintenances: { orderBy: { performedAt: 'desc' }, take: 3 }, _count: { select: { files: true } } },
    });
    ok(res, items);
  } catch (err) { next(err); }
});

router.post('/', guard,
  body('code').notEmpty(),
  body('type').notEmpty(),
  body('brand').notEmpty(),
  body('model').notEmpty(),
  validate,
  async (req, res, next) => {
    try {
      const { code, type, brand, model, hours, fuelRate, status, projectId, nextMaint } = req.body;
      const item = await prisma.equipment.create({
        data: { ...tid(req), code, type, brand, model, hours: Number(hours || 0), fuelRate: fuelRate ? Number(fuelRate) : null, status: status || 'OPERATIONAL', projectId: projectId || null, nextMaint: nextMaint ? new Date(nextMaint) : null },
      });
      ok(res, item, 201);
    } catch (err) { next(err); }
  }
);

router.get('/:id', guard, async (req, res, next) => {
  try {
    const item = await prisma.equipment.findUnique({
      where: { id: req.params.id },
      include: { maintenances: { orderBy: { performedAt: 'desc' } }, files: { orderBy: { createdAt: 'desc' } } },
    });
    assertOwnership(item, req);
    ok(res, item);
  } catch (err) { next(err); }
});

router.patch('/:id', guard, async (req, res, next) => {
  try {
    const existing = await prisma.equipment.findUnique({ where: { id: req.params.id } });
    assertOwnership(existing, req);
    const allowed = ['status','hours','fuelRate','projectId','nextMaint','lastMaint'];
    const data = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    if (data.hours)     data.hours     = Number(data.hours);
    if (data.fuelRate)  data.fuelRate  = Number(data.fuelRate);
    if (data.nextMaint) data.nextMaint = new Date(data.nextMaint);
    if (data.lastMaint) data.lastMaint = new Date(data.lastMaint);
    const updated = await prisma.equipment.update({ where: { id: req.params.id }, data });
    ok(res, updated);
  } catch (err) { next(err); }
});

router.post('/:id/maintenance', guard,
  body('type').notEmpty(),
  body('description').notEmpty(),
  body('performedAt').isISO8601(),
  validate,
  async (req, res, next) => {
    try {
      const existing = await prisma.equipment.findUnique({ where: { id: req.params.id } });
      assertOwnership(existing, req);
      const { type, description, cost, performedAt, nextDue, technician } = req.body;
      const maint = await prisma.maintenance.create({
        data: { equipmentId: req.params.id, type, description, cost: cost ? Number(cost) : null, performedAt: new Date(performedAt), nextDue: nextDue ? new Date(nextDue) : null, technician },
      });
      // Update lastMaint on equipment
      await prisma.equipment.update({ where: { id: req.params.id }, data: { lastMaint: new Date(performedAt), ...(nextDue ? { nextMaint: new Date(nextDue) } : {}) } });
      ok(res, maint, 201);
    } catch (err) { next(err); }
  }
);

module.exports = router;
