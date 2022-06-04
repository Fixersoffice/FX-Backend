const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.FIXERS_SMTP_HOST,
    port: process.env.FIXERS_SMTP_PORT,
    auth: {
      user: process.env.FIXERS_SMTP_USER,
      pass: process.env.FIXERS_SMTP_PASSWORD,
    },
  });
  const message = {
    from: `${process.env.PAYES_EMAIL_FROM_NAME} <${process.env.PAYERCOINS_FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.message,
  };

  await transporter.sendMail(message);
};

module.exports = sendEmail;
