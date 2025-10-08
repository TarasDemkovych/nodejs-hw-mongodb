import { registerUser } from '../services/auth.js';
import createHttpError from 'http-errors';

export const registerController = async (req, res) => {
  const { name, email, password } = req.body;
  const user = await registerUser({ name, email, password });

  if (!user) {
    throw createHttpError(409, 'Email in use');
  }

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};
