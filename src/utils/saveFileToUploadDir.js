import path from 'node:path';
import fs from 'node:fs/promises';
import { TEMP_UPLOAD_DIR, UPLOAD_DIR } from '../constants/index.js';
import { getEnvVar } from './getEnvVar.js';
import createHttpError from 'http-errors';

export const saveFileToUploadDir = async (file) => {
  const tempDirPath = path.join(TEMP_UPLOAD_DIR, file.filename);
  const uploadDirPath = path.join(UPLOAD_DIR, file.filename);

  try {
    await fs.rename(tempDirPath, uploadDirPath);
    return `${getEnvVar('BACKEND_DOMAIN').replace(/\/$/, '')}/uploads/${
      file.filename
    }`;
  } catch {
    await fs.unlink(tempDirPath);
    throw createHttpError(500, 'Upload photo failed, try again.');
  }
};
