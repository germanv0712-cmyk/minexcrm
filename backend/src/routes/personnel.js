const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');
const { requireTenant, tid, assertOwnership } = require('../middleware/tenant');

const prisma = new PrismaClient();
const guard  = [requireAuth, requireTenant];
const ok     = (res, data, status = 200) => res.status(status).json(data);
const validate = (req, res, next) => {
  const e = validationResult(req); if (!e.isEmpty()) return res.status(422).json({ errors: e.array() }); next();
};

// GET /personnel
router.get('/', guard, async (req, res, next) => {
  try {
    const { projectId, role, search } = req.query;
    const where = {
      tenantId: req.tenantId,
      ...(projectId ? { projectId } : {}),
      ...(role      ? { role }      : {}),
      ...(search    ? { name: { contains: search, mode: 'insensitive' } } : {}),
      active: true,
    };
    const people = await prisma.user.findMany({
      where,
      orderBy: { name: 'asc' },
      select: { id: true, name: true, role: true, position: true, avatar: true, color: true, phone: true, shift: true, projectId: true, eps: true, arl: true, lastLoginAt: true, certifications: true },
    });
    ok(res, people);
  } catch (err) { next(err); }
});

// POST /personnel — invite a new user
router.post('/', guard, requireRole('ADMIN', 'SUPER_ADMIN'),
  body('email').isEmail().normalizeEmail(),
  body('name').notEmpty(),
  body('role').isIn(['ADMIN','MANAGER','FIELD','VIEWER','PORTAL']),
  validate,
  async (req, res, next) => {
    try {
      const { email, name, role, position, phone, eps, arl, shift, projectId } = req.body;
      const tempPassword = crypto.randomUUID().slice(0, 12);
      const passwordHash = await bcrypt.hash(tempPassword, 12);

      const user = await prisma.user.create({
        data: {
          tenantId: req.tenantId,
          email, name, role, passwordHash,
          position: position || '',
          phone: phone || '',
          eps: eps || '',
          arl: arl || '',
          shift: shift || 'Día',
          projectId: projectId || null,
        },
        select: { id: true, name: true, email: true, role: true, position: true },
      });

      // In production: send tempPassword via SMTP/SES
      ok(res, { ...user, tempPassword }, 201);
    } catch (err) { next(err); }
  }
);

// GET /personnel/:id
router.get('/:id', guard, async (req, res, next) => {
  try {
    const person = await prisma.user.findFirst({
      where:  { id: req.params.id, tenantId: req.tenantId },
      select: { id: true, name: true, email: true, role: true, position: true, avatar: true, color: true, phone: true, shift: true, projectId: true, eps: true, arl: true, lastLoginAt: true, certifications: { include: {} } },
    });
    if (!person) return res.status(404).json({ error: 'Not found' });
    ok(res, person);
  } catch (err) { next(err); }
});

// PATCH /personnel/:id
router.patch('/:id', guard, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const existing = await prisma.user.findFirst({ where: { id: req.params.id, tenantId: req.tenantId } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    const allowed = ['name','position','phone','eps','arl','shift','projectId','active','role'];
    const data = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const updated = await prisma.user.update({ where: { id: req.params.id }, data, select: { id: true, name: true, role: true, position: true, active: true } });
    ok(res, updated);
  } catch (err) { next(err); }
});

// POST /personnel/:id/certifications
router.post('/:id/certifications', guard,
  body('type').notEmpty(),
  validate,
  async (req, res, next) => {
    try {
      const person = await prisma.user.findFirst({ where: { id: req.params.id, tenantId: req.tenantId } });
      if (!person) return res.status(404).json({ error: 'Not found' });
      const { type, status, issuedAt, expiresAt } = req.body;
      const cert = await prisma.certification.create({
        data: { userId: req.params.id, type, status: status || 'OK', issuedAt: issuedAt ? new Date(issuedAt) : null, expiresAt: expiresAt ? new Date(expiresAt) : null },
      });
      ok(res, cert, 201);
    } catch (err) { next(err); }
  }
);

module.exports = router;
