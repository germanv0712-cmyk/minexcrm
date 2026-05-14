const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { issueTokenPair, rotateRefreshToken, revokeRefreshToken, revokeAllUserTokens } = require('../services/jwt');
const { requireAuth } = require('../middleware/auth');

const prisma = new PrismaClient();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  next();
};

// POST /auth/login
router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate,
  async (req, res, next) => {
    try {
      const { email, password, tenantId } = req.body;

      const user = await prisma.user.findFirst({
        where: {
          email,
          ...(tenantId ? { tenantId } : {}),
          active: true,
        },
        include: { tenant: { select: { active: true } } },
      });

      if (!user || !user.tenant.active) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

      await prisma.user.update({
        where: { id: user.id },
        data:  { lastLoginAt: new Date() },
      });

      const { accessToken, refreshToken } = await issueTokenPair(user);

      res.json({
        accessToken,
        refreshToken,
        user: {
          id:       user.id,
          name:     user.name,
          email:    user.email,
          role:     user.role,
          tenantId: user.tenantId,
          avatar:   user.avatar,
          color:    user.color,
          mfaEnabled: user.mfaEnabled,
        },
      });
    } catch (err) { next(err); }
  }
);

// POST /auth/refresh
router.post('/refresh',
  body('refreshToken').notEmpty(),
  validate,
  async (req, res, next) => {
    try {
      const { accessToken, refreshToken } = await rotateRefreshToken(req.body.refreshToken);
      res.json({ accessToken, refreshToken });
    } catch (err) {
      if (err.status === 401) return res.status(401).json({ error: err.message });
      next(err);
    }
  }
);

// POST /auth/logout
router.post('/logout',
  requireAuth,
  async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) await revokeRefreshToken(refreshToken);
      res.json({ ok: true });
    } catch (err) { next(err); }
  }
);

// POST /auth/logout-all (revoke all sessions)
router.post('/logout-all',
  requireAuth,
  async (req, res, next) => {
    try {
      await revokeAllUserTokens(req.user.sub);
      res.json({ ok: true });
    } catch (err) { next(err); }
  }
);

// GET /auth/me
router.get('/me',
  requireAuth,
  async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({
        where:  { id: req.user.sub },
        select: {
          id: true, name: true, email: true, role: true,
          tenantId: true, avatar: true, color: true, phone: true,
          position: true, mfaEnabled: true, lastLoginAt: true,
          tenant: { select: { id: true, name: true, short: true, nit: true, plan: true } },
        },
      });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (err) { next(err); }
  }
);

// POST /auth/change-password
router.post('/change-password',
  requireAuth,
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
  validate,
  async (req, res, next) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
      const valid = await bcrypt.compare(req.body.currentPassword, user.passwordHash);
      if (!valid) return res.status(401).json({ error: 'Current password incorrect' });

      const passwordHash = await bcrypt.hash(req.body.newPassword, 12);
      await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
      await revokeAllUserTokens(user.id);

      res.json({ ok: true, message: 'Password changed. Please log in again.' });
    } catch (err) { next(err); }
  }
);

module.exports = router;
