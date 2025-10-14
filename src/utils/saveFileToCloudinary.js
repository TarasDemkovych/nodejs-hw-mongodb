import cloudinary from 'cloudinary';
import fs from 'node:fs/promises';

import { getEnvVar } from './getEnvVar.js';
import { ENV_VARS } from '../constants/index.js';

cloudinary.v2.config({
  secure: true,
  cloud_name: getEnvVar(ENV_VARS.CLOUDINARY_NAME),
  api_key: getEnvVar(ENV_VARS.CLOUDINARY_API_KEY),
  api_secret: getEnvVar(ENV_VARS.CLOUDINARY_API_SECRET),
});

export const saveFileToCloudinary = async (file) => {
  const res = await cloudinary.v2.uploader.upload(file.path);
  await fs.unlink(file.path);
  return res.secure_url;
};
