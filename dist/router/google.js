"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const googleStrategy_1 = require("../controller/googleStrategy");
const router = express_1.default.Router();
// Route to start Google authentication
router.route("/api/auth/google").get(passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
// Redirect route after successful Google authentication
router.route("/api/auth/google/redirect")
    .get(passport_1.default.authenticate('google', { failureRedirect: '/login', session: true }), googleStrategy_1.googleredirect);
router.route("/auth/user").get(googleStrategy_1.initialSession);
// Logout route
router.route("/auth/logout").post(googleStrategy_1.logout);
exports.default = router;
