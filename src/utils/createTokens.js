import jwt from 'jsonwebtoken';
import { getEnvVar } from './getEnvVar.js';

const JWT_SECRET = getEnvVar('JWT_SECRET');

export const createTokens = (payload) => {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
  return { accessToken, refreshToken };
};
