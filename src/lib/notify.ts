import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function notifyAdmin(subject: string, html: string) {
  const to = process.env.ADMIN_NOTIFY_EMAIL;
  if (!to || !process.env.SMTP_HOST) return;

  try {
    await transporter.sendMail({
      from: `"Primemet Website" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("[notify] failed to send admin notification:", err);
  }
}
