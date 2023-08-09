import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Handlebars from "handlebars";

export const handlebarsReplacements = ({ source, replacements}) => {
    return Handlebars.compile(source)(replacements);
};

export const generateJWT = (payload, options) => {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, options);
};

export const verifyJWT = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET_KEY)
};

export const generateHash = async (text, salts) => {
    return await bcrypt.hash(String(text), salts);
};

export const compareHash = async (text, hash) => {
    return await bcrypt.compare(text, hash);
}