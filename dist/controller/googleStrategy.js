"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialSession = exports.googleredirect = exports.logout = exports.googleStrategy = void 0;
const passport_1 = __importDefault(require("passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_client_1 = __importDefault(require("../database/prisma.client"));
dotenv_1.default.config();
const googleStrategy = () => {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: process.env.GOOGLE_CLIENT || "", // Typo fixed (GOOGLE_CLIENT)
        clientSecret: process.env.GOOGLE_SECRET || "",
        callbackURL: process.env.CALLBACK_URL,
    }, async (accessToken, refreshToken, profile, done) => {
        try {
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
            }, process.env.JWT_SECRET || "default_secret", { expiresIn: "10m" });
            // Return both token and user ID for serialization
            return done(null, {
                token,
                id: user.id // Important for serialization
            });
        }
        catch (err) {
            return done(err);
        }
    }));
    // Serialize user into session
    passport_1.default.serializeUser((user, done) => {
        done(null, user.id); // Only store the ID
    });
    // Deserialize user from session
    passport_1.default.deserializeUser(async (id, done) => {
        try {
            const user = await prisma_client_1.default.user.findUnique({
                where: { id }
            });
            done(null, user);
        }
        catch (err) {
            done(err);
        }
    });
};
exports.googleStrategy = googleStrategy;
const googleredirect = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user?.token) {
            res.status(401).json({ message: "Authentication failed" });
            return;
        }
        // Set the JWT token as a cookie
        res.cookie("jwt", user.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development", // Fixed typo "developement"
            sameSite: "lax", // Changed from "strict" for better compatibility
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/", // Explicit path
            domain: process.env.COOKIE_DOMAIN // Optional for cross-subdomain
        });
        res.redirect(`${process.env.ORIGIN}/account/myaccount?msg=loggedinSuccessfully`);
    }
    catch (err) {
        next(err);
    }
};
exports.googleredirect = googleredirect;
const initialSession = async (req, res) => {
    if (req.isAuthenticated()) {
        // Return minimal user info to frontend
        const { token, ...user } = req.user;
        res.json({ user: user, token: token });
    }
    else {
        res.status(401).json({ error: "unauthorized" });
    }
};
exports.initialSession = initialSession;
const logout = (req, res) => {
    res.clearCookie('jwt', {
        path: "/",
        domain: process.env.COOKIE_DOMAIN
    });
    req.logout(() => {
        res.json({ message: "logged out" });
    });
};
exports.logout = logout;
