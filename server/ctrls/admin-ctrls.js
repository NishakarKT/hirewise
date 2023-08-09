import { templateToHTML, sendMail } from "../services/mail-services.js";
import { handlebarsReplacements } from "../services/misc-services.js";

export const rankCvs = async (req, res) => {
  try {
    const { apps } = req.body;
    res.status(200).send(apps);
  } catch (err) {
    res.status(500).send({ error: err || "Something went wrong" });
  }
};

export const massMail = async (req, res) => {
  try {
    let cnt = 0;
    const { subject, message, mailIds } = req.body;
    if (mailIds.length === 0) return res.status(200).send({ message: "No mails to send" });
    else
      for (let i = 0; i < mailIds.length; i++) {
        const replacements = { message };
        const source = templateToHTML("templates/applicant.html");
        const content = handlebarsReplacements({ source, replacements });
        await sendMail({ to: mailIds[i], subject: subject + " | " + process.env.COMPANY, html: content });
        cnt++;
        if (cnt === mailIds.length) res.status(200).send({ message: "Mails sent successfully" });
      }
  } catch (err) {
    res.status(500).send({ error: err || "Something went wrong" });
  }
};

export const suggestDesc = async (req, res) => {
  try {
    const { desc } = req.body;
    return res.status(200).send({ desc });
  } catch (err) {
    res.status(500).send({ error: err || "Something went wrong" });
  }
};
