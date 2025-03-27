"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_client_1 = __importDefault(require("./database/prisma.client"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = __importDefault(require("passport"));
const google_1 = __importDefault(require("./router/google"));
const user_1 = __importDefault(require("./router/user"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_session_1 = __importDefault(require("express-session"));
const googleStrategy_1 = require("./controller/googleStrategy");
const PORT = process.env.PORT;
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
dotenv_1.default.config();
app.use((0, cors_1.default)({
    origin: process.env.ORIGIN,
    credentials: true
}));
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || "djdjjdsc",
    resave: false,
    saveUninitialized: false,
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
(0, googleStrategy_1.googleStrategy)();
app.use(google_1.default);
app.use(user_1.default);
app.listen(PORT, () => {
    console.log(`server started at ${PORT}`);
});
process.on('SIGINT', async () => {
    await prisma_client_1.default.$disconnect();
    console.log('Prisma client disconnected');
    process.exit(0);
});
