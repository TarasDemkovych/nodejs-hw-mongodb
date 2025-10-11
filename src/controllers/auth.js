import {
  registerUser,
  loginUser,
  refreshSession,
  logout,
} from '../services/auth.js';
import createHttpError from 'http-errors';

export const loginController = async (req, res, next) => {
  try {
    const tokens = await loginUser(req.body);
    if (!tokens) throw createHttpError(401, 'Invalid email or password');

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: 200,
      message: 'Successfully logged in an user!',
      data: { accessToken: tokens.accessToken },
    });
  } catch (err) {
    next(err);
  }
};

export const registerController = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    if (!user) throw createHttpError(409, 'Email in use');

    res.status(201).json({
      status: 201,
      message: 'Successfully registered a user!',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const refreshController = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) throw createHttpError(401, 'Refresh token missing');

    const { accessToken } = await refreshSession(refreshToken);

    res.status(200).json({
      status: 200,
      message: 'Successfully refreshed a session!',
      data: { accessToken },
    });
  } catch (err) {
    next(err);
  }
};

export const logoutController = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) throw createHttpError(401, 'Refresh token missing');

    await logout(refreshToken);

    res.clearCookie('refreshToken');
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
