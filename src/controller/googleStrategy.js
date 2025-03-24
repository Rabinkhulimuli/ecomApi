"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    }, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        let user = yield prisma_client_1.default.user.findUnique({
            where: { email: (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value }
        });
        if (!user) {
            user = yield prisma_client_1.default.user.create({
                data: {
                    id: profile.id,
                    name: profile.displayName,
                    email: ((_b = profile.emails) === null || _b === void 0 ? void 0 : _b[0].value) || "",
                    image: ((_c = profile.photos) === null || _c === void 0 ? void 0 : _c[0].value) || ""
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
    })));
    // Serialize user into session
    passport_1.default.serializeUser((user, done) => {
        done(null, user.id);
    });
    // Deserialize user from session
    passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield prisma_client_1.default.user.findUnique({
            where: { id }
        });
        done(null, user);
    }));
};
exports.googleStrategy = googleStrategy;
const googleredirect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.googleredirect = googleredirect;
const logout = (req, res) => {
    res.clearCookie('jwt');
    res.json({ message: "logged out" });
};
exports.logout = logout;
