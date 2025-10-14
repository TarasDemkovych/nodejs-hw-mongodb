import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { getEnvVar } from '../utils/getEnvVar.js';
import { SessionCollection } from '../db/models/session.js';
import { UserCollection } from '../db/models/user.js';

const JWT_SECRET = getEnvVar('JWT_SECRET');

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];

    if (!token) {
      throw createHttpError(401, 'No token provided');
    }

    const payload = jwt.verify(token, JWT_SECRET);

    const session = await SessionCollection.findOne({ accessToken: token });
    if (!session) {
      throw createHttpError(401, 'Session not found');
    }

    if (new Date() > session.accessTokenValidUntil) {
      throw createHttpError(401, 'Access token expired');
    }

    const user = await UserCollection.findById(payload.userId);
    if (!user) {
      throw createHttpError(401, 'User not found');
    }
    req.user = {
      _id: user._id,
      email: user.email,
    };

    next();
  } catch (err) {
    next(createHttpError(401, err.message));
  }
};
