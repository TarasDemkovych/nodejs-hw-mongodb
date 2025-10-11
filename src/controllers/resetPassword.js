import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { getEnvVar } from '../utils/getEnvVar.js';
import { sendEmail } from '../utils/sendEmail.js';
import { User } from '../db/models/User.js';
import bcrypt from 'bcryptjs';

const JWT_SECRET = getEnvVar('JWT_SECRET');
const APP_DOMAIN = getEnvVar('APP_DOMAIN');

export const sendResetEmailController = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw createHttpError(404, 'User not found!');

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '5m' });

    const resetLink = `${APP_DOMAIN}/reset-password?token=${token}`;

    const html = `
      <h2>Password reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
    `;

    await sendEmail({
      to: email,
      subject: 'Reset your password',
      html,
    });

    res.status(200).json({
      status: 200,
      message: 'Reset password email has been successfully sent.',
      data: {},
    });
  } catch (err) {
    if (err.responseCode) {
      next(
        createHttpError(
          500,
          'Failed to send the email, please try again later.',
        ),
      );
    } else {
      next(err);
    }
  }
};

export const resetPasswordController = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      throw createHttpError(401, 'Token is expired or invalid.');
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) throw createHttpError(404, 'User not found!');

    user.password = await bcrypt.hash(password, 10);
    user.refreshToken = null;
    await user.save();

    res.status(200).json({
      status: 200,
      message: 'Password has been successfully reset.',
      data: {},
    });
  } catch (err) {
    next(err);
  }
};
