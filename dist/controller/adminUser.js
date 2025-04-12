"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = exports.verifyUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookie_1 = __importDefault(require("cookie"));
const prisma_client_1 = __importDefault(require("../database/prisma.client"));
const jwtSecret = process.env.JWT_SECRET;
const generateTokens = (userId) => {
    const accessToken = jsonwebtoken_1.default.sign({ userId }, jwtSecret, { expiresIn: '15m' });
    const refreshToken = jsonwebtoken_1.default.sign({ userId }, jwtSecret, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
const generateAccessToken = async (req, res) => {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
        res.status(401).json({ message: "no refresh token provided" });
        return;
    }
    jsonwebtoken_1.default.verify(refreshToken, jwtSecret, (err, decoded) => {
        if (err) {
            res.status(401).json({ message: "invalid refresh token" });
            return;
        }
        const { accessToken } = generateTokens(decoded.userId);
        res.json({ token: accessToken });
        return;
    });
};
exports.generateAccessToken = generateAccessToken;
const verifyUser = async (req, res) => {
    const { email, id } = req.body;
    try {
        console.log(email);
        let user = await prisma_client_1.default?.user.findUnique({
            where: { email: email }
        });
        if (!user) {
            user = await prisma_client_1.default?.user.create({
                data: {
                    email: email,
                    id: id,
                    image: "",
                    role: "ADMIN"
                }
            });
        }
        console.log(user);
        if (!user) {
            res.status(401).json({ msg: "error creating user" });
            return;
        }
        const { accessToken, refreshToken } = generateTokens(user.id);
        res.setHeader('set-Cookie', cookie_1.default.serialize('refresh-token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
        }));
        res.json({ token: accessToken });
        return;
    }
    catch (err) {
        res.status(401).json({ message: "invalid credentials" });
        return;
    }
};
exports.verifyUser = verifyUser;
