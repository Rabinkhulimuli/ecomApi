"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProduct = void 0;
const prisma_client_1 = __importDefault(require("../database/prisma.client"));
const getAllProduct = async (req, res) => {
    try {
        const { myCursor } = req.query;
        const product = await prisma_client_1.default?.product.findMany({
            take: 10,
            skip: myCursor ? 1 : 0,
            cursor: myCursor ? {
                id: String(myCursor)
            } : undefined,
            orderBy: [{
                    createdAt: 'desc'
                },
                {
                    id: 'asc'
                }
            ],
            include: {
                reviews: true,
                images: true,
                dimension: true
            }
        });
        if (!product) {
            res.status(404).json({ msg: "empty product lists" });
            return;
        }
        res.status(200).json({ data: product, nextCursor: product.length >= 10 ? product[product.length - 1].id : null });
        return;
    }
    catch (err) {
        res.status(400).json({ err: err });
        return;
    }
};
exports.getAllProduct = getAllProduct;
