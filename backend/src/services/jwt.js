const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const ACCESS_TTL  = '15m';
const REFRESH_TTL = '30d';
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function signAccess(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TTL,
    issuer: 'minexcrm',
  });
}

function verifyAccess(token) {
  return jwt.verify(token, process.env.JWT_SECRET, { issuer: 'minexcrm' });
}

async function issueTokenPair(user) {
  const accessPayload = {
    sub: user.id,
    tid: user.tenantId,
    role: user.role,
    name: user.name,
  };

  const accessToken  = signAccess(accessPayload);
  const refreshToken = uuidv4();

  await prisma.refreshToken.create({
    data: {
      tenantId:  user.tenantId,
      userId:    user.id,
      token:     refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    },
  });

  return { accessToken, refreshToken };
}

async function rotateRefreshToken(oldToken) {
  const record = await prisma.refreshToken.findUnique({ where: { token: oldToken } });

  if (!record || record.revoked || record.expiresAt < new Date()) {
    throw Object.assign(new Error('Invalid or expired refresh token'), { status: 401 });
  }

  // Revoke old token (rotation)
  await prisma.refreshToken.update({
    where: { id: record.id },
    data:  { revoked: true },
  });

  const user = await prisma.user.findUnique({ where: { id: record.userId } });
  if (!user || !user.active) throw Object.assign(new Error('User inactive'), { status: 401 });

  return issueTokenPair(user);
}

async function revokeRefreshToken(token) {
  await prisma.refreshToken.updateMany({
    where: { token },
    data:  { revoked: true },
  });
}

async function revokeAllUserTokens(userId) {
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data:  { revoked: true },
  });
}

module.exports = {
  signAccess,
  verifyAccess,
  issueTokenPair,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
};
