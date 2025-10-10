import nodemailer from 'nodemailer';
import { getEnvVar } from './getEnvVar.js';

const transport = nodemailer.createTransport({
  host: getEnvVar('SMTP_HOST'),
  port: +getEnvVar('SMTP_PORT'),
  auth: {
    user: getEnvVar('SMTP_USER'),
    pass: getEnvVar('SMTP_PASSWORD'),
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  const from = getEnvVar('SMTP_FROM');

  const email = {
    from,
    to,
    subject,
    html,
  };

  await transport.sendMail(email);
};
