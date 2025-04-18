"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = __importDefault(require("passport"));
const google_1 = __importDefault(require("./router/google"));
const user_1 = __importDefault(require("./router/user"));
const product_1 = __importDefault(require("./router/product"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_session_1 = __importDefault(require("express-session"));
const googleStrategy_1 = require("./controller/googleStrategy");
const prisma_session_store_1 = require("@quixo3/prisma-session-store");
const prisma_client_1 = __importDefault(require("./database/prisma.client"));
const client_1 = require("@prisma/client");
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
    resave: true,
    saveUninitialized: true,
    store: new prisma_session_store_1.PrismaSessionStore(new client_1.PrismaClient(), {
        checkPeriod: 2 * 60 * 1000,
        dbRecordIdIsSessionId: true,
        ttl: 24 * 60 * 60 * 1000,
        dbRecordIdFunction: undefined
    })
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
(0, googleStrategy_1.googleStrategy)();
app.use(google_1.default);
app.use("/user", user_1.default);
app.use("/admin", product_1.default);
app.get("/", (req, res) => {
    res.status(200).send("hello");
    return;
});
app.listen(PORT, () => {
    console.log(`server started at ${PORT}`);
});
process.on('SIGINT', async () => {
    await prisma_client_1.default.$disconnect();
    console.log('Prisma client disconnected');
    process.exit(0);
});
