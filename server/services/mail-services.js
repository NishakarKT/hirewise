import fs from "fs";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

export const sendMail = async ({ to, subject, html }) =>
  new Promise((resolve, reject) => {
    const from = process.env.COMPANY + " <" + process.env.DISPLAY_EMAIL + ">";
    const options = { from, to, subject, html };
    transporter.sendMail(options, (err, info) => {
      if (err) reject(err);
      else resolve(info.response);
    });
  });

export const templateToHTML = (path) => fs.readFileSync(path, "utf-8").toString();
