import jwt from "jsonwebtoken";
import prisma from "../database/prisma.client";
import bcrypt from "bcryptjs";
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);
const createUser = async (req, res) => {
    try {
        const data = req.body;
        let user = await prisma.user.findUnique({
            where: { email: data.email }
        });
        if (user) {
            res.status(409).json({ msg: "user with this email already exist" });
        }
        //add image
        const hashedPassword = bcrypt.hashSync(data.password, bcryptSalt);
        const newUser = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                image: ""
            }
        });
        const token = jwt.sign({ email: newUser.email, id: newUser.id }, jwtSecret);
        res.status(201).json({ name: newUser.name, email: newUser.email, image: newUser.image, token: token });
        return;
    }
    catch (err) {
        res.status(500).json({ msg: "error crreating user" });
        return;
    }
};
const loginUser = async (req, res) => {
    try {
        const data = await req.body;
        const user = await prisma.user.findUnique({
            where: { email: data.email }
        });
        if (!user) {
            res.status(402).json({ msg: "user not found" });
            return;
        }
        if (bcrypt.compareSync(data.password, user.password)) {
            const token = jwt.sign({ email: user.email, id: user.id }, jwtSecret);
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
export { createUser, loginUser };
