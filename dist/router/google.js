import express from "express";
import passport from "passport";
import { googleredirect, initialSession, logout } from "../controller/googleStrategy";
const router = express.Router();
// Route to start Google authentication
router.route("/api/auth/google").get(passport.authenticate('google', { scope: ['profile', 'email'] }));
// Redirect route after successful Google authentication
router.route("/api/auth/google/redirect")
    .get(passport.authenticate('google', { failureRedirect: '/login', session: true }), googleredirect);
router.route("/auth/user").get(initialSession);
// Logout route
router.route("/auth/logout").post(logout);
export default router;
