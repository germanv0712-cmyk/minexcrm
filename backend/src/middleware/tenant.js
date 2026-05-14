const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Multi-tenancy enforcement.
 *
 * After requireAuth, sets req.tenantId from the JWT claim (tid).
 * Verifies the tenant is active in the DB (cached per process for 60 s).
 *
 * All subsequent DB queries MUST filter by req.tenantId to prevent cross-tenant
 * data leakage. Helpers below enforce this.
 */

const tenantCache = new Map(); // tenantId → { active, expiresAt }
const CACHE_TTL = 60_000; // 60 s

async function requireTenant(req, res, next) {
  const tid = req.user?.tid;
  if (!tid) return res.status(401).json({ error: 'Tenant claim missing from token' });

  const cached = tenantCache.get(tid);
  if (cached && cached.expiresAt > Date.now()) {
    if (!cached.active) return res.status(403).json({ error: 'Tenant suspended' });
    req.tenantId = tid;
    return next();
  }

  try {
    const tenant = await prisma.tenant.findUnique({
      where:  { id: tid },
      select: { id: true, active: true },
    });

    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

    tenantCache.set(tid, { active: tenant.active, expiresAt: Date.now() + CACHE_TTL });

    if (!tenant.active) return res.status(403).json({ error: 'Tenant suspended' });

    req.tenantId = tid;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Convenience: returns a Prisma `where` clause fragment that always includes
 * the current tenant. Use it in every query:
 *
 *   prisma.project.findMany({ where: { ...tid(req), status: 'ACTIVE' } })
 */
function tid(req) {
  return { tenantId: req.tenantId };
}

/**
 * Assert a fetched record belongs to the request's tenant.
 * Throws 404 if missing or 403 if it belongs to another tenant.
 */
function assertOwnership(record, req) {
  if (!record) throw Object.assign(new Error('Not found'), { status: 404 });
  if (record.tenantId !== req.tenantId) {
    throw Object.assign(new Error('Forbidden'), { status: 403 });
  }
}

module.exports = { requireTenant, tid, assertOwnership };
