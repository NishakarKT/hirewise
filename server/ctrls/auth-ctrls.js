// models
import { User, Otp } from "../models.js";
// services
import { sendMail } from "../services/mail-services.js";
import { templateToHTML } from "../services/mail-services.js";
import { generateJWT, verifyJWT, generateHash, compareHash } from "../services/misc-services.js";
import { handlebarsReplacements } from "../services/misc-services.js";

export const signIn = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      res.status(422);
      throw new Error("missing email");
    } else {
      const user = await User.findOne({ email });
      if (!user) {
        const newUser = new User({ email });
        const userData = await newUser.save();
        const token = generateJWT({ email }, { expiresIn: "30d" });
        res.status(201).send({ user: userData, message: "new user", token });
      } else {
        const token = generateJWT({ email: user.email }, { expiresIn: "30d" });
        res.status(200).send({ user, message: "existing User", token });
      }
    }
  } catch (err) {
    res.send({ message: err.message });
  }
};

export const token = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) throw new Error("missing token");
    const decoded = verifyJWT(token);
    const user = await User.findOne({ email: decoded.email });
    if (user) {
      res.status(200).send({ user, message: "existing user" });
    } else {
      res.status(401);
      throw new Error("invalid/expired token");
    }
  } catch (err) {
    res.send({ message: "not authorized" });
  }
};

export const otp_generate = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      res.status(422);
      throw new Error("missing email");
    } else {
      // generating OTP
      const otpLen = 6;
      const otp = Math.floor(Math.random() * Math.pow(10, otpLen - 1) * 9) + Math.pow(10, otpLen - 1);
      // hashing OTP
      const hashedOtp = await generateHash(otp, 10);
      // generating token ref
      const token = generateJWT({ hashedOtp }, { expiresIn: "1m" });
      // saving OTP
      const newOtp = new Otp({ token, email, hashedOtp });
      await newOtp.save();
      // generating content
      const replacements = { otp, expiresIn: "2 minutes" };
      const source = templateToHTML("templates/otp.html");
      const content = handlebarsReplacements({ source, replacements });
      // sending mail
      sendMail({ to: email, subject: "OTP verification | " + process.env.COMPANY, html: content })
        .then(() => res.status(200).send({ message: "OTP is sent", token }))
        .catch((err) => res.status(424).send({ message: err.message }));
    }
  } catch (err) {
    res.send({ message: err.message });
  }
};

export const otp_verify = async (req, res) => {
  try {
    const { otp, email, token } = req.body;
    if (!otp) {
      res.status(422);
      throw Error("OTP is not provided");
    } else if (!email) {
      res.status(422);
      throw Error("email is not provided");
    } else if (!token) {
      res.status(422);
      throw Error("token is not provided");
    } else {
      const otps = await Otp.find({ token });
      if (otps.length <= 0) {
        res.status(404);
        throw Error("OTP doesn't exist");
      } else {
        try {
          const { hashedOtp } = verifyJWT(token);
          const match = await compareHash(otp, hashedOtp);
          if (!match) {
            res.status(498);
            throw Error("OTP is inavalid");
          } else {
            await Otp.deleteMany({ $or: [{ token }, { email }, { hashedOtp }] });
            res.status(201).send({ message: "OTP is verified", verified: true });
          }
        } catch (err) {
          res.status(498);
          throw new Error("OTP has expired, try refreshing");
        }
      }
    }
  } catch (err) {
    res.send({ message: err.message });
  }
};
