import React from "react";
import { render } from "@react-email/components";
import nodemailer from "nodemailer";

import { env } from "../env";

export async function sendEmail(
  to: string,
  subject: string,
  content: React.ReactNode,
) {
  console.log("Sending email to", to, {
    host: env.SMTP_EMAIL_HOST,
    port: env.SMTP_EMAIL_PORT,
    auth: {
      user: env.SMTP_EMAIL_ADDRESS,
      pass: env.SMTP_EMAIL_PASSWORD,
    },
  });
  const transporter = nodemailer.createTransport({
    host: env.SMTP_EMAIL_HOST,
    secure: env.PUBLIC_ENVIRONMENT === "production",
    port: env.SMTP_EMAIL_PORT,
    auth: {
      user: env.SMTP_EMAIL_ADDRESS ?? "user@host",
      pass: env.SMTP_EMAIL_PASSWORD ?? "pass",
    },
  });

  if (!React.isValidElement(content)) {
    throw new Error("Content is not a valid React element");
  }

  const html = await render(content);

  const info = await transporter.sendMail({
    from: env.SMTP_SENDFROM,
    to,
    subject,
    html,
  });

  console.log("Message sent: %s", info.messageId);
}
