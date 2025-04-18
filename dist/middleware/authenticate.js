"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwtsecret = process.env.JWT_SECRET;
const authenticate = (req, res, next) => {
    const token = req.cookies.accessToken || req.headers['authorization']?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: 'No access token provided' });
    }
    jsonwebtoken_1.default.verify(token, jwtsecret, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'invalid or expired token' });
        }
        req.user = decoded;
        next();
    });
};
exports.authenticate = authenticate;
