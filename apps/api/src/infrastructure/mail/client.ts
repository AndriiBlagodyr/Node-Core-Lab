/**
 * Foundation: provider-agnostic mailer; MailHog SMTP in local Compose.
 *
 * IMPLEMENT:
 * - Interface: send({ to, subject, html | text }).
 * - Dev adapter: nodemailer → SMTP_URL (MailHog on :1025).
 * - Product email flows land in Module 9; only the port exists here.
 */

export type MailMessage = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

export type Mailer = {
  send: (message: MailMessage) => Promise<void>;
};

export function createMailer(_smtpUrl: string): Mailer {
  throw new Error("TODO(foundation): implement infrastructure/mail/client.ts");
}
