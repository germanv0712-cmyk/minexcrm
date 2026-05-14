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

// GET /clients
router.get('/', guard, async (req, res, next) => {
  try {
    const { tier, search, page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = {
      ...tid(req),
      ...(tier   ? { tier }   : {}),
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.client.findMany({
        where, skip, take: Number(limit),
        orderBy: { name: 'asc' },
        include: {
          _count:   { select: { projects: true, opportunities: true, contacts: true } },
          contacts: { where: { isPrimary: true }, take: 1 },
        },
      }),
      prisma.client.count({ where }),
    ]);
    ok(res, { items, total });
  } catch (err) { next(err); }
});

// POST /clients
router.post('/', guard,
  body('name').notEmpty(),
  body('nit').notEmpty(),
  body('email').isEmail(),
  validate,
  async (req, res, next) => {
    try {
      const { name, nit, contact, email, phone, region, tier, logo, color, notes } = req.body;
      const client = await prisma.client.create({
        data: { ...tid(req), name, nit, contact: contact || '', email, phone: phone || '', region: region || '', tier: tier || 'C', logo, color, notes },
      });
      ok(res, client, 201);
    } catch (err) { next(err); }
  }
);

// GET /clients/:id
router.get('/:id', guard, async (req, res, next) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.params.id },
      include: {
        contacts:     { orderBy: { isPrimary: 'desc' } },
        projects:     { orderBy: { createdAt: 'desc' }, take: 10, include: { owner: { select: { name: true, avatar: true } } } },
        opportunities: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    assertOwnership(client, req);
    ok(res, client);
  } catch (err) { next(err); }
});

// PATCH /clients/:id
router.patch('/:id', guard, async (req, res, next) => {
  try {
    const existing = await prisma.client.findUnique({ where: { id: req.params.id } });
    assertOwnership(existing, req);
    const allowed = ['name','nit','contact','email','phone','region','tier','logo','color','nextMeeting','notes','active'];
    const data = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    if (data.nextMeeting) data.nextMeeting = new Date(data.nextMeeting);
    const updated = await prisma.client.update({ where: { id: req.params.id }, data });
    ok(res, updated);
  } catch (err) { next(err); }
});

// DELETE /clients/:id
router.delete('/:id', guard, async (req, res, next) => {
  try {
    const existing = await prisma.client.findUnique({ where: { id: req.params.id } });
    assertOwnership(existing, req);
    await prisma.client.delete({ where: { id: req.params.id } });
    ok(res, { ok: true });
  } catch (err) { next(err); }
});

// POST /clients/:id/contacts
router.post('/:id/contacts', guard,
  body('name').notEmpty(),
  validate,
  async (req, res, next) => {
    try {
      const client = await prisma.client.findUnique({ where: { id: req.params.id } });
      assertOwnership(client, req);
      const contact = await prisma.contact.create({
        data: { clientId: req.params.id, ...req.body },
      });
      ok(res, contact, 201);
    } catch (err) { next(err); }
  }
);

module.exports = router;
