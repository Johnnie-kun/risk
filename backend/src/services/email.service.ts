import nodemailer from 'nodemailer';
import { EMAIL_CONFIG } from '../config/email.config';

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

export interface EmailOptions {
  to: string | string[]; // Single or multiple recipients
  subject: string;
  html: string;
  cc?: string | string[]; // Optional CC recipients
  bcc?: string | string[]; // Optional BCC recipients
  attachments?: Array<{
    filename: string;
    path?: string; // Path to the file
    content?: string | Buffer; // Raw content of the attachment
    contentType?: string; // MIME type of the attachment
  }>;
}

export const emailService = {
  /**
   * Sends an email with the provided details.
   * @param {EmailOptions} options - The email options.
   * @returns {Promise<boolean>} - Returns `true` if the email is sent successfully, `false` otherwise.
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    const { to, subject, html, cc, bcc, attachments } = options;

    try {
      const info = await transporter.sendMail({
        from: `"Bitcoin Predictor App" <${EMAIL_CONFIG.auth.user}>`, // Custom sender name
        to,
        cc,
        bcc,
        subject,
        html,
        attachments,
      });

      console.log('Email sent successfully:', info.response);
      return true;
    } catch (error) {
      console.error('Email sending failed:', (error as Error).message);
      return false;
    }
  },
};