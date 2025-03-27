"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_client_1 = __importDefault(require("../database/prisma.client"));
const getUser = async (req, res) => {
    try {
        const secretToken = process.env.JWT_SECRET;
        const token = req.cookies.jwt;
        console.log("token", token);
        if (!token) {
            res.status(401).json({ message: "unauthorize access" });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, secretToken);
        const user = await prisma_client_1.default.user.findUnique({
            where: { id: decoded.id }
        });
        if (!user) {
            res.status(404).json({ message: "user not found" });
            return;
        }
        res.status(200).json({ data: user });
    }
    catch (err) {
        res.status(401).json({ message: "invalid token" });
    }
};
exports.getUser = getUser;
