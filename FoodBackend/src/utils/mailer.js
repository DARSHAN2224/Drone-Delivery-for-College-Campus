import dotenv from 'dotenv'

dotenv.config()

import nodemailer from "nodemailer";

//for sending mail to verify the mail

export const sender = {
  email: process.env.SMTP_MAIL,
  name: "Mails Test",
};

export const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD
  }
});


