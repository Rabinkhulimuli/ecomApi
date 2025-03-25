"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleredirect = exports.logout = exports.googleStrategy = void 0;
const passport_1 = __importDefault(require("passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_client_1 = __importDefault(require("../database/prisma.client"));
dotenv_1.default.config();
const googleStrategy = () => {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: process.env.GOOGLE_CLIENT || "",
        clientSecret: process.env.GOOGLE_SECRET || "",
        callbackURL: process.env.CALLBACK_URL || "http://localhost:3001/api/auth/google/redirect",
    }, async (accessToken, refreshToken, profile, done) => {
        let user = await prisma_client_1.default.user.findUnique({
            where: { email: profile.emails?.[0].value }
        });
        if (!user) {
            user = await prisma_client_1.default.user.create({
                data: {
                    id: profile.id,
                    name: profile.displayName,
                    email: profile.emails?.[0].value || "",
                    image: profile.photos?.[0].value || ""
                }
            });
        }
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image
        }, process.env.JWT_SECRET || "default_secret", { expiresIn: "5m" });
        return done(null, { token });
    }));
    // Serialize user into session
    passport_1.default.serializeUser((user, done) => {
        done(null, user.id);
    });
    // Deserialize user from session
    passport_1.default.deserializeUser(async (id, done) => {
        const user = await prisma_client_1.default.user.findUnique({
            where: { id }
        });
        done(null, user);
    });
};
exports.googleStrategy = googleStrategy;
const googleredirect = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user || !user.token) {
            res.status(401).json({ message: "Authentication failed" });
            return;
        }
        // Set the JWT token as a cookie
        res.cookie("jwt", user.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        // Redirect to the dashboard after setting the cookie
        res.redirect(`${process.env.ORIGIN}?message=successfullyloggedin`);
    }
    catch (err) {
        next(err); // Ensure any error is passed to the error handler
    }
};
exports.googleredirect = googleredirect;
const logout = (req, res) => {
    res.clearCookie('jwt');
    res.json({ message: "logged out" });
};
exports.logout = logout;
