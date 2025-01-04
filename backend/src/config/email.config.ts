import { config } from 'dotenv';

// Load environment variables from .env file
config();

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

/**
 * Email configuration object.
 * Uses environment variables for SMTP settings.
 * Throws an error if required variables are missing.
 */
export const EMAIL_CONFIG: EmailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  // Dynamically determine whether to use secure connection based on the port
  secure: process.env.EMAIL_PORT === '465', // SMTP for SSL uses 465, others use TLS (587)
  auth: {
    user: process.env.EMAIL_USER as string,
    pass: process.env.EMAIL_PASSWORD as string,
  },
};

// Validate required environment variables
const validateEmailConfig = (config: EmailConfig): void => {
  if (!config.host) {
    throw new Error("Missing email host in environment variables.");
  }

  if (!config.port || isNaN(config.port)) {
    throw new Error("Invalid or missing email port in environment variables.");
  }

  if (!config.auth.user || !config.auth.pass) {
    throw new Error("Missing email user or password in environment variables.");
  }
};

// Validate the email configuration at startup
validateEmailConfig(EMAIL_CONFIG);