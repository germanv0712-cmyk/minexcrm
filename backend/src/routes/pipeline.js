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

const STAGES = ['prospect', 'qualification', 'proposal', 'negotiation', 'close'];

// GET /pipeline — grouped by stage for kanban
router.get('/', guard, async (req, res, next) => {
  try {
    const { ownerId } = req.query;
    const where = { ...tid(req), ...(ownerId ? { ownerId } : {}), lostAt: null };

    const opps = await prisma.opportunity.findMany({
      where,
      orderBy: [{ stage: 'asc' }, { closeDate: 'asc' }],
      include: {
        client: { select: { id: true, name: true, logo: true, color: true } },
        owner:  { select: { id: true, name: true, avatar: true } },
      },
    });

    // Group into kanban columns
    const columns = STAGES.reduce((acc, s) => {
      acc[s] = opps.filter(o => o.stage === s);
      return acc;
    }, {});

    const summary = {
      total:     opps.length,
      totalValue: opps.reduce((s, o) => s + Number(o.amount), 0),
      byStage:   Object.fromEntries(
        STAGES.map(s => [s, { count: columns[s].length, value: columns[s].reduce((a, o) => a + Number(o.amount), 0) }])
      ),
    };

    ok(res, { columns, summary, stages: STAGES });
  } catch (err) { next(err); }
});

// POST /pipeline
router.post('/', guard,
  body('name').notEmpty(),
  body('clientId').notEmpty(),
  body('amount').isNumeric(),
  body('closeDate').isISO8601(),
  validate,
  async (req, res, next) => {
    try {
      const { name, clientId, amount, prob, stage, closeDate, nextAction, notes } = req.body;
      const opp = await prisma.opportunity.create({
        data: {
          ...tid(req),
          clientId,
          ownerId:    req.user.sub,
          name,
          amount:     Number(amount),
          prob:       prob ? Number(prob) : 50,
          stage:      stage || 'prospect',
          closeDate:  new Date(closeDate),
          nextAction,
          notes,
        },
        include: { client: true },
      });
      ok(res, opp, 201);
    } catch (err) { next(err); }
  }
);

// PATCH /pipeline/:id/stage — move a card between stages (drag & drop)
router.patch('/:id/stage', guard,
  body('stage').isIn(STAGES),
  body('prob').optional().isInt({ min: 0, max: 100 }),
  validate,
  async (req, res, next) => {
    try {
      const existing = await prisma.opportunity.findUnique({ where: { id: req.params.id } });
      assertOwnership(existing, req);

      const isClosing = req.body.stage === 'close';
      const data = {
        stage: req.body.stage,
        ...(req.body.prob !== undefined ? { prob: Number(req.body.prob) } : {}),
        ...(isClosing ? { wonAt: new Date() } : {}),
      };

      const updated = await prisma.opportunity.update({ where: { id: req.params.id }, data });
      ok(res, updated);
    } catch (err) { next(err); }
  }
);

// PATCH /pipeline/:id
router.patch('/:id', guard, async (req, res, next) => {
  try {
    const existing = await prisma.opportunity.findUnique({ where: { id: req.params.id } });
    assertOwnership(existing, req);
    const allowed = ['name','amount','prob','stage','closeDate','nextAction','notes','ownerId'];
    const data = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    if (data.amount)    data.amount    = Number(data.amount);
    if (data.prob)      data.prob      = Number(data.prob);
    if (data.closeDate) data.closeDate = new Date(data.closeDate);
    const updated = await prisma.opportunity.update({ where: { id: req.params.id }, data });
    ok(res, updated);
  } catch (err) { next(err); }
});

// POST /pipeline/:id/lost — mark as lost
router.post('/:id/lost', guard,
  body('reason').notEmpty(),
  validate,
  async (req, res, next) => {
    try {
      const existing = await prisma.opportunity.findUnique({ where: { id: req.params.id } });
      assertOwnership(existing, req);
      const updated = await prisma.opportunity.update({
        where: { id: req.params.id },
        data:  { lostAt: new Date(), lostReason: req.body.reason, prob: 0 },
      });
      ok(res, updated);
    } catch (err) { next(err); }
  }
);

// POST /pipeline/:id/convert — convert to project
router.post('/:id/convert', guard,
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  validate,
  async (req, res, next) => {
    try {
      const opp = await prisma.opportunity.findUnique({
        where:   { id: req.params.id },
        include: { client: true },
      });
      assertOwnership(opp, req);

      const count   = await prisma.project.count({ where: tid(req) });
      const code    = `PRJ-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

      const [project] = await prisma.$transaction([
        prisma.project.create({
          data: {
            ...tid(req),
            clientId:      opp.clientId,
            ownerId:       req.user.sub,
            code,
            name:          opp.name,
            service:       req.body.service || 'Perforación',
            region:        opp.client.region || '',
            startDate:     new Date(req.body.startDate),
            endDate:       new Date(req.body.endDate),
            contractValue: Number(opp.amount),
          },
        }),
        prisma.opportunity.update({
          where: { id: req.params.id },
          data:  { stage: 'close', wonAt: new Date(), prob: 100 },
        }),
      ]);

      ok(res, project, 201);
    } catch (err) { next(err); }
  }
);

module.exports = router;
