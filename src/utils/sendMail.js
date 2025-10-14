import nodemailer from 'nodemailer';

import { SMTP } from '../constants/index.js';
import { getEnvVar } from './getEnvVar.js';
import createHttpError from 'http-errors';

const transporter = nodemailer.createTransport({
  host: getEnvVar(SMTP.SMTP_HOST),
  port: getEnvVar(SMTP.SMTP_PORT),
  auth: {
    user: getEnvVar(SMTP.SMTP_USER),
    pass: getEnvVar(SMTP.SMTP_PASSWORD),
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      subject,
      to,
      from: getEnvVar(SMTP.SMTP_FROM),
      html,
    });
  } catch (error) {
    throw createHttpError(
      500,
      `Failed to send the email, please try again later. ${error.message}`,
    );
  }
};
