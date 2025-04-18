"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.createUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_client_1 = __importDefault(require("../database/prisma.client"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcryptjs_1.default.genSaltSync(10);
const createUser = async (req, res) => {
    try {
        const data = req.body;
        let user = await prisma_client_1.default.user.findUnique({
            where: { email: data.email }
        });
        if (user) {
            res.status(409).json({ msg: "user with this email already exist" });
        }
        //add image
        const hashedPassword = bcryptjs_1.default.hashSync(data.password, bcryptSalt);
        const newUser = await prisma_client_1.default.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                image: ""
            }
        });
        const token = jsonwebtoken_1.default.sign({ email: newUser.email, id: newUser.id }, jwtSecret);
        res.status(201).json({ name: newUser.name, email: newUser.email, image: newUser.image, token: token });
        return;
    }
    catch (err) {
        res.status(500).json({ msg: "error crreating user" });
        return;
    }
};
exports.createUser = createUser;
const loginUser = async (req, res) => {
    try {
        const data = await req.body;
        const user = await prisma_client_1.default.user.findUnique({
            where: { email: data.email }
        });
        if (!user) {
            res.status(402).json({ msg: "user not found" });
            return;
        }
        if (bcryptjs_1.default.compareSync(data.password, user.password)) {
            const token = jsonwebtoken_1.default.sign({ email: user.email, id: user.id }, jwtSecret);
            res.status(200).json({ user: { id: user.id, name: user.name, email: user.email, image: user.image }, token: token });
            return;
        }
        res.status(401).json({ msg: "incorrect password" });
        return;
    }
    catch (err) {
        res.status(500).json({ msg: "error creating user" });
        return;
    }
};
exports.loginUser = loginUser;
