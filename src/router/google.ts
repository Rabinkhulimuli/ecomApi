import express from "express";
import passport from "passport";
import { googleredirect, logout } from "../controller/googleStrategy";

const router = express.Router();

// Route to start Google authentication
router.route("/api/auth/google").get(passport.authenticate('google', { scope: ['profile', 'email'] }));

// Redirect route after successful Google authentication
router.route("/api/auth/google/redirect")
  .get(passport.authenticate('google', { session: false }), googleredirect);

// Logout route
router.route("/auth/logout").get(logout);

export default router;
