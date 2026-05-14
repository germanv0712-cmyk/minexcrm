const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../middleware/auth');
const { requireTenant, tid, assertOwnership } = require('../middleware/tenant');
const s3 = require('../services/s3');

const prisma = new PrismaClient();
const guard  = [requireAuth, requireTenant];
const ok     = (res, data, status = 200) => res.status(status).json(data);
const validate = (req, res, next) => {
  const e = validationResult(req); if (!e.isEmpty()) return res.status(422).json({ errors: e.array() }); next();
};

const ALLOWED_CATEGORIES = ['photo','video','document','raw_data','report','signature','core_photo'];
const ALLOWED_MIME = [
  'image/jpeg','image/png','image/webp','image/gif',
  'video/mp4','video/quicktime',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'application/zip',
];

/**
 * POST /files/presign
 * Request a presigned S3 upload URL. Frontend uploads directly to S3,
 * then calls POST /files/confirm.
 */
router.post('/presign', guard,
  body('filename').notEmpty(),
  body('mimeType').isIn(ALLOWED_MIME),
  body('size').isInt({ min: 1, max: 500 * 1024 * 1024 }),
  body('category').isIn(ALLOWED_CATEGORIES),
  validate,
  async (req, res, next) => {
    try {
      const { filename, mimeType, size, category } = req.body;
      const result = await s3.presignUpload({
        tenantId: req.tenantId,
        category,
        filename,
        mimeType,
        size,
      });
      ok(res, result);
    } catch (err) { next(err); }
  }
);

/**
 * POST /files/confirm
 * Called after the client uploads to S3. Verifies the object exists and
 * saves metadata to the DB.
 */
router.post('/confirm', guard,
  body('key').notEmpty(),
  body('bucket').notEmpty(),
  body('filename').notEmpty(),
  body('mimeType').notEmpty(),
  body('size').isInt({ min: 1 }),
  body('category').isIn(ALLOWED_CATEGORIES),
  validate,
  async (req, res, next) => {
    try {
      const { key, bucket, filename, mimeType, size, category,
              projectId, wellId, coreSampleId, visitId, incidentId, permitId, equipmentId } = req.body;

      const { exists } = await s3.verifyExists(key);
      if (!exists) return res.status(400).json({ error: 'File not found in S3. Upload may have failed.' });

      const file = await prisma.file.create({
        data: {
          ...tid(req),
          key, bucket, filename, mimeType, size: Number(size),
          category:     category.toUpperCase(),
          uploadedBy:   req.user.name,
          projectId:    projectId    || null,
          wellId:       wellId       || null,
          coreSampleId: coreSampleId || null,
          visitId:      visitId      || null,
          incidentId:   incidentId   || null,
          permitId:     permitId     || null,
          equipmentId:  equipmentId  || null,
        },
      });

      ok(res, file, 201);
    } catch (err) { next(err); }
  }
);

/**
 * GET /files/:id/url — get a fresh presigned download URL
 */
router.get('/:id/url', guard, async (req, res, next) => {
  try {
    const file = await prisma.file.findUnique({ where: { id: req.params.id } });
    assertOwnership(file, req);
    const url = await s3.presignDownload(file.key);
    ok(res, { url, expiresIn: 900 });
  } catch (err) { next(err); }
});

/**
 * GET /files — list files for a given resource
 */
router.get('/', guard, async (req, res, next) => {
  try {
    const { projectId, wellId, visitId, incidentId, permitId, coreSampleId, category } = req.query;
    const where = {
      ...tid(req),
      ...(projectId    ? { projectId }    : {}),
      ...(wellId       ? { wellId }       : {}),
      ...(visitId      ? { visitId }      : {}),
      ...(incidentId   ? { incidentId }   : {}),
      ...(permitId     ? { permitId }     : {}),
      ...(coreSampleId ? { coreSampleId } : {}),
      ...(category     ? { category: category.toUpperCase() } : {}),
    };
    const files = await prisma.file.findMany({ where, orderBy: { createdAt: 'desc' } });
    // Attach presigned URLs
    const withUrls = await s3.presignMany(files);
    ok(res, withUrls);
  } catch (err) { next(err); }
});

/**
 * DELETE /files/:id
 */
router.delete('/:id', guard, async (req, res, next) => {
  try {
    const file = await prisma.file.findUnique({ where: { id: req.params.id } });
    assertOwnership(file, req);
    await s3.deleteObject(file.key);
    await prisma.file.delete({ where: { id: req.params.id } });
    ok(res, { ok: true });
  } catch (err) { next(err); }
});

module.exports = router;
