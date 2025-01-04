import nodemailer from 'nodemailer';
import { EMAIL_CONFIG } from '../config/email.config';

const transporter = nodemailer.createTransport(EMAIL_CONFIG);

export const emailService = {
  async sendEmail(to: string, subject: string, html: string) {
    try {
      await transporter.sendMail({
        from: EMAIL_CONFIG.auth.user,
        to,
        subject,
        html
      });
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }
};