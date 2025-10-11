import { v2 as cloudinary } from 'cloudinary';
import { getEnvVar } from './getEnvVar.js';

cloudinary.config({
  cloud_name: getEnvVar('CLOUDINARY_NAME'),
  api_key: getEnvVar('CLOUDINARY_API_KEY'),
  api_secret: getEnvVar('CLOUDINARY_API_SECRET'),
});

export default cloudinary;
