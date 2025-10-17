import path from 'node:path';

export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
};

export const FIFTEEN_MINUTES = 15 * 60 * 1000;
export const FIFTEEN_DAYS = 15 * 24 * 60 * 60 * 1000;

export const SMTP = {
  SMTP_HOST: 'SMTP_HOST',
  SMTP_PORT: 'SMTP_PORT',
  SMTP_USER: 'SMTP_USER',
  SMTP_PASSWORD: 'SMTP_PASSWORD',
  SMTP_FROM: 'SMTP_FROM',
};

export const ENV_VARS = {
  APP_DOMAIN: 'APP_DOMAIN',
  JWT_SECRET: 'JWT_SECRET',
  BACKEND_DOMAIN: 'BACKEND_DOMAIN',
  CLOUDINARY_NAME: 'CLOUDINARY_NAME',
  CLOUDINARY_API_KEY: 'CLOUDINARY_API_KEY',
  CLOUDINARY_API_SECRET: 'CLOUDINARY_API_SECRET',
  ENABLE_CLOUDINARY: 'ENABLE_CLOUDINARY',
};

export const TEMP_UPLOAD_DIR = path.join(process.cwd(), 'temp');

export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

export const TEMPLATE_DIR_PATH = path.join(process.cwd(), 'src', 'templates');
export const SWAGGER_PATH = path.join(process.cwd(), 'docs', 'swagger.json');
