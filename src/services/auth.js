import fs from 'node:fs';
import path from 'node:path';
import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UsersCollection } from '../db/models/user.js';
import { SessionCollection } from '../db/models/session.js';
import {
  ENV_VARS,
  FIFTEEN_DAYS,
  FIFTEEN_MINUTES,
  TEMPLATE_DIR_PATH,
} from '../constants/index.js';
import createHttpError from 'http-errors';
import { getEnvVar } from '../utils/getEnvVar.js';
import { sendEmail } from '../utils/sendMail.js';

const resetPasswordTemplate = fs
  .readFileSync(path.join(TEMPLATE_DIR_PATH, 'send-reset-email-password.html'))
  .toString();

export const registerUser = async (payload) => {
  const user = await UsersCollection.findOne({
    email: payload.email,
  });

  if (user) {
    throw createHttpError(409, 'Email allready registed.');
  }

  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  return await UsersCollection.create({
    ...payload,
    password: encryptedPassword,
  });
};

export const loginUser = async ({ email, password }) => {
  const user = await UsersCollection.findOne({ email: email });

  if (!user) {
    throw createHttpError(401, 'User with given credentials does not exist!');
  }

  const arePasswordsEqual = await bcrypt.compare(password, user.password);

  if (!arePasswordsEqual) {
    throw createHttpError(401, 'User with given credentials does not exist!');
  }

  await SessionCollection.deleteOne({ userId: user._id });

  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  const session = await SessionCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + FIFTEEN_DAYS),
  });

  return session;
};

export const logoutUser = async (sessionId) => {
  await SessionCollection.findByIdAndDelete(sessionId);
};

export const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  const session = {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + FIFTEEN_DAYS),
  };

  return session;
};

export const refreshUserSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionCollection.findOne({ _id: sessionId });

  if (!session) {
    throw createHttpError(401, 'Session not found.');
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired.');
  }

  await SessionCollection.deleteOne({
    _id: sessionId,
    refreshToken,
  });

  const newSession = createSession();

  return await SessionCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

export const sendResetTokenEmail = async (email) => {
  const user = await UsersCollection.findOne({ email });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const hostName = getEnvVar(ENV_VARS.APP_DOMAIN);

  const resetToken = jwt.sign(
    {
      sub: user._id,
      email: user.email,
    },
    getEnvVar(ENV_VARS.JWT_SECRET),
    {
      expiresIn: '15m',
    },
  );

  const resetPasswordLink = `${hostName.replace(
    /\/$/,
    '',
  )}/auth/reset-pwd?token=${resetToken}`;

  const emailTemplate = handlebars.compile(resetPasswordTemplate);

  const html = emailTemplate({
    name: user.name,
    link: resetPasswordLink,
  });

  await sendEmail({
    to: email,
    subject: 'Reset your password',
    html,
  });
};

export const resetPassword = async (token, password) => {
  let payload;

  try {
    payload = jwt.verify(token, getEnvVar(ENV_VARS.JWT_SECRET));
  } catch (error) {
    if (error instanceof Error) throw createHttpError(401, error.message);
    throw error;
  }

  const user = await UsersCollection.findById(payload.sub);

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  user.password = await bcrypt.hash(password, 10);

  await user.save();

  await SessionCollection.findOneAndDelete({ userId: user._id });
};
