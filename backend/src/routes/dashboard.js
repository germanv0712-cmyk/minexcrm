const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../middleware/auth');
const { requireTenant, tid } = require('../middleware/tenant');

const prisma = new PrismaClient();
const guard  = [requireAuth, requireTenant];
const ok     = (res, data) => res.json(data);

// GET /dashboard — aggregate KPIs for the command center
router.get('/', guard, async (req, res, next) => {
  try {
    const t = req.tenantId;

    const [
      activeProjects,
      totalProjects,
      activeWells,
      openIncidents,
      pipelineValue,
      equipmentAlerts,
      recentVisits,
      recentIncidents,
      projectsByStatus,
    ] = await Promise.all([
      prisma.project.count({ where: { tenantId: t, status: 'ACTIVE' } }),
      prisma.project.count({ where: { tenantId: t } }),
      prisma.well.count({ where: { tenantId: t, status: 'ACTIVE' } }),
      prisma.incident.count({ where: { tenantId: t, status: { in: ['OPEN','INVESTIGATING'] } } }),
      prisma.opportunity.aggregate({
        where:   { tenantId: t, lostAt: null },
        _sum:    { amount: true },
        _count:  true,
      }),
      prisma.equipment.count({ where: { tenantId: t, status: 'MAINTENANCE' } }),
      prisma.visit.findMany({
        where:   { tenantId: t },
        orderBy: { visitedAt: 'desc' },
        take:    5,
        include: { project: { select: { name: true, code: true } } },
      }),
      prisma.incident.findMany({
        where:   { tenantId: t },
        orderBy: { occurredAt: 'desc' },
        take:    5,
      }),
      prisma.project.groupBy({
        by:    ['status'],
        where: { tenantId: t },
        _count: true,
      }),
    ]);

    // Contract + billing totals
    const financials = await prisma.project.aggregate({
      where: { tenantId: t, status: { in: ['ACTIVE','PAUSED','ALERT'] } },
      _sum:  { contractValue: true, billed: true },
    });

    const contractTotal = Number(financials._sum.contractValue || 0);
    const billedTotal   = Number(financials._sum.billed       || 0);

    // Projects list for map
    const projects = await prisma.project.findMany({
      where:   { tenantId: t, status: { not: 'CANCELLED' } },
      select:  { id: true, name: true, code: true, status: true, lat: true, lng: true, region: true, progress: true, client: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    ok(res, {
      kpis: {
        activeProjects,
        totalProjects,
        activeWells,
        openIncidents,
        pipelineCount: pipelineValue._count,
        pipelineValue: Number(pipelineValue._sum.amount || 0),
        equipmentAlerts,
        contractTotal,
        billedTotal,
        billingRate: contractTotal ? Math.round((billedTotal / contractTotal) * 100) : 0,
      },
      projectsByStatus: Object.fromEntries(projectsByStatus.map(r => [r.status, r._count])),
      projects,
      recentVisits,
      recentIncidents,
    });
  } catch (err) { next(err); }
});

module.exports = router;
