const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.S3_BUCKET;
const PRESIGN_UPLOAD_TTL   = 3600;   // 1 h — time to upload
const PRESIGN_DOWNLOAD_TTL = 900;    // 15 min — time to read

/**
 * Generate a presigned PUT URL so the frontend uploads directly to S3.
 * Returns { uploadUrl, key, publicUrl? }
 */
async function presignUpload({ tenantId, category, filename, mimeType, size }) {
  if (size > 500 * 1024 * 1024) {
    throw Object.assign(new Error('File exceeds 500 MB limit'), { status: 413 });
  }

  const ext = path.extname(filename).toLowerCase();
  const key = `${tenantId}/${category}/${uuidv4()}${ext}`;

  const cmd = new PutObjectCommand({
    Bucket:      BUCKET,
    Key:         key,
    ContentType: mimeType,
    Metadata: {
      'x-tenant': tenantId,
      'x-category': category,
      'x-original-name': encodeURIComponent(filename),
    },
  });

  const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: PRESIGN_UPLOAD_TTL });

  return { uploadUrl, key, bucket: BUCKET };
}

/**
 * Generate a presigned GET URL for a private S3 object.
 */
async function presignDownload(key) {
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3, cmd, { expiresIn: PRESIGN_DOWNLOAD_TTL });
}

/**
 * Verify an object exists in S3 (called after client reports upload done).
 */
async function verifyExists(key) {
  try {
    const cmd = new HeadObjectCommand({ Bucket: BUCKET, Key: key });
    const head = await s3.send(cmd);
    return { exists: true, size: head.ContentLength, mimeType: head.ContentType };
  } catch {
    return { exists: false };
  }
}

/**
 * Delete an object from S3.
 */
async function deleteObject(key) {
  const cmd = new DeleteObjectCommand({ Bucket: BUCKET, Key: key });
  await s3.send(cmd);
}

/**
 * Batch presign download URLs for an array of file records.
 */
async function presignMany(files) {
  return Promise.all(
    files.map(async (f) => ({
      ...f,
      url: await presignDownload(f.key),
    }))
  );
}

module.exports = {
  presignUpload,
  presignDownload,
  verifyExists,
  deleteObject,
  presignMany,
};
