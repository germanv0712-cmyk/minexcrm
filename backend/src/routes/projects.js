const router = require('express').Router();
const { body, param, query, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../middleware/auth');
const { requireTenant, tid, assertOwnership } = require('../middleware/tenant');

const prisma = new PrismaClient();
const guard = [requireAuth, requireTenant];

const ok = (res, data, status = 200) => res.status(status).json(data);
const validate = (req, res, next) => {
  const e = validationResult(req);
  if (!e.isEmpty()) return res.status(422).json({ errors: e.array() });
  next();
};

// GET /projects
router.get('/', guard, async (req, res, next) => {
  try {
    const { status, clientId, search, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      ...tid(req),
      ...(status   ? { status }   : {}),
      ...(clientId ? { clientId } : {}),
      ...(search   ? { name: { contains: search, mode: 'insensitive' } } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take:    Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { id: true, name: true, logo: true, color: true } },
          owner:  { select: { id: true, name: true, avatar: true } },
          _count: { select: { wells: true, visits: true, files: true } },
        },
      }),
      prisma.project.count({ where }),
    ]);

    ok(res, { items, total, page: Number(page), limit: Number(limit) });
  } catch (err) { next(err); }
});

// POST /projects
router.post('/', guard,
  body('name').notEmpty(),
  body('clientId').notEmpty(),
  body('service').notEmpty(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('contractValue').isNumeric(),
  validate,
  async (req, res, next) => {
    try {
      const { name, clientId, service, region, lat, lng, startDate, endDate,
              contractValue, description, coverColor } = req.body;

      const count = await prisma.project.count({ where: tid(req) });
      const code  = `PRJ-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

      const project = await prisma.project.create({
        data: {
          ...tid(req),
          clientId,
          ownerId: req.user.sub,
          code,
          name,
          service,
          region:        region || '',
          lat:           lat    ? Number(lat)    : null,
          lng:           lng    ? Number(lng)    : null,
          startDate:     new Date(startDate),
          endDate:       new Date(endDate),
          contractValue: Number(contractValue),
          description,
          coverColor,
        },
        include: { client: true, owner: { select: { id: true, name: true, avatar: true } } },
      });

      ok(res, project, 201);
    } catch (err) { next(err); }
  }
);

// GET /projects/:id
router.get('/:id', guard, async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where:   { id: req.params.id },
      include: {
        client:     { select: { id: true, name: true, logo: true, color: true, email: true, phone: true } },
        owner:      { select: { id: true, name: true, avatar: true, color: true } },
        wells:      { orderBy: { createdAt: 'desc' } },
        milestones: { orderBy: { dueDate: 'asc' } },
        alerts:     { where: { resolved: false }, orderBy: { createdAt: 'desc' } },
        visits:     { orderBy: { visitedAt: 'desc' }, take: 10 },
        files:      { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    assertOwnership(project, req);
    ok(res, project);
  } catch (err) { next(err); }
});

// PATCH /projects/:id
router.patch('/:id', guard,
  body('name').optional().notEmpty(),
  validate,
  async (req, res, next) => {
    try {
      const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
      assertOwnership(existing, req);

      const allowed = ['name','service','region','lat','lng','endDate','contractValue',
                       'billed','progress','status','description','coverColor','ownerId'];
      const data = Object.fromEntries(
        Object.entries(req.body).filter(([k]) => allowed.includes(k))
      );
      if (data.endDate)       data.endDate       = new Date(data.endDate);
      if (data.contractValue) data.contractValue = Number(data.contractValue);
      if (data.billed)        data.billed        = Number(data.billed);
      if (data.lat)           data.lat           = Number(data.lat);
      if (data.lng)           data.lng           = Number(data.lng);

      const updated = await prisma.project.update({ where: { id: req.params.id }, data });
      ok(res, updated);
    } catch (err) { next(err); }
  }
);

// DELETE /projects/:id
router.delete('/:id', guard, async (req, res, next) => {
  try {
    const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
    assertOwnership(existing, req);
    await prisma.project.delete({ where: { id: req.params.id } });
    ok(res, { ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
