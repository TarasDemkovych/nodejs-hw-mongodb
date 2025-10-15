import bcrypt from 'bcrypt';
import { UserCollection } from '../db/models/user.js';
import jwt from 'jsonwebtoken';
import { SessionCollection } from '../db/models/session.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import createHttpError from 'http-errors';

const JWT_SECRET = getEnvVar('JWT_SECRET');
const ACCESS_TOKEN_TTL = 15 * 60 * 1000;
const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60 * 1000;

export const loginUser = async ({ email, password }) => {
  const user = await UserCollection.findOne({ email });
  if (!user) return null;

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return null;

  const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: '15m',
  });

  const refreshToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: '30d',
  });

  const now = new Date();

  const existingSession = await SessionCollection.findOne({ userId: user._id });

  if (existingSession) {
    existingSession.accessToken = accessToken;
    existingSession.refreshToken = refreshToken;
    existingSession.accessTokenValidUntil = new Date(
      now.getTime() + ACCESS_TOKEN_TTL,
    );
    existingSession.refreshTokenValidUntil = new Date(
      now.getTime() + REFRESH_TOKEN_TTL,
    );
    await existingSession.save();
  } else {
    await SessionCollection.create({
      userId: user._id,
      accessToken,
      refreshToken,
      accessTokenValidUntil: new Date(now.getTime() + ACCESS_TOKEN_TTL),
      refreshTokenValidUntil: new Date(now.getTime() + REFRESH_TOKEN_TTL),
    });
  }

  return { accessToken, refreshToken };
};

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await UserCollection.findOne({ email });
  if (existingUser) return null;

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await UserCollection.create({
    name,
    email,
    password: hashedPassword,
  });

  const userWithoutPassword = newUser.toObject();
  delete userWithoutPassword.password;

  return userWithoutPassword;
};

export const refreshSession = async (refreshToken) => {
  const session = await SessionCollection.findOne({ refreshToken });

  if (!session) throw createHttpError(401, 'Session not found');

  const now = new Date();
  if (session.refreshTokenValidUntil < now) {
    await SessionCollection.deleteOne({ _id: session._id });
    throw createHttpError(401, 'Refresh token expired');
  }

  const accessToken = jwt.sign({ userId: session.userId }, JWT_SECRET, {
    expiresIn: '15m',
  });

  session.accessToken = accessToken;
  session.accessTokenValidUntil = new Date(now.getTime() + ACCESS_TOKEN_TTL);
  await session.save();

  return { accessToken };
};

export const logout = async (refreshToken) => {
  const session = await SessionCollection.findOne({ refreshToken });

  if (!session) throw createHttpError(401, 'Session not found');

  await SessionCollection.deleteOne({ _id: session._id });
};
