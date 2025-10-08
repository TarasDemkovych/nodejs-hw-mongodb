import bcrypt from 'bcrypt';
import { UserCollection } from '../db/models/user.js';

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
