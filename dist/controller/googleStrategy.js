import passport from "passport";
import jwt from "jsonwebtoken";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import prisma from "../database/prisma.client";
dotenv.config();
const googleStrategy = () => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT || "", // Typo fixed (GOOGLE_CLIENT)
        clientSecret: process.env.GOOGLE_SECRET || "",
        callbackURL: process.env.CALLBACK_URL,
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await prisma.user.findUnique({
                where: { email: profile.emails?.[0].value }
            });
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        id: profile.id,
                        name: profile.displayName,
                        email: profile.emails?.[0].value || "",
                        image: profile.photos?.[0].value || "",
                        password: ""
                    }
                });
            }
            const token = jwt.sign({
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
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
    passport.serializeUser((user, done) => {
        done(null, user.id); // Only store the ID
    });
    // Deserialize user from session
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await prisma.user.findUnique({
                where: { id }
            });
            done(null, user);
        }
        catch (err) {
            done(err);
        }
    });
};
const googleredirect = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user?.token) {
            res.status(401).json({ message: "Authentication failed" });
            return;
        }
        res.cookie("jwt", user.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
            domain: process.env.COOKIE_DOMAIN
        });
        res.redirect(`${process.env.ORIGIN}/account/myaccount?msg=loggedinSuccessfully`);
    }
    catch (err) {
        next(err);
    }
};
const initialSession = async (req, res) => {
    if (req.isAuthenticated()) {
        const { token, ...user } = req.user;
        res.json({ user: user, token: token });
    }
    else {
        res.status(401).json({ error: "unauthorized" });
    }
};
const logout = (req, res) => {
    try {
        res.clearCookie('jwt', {
            path: "/",
            domain: process.env.COOKIE_DOMAIN
        });
        req.logout(() => {
            res.json({ message: "logged out" });
            return;
        });
    }
    catch (err) {
        res.status(500).send();
        return;
    }
};
export { googleStrategy, logout, googleredirect, initialSession };
