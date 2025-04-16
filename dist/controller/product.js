"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProduct = exports.getAllCategory = exports.createCategory = exports.createProduct = void 0;
const cloudinary_1 = require("cloudinary");
const prisma_client_1 = __importDefault(require("../database/prisma.client"));
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});
const uploadImage = async (file) => {
    try {
        const resUrl = await cloudinary_1.v2.uploader.upload(file, {
            resource_type: "auto",
        });
        return resUrl;
    }
    catch (err) {
        console.log(err);
        return undefined;
    }
};
const createProduct = async (req, res) => {
    const { name, description, price, stock, category, discount } = req.body;
    try {
        console.log("body", req.body);
        console.log("image", req.files);
        const images = req.files;
        if (!images || images.length == 0) {
            res.status(500).json({ msg: "image is empty" });
            return;
        }
        const imageData = images.map(async (image) => {
            const b64 = Buffer.from(images[0].buffer).toString("base64");
            const dataUri = "data:" + image.mimetype + ";base64," + b64;
            const urlResponse = await uploadImage(dataUri);
            if (!urlResponse) {
                throw new Error("error image upload failed");
            }
            console.log(urlResponse.public_id);
            return {
                publicId: urlResponse.public_id,
                imageUrl: urlResponse.secure_url,
            };
        });
        const uploadedImages = await Promise.all(imageData);
        const productData = await prisma_client_1.default.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock),
                images: {
                    createMany: {
                        data: uploadedImages.map((img) => ({
                            publicId: img.publicId,
                            path: img.imageUrl,
                        })),
                    },
                },
                category: {
                    connect: { name: category },
                },
                returnPolicy: "",
                discount: 0,
                brand: "",
            },
            include: {
                images: true,
                category: true,
            },
        });
        res.status(201).json(productData);
        return;
    }
    catch (err) {
        res.status(500).json({ msg: "errror creating product", error: err });
        return;
    }
};
exports.createProduct = createProduct;
const createCategory = async (req, res) => {
    const { name } = req.body;
    const newname = name.toLowerCase();
    try {
        const category = await prisma_client_1.default.category.findUnique({
            where: { name: newname },
        });
        if (category) {
            res.status(401).json({ msg: "duplicate category" });
            return;
        }
        const newCategory = await prisma_client_1.default?.category.create({
            data: {
                name: newname,
            },
        });
        res.status(201).json({ newCategory });
        return;
    }
    catch (err) {
        res.status(400).json({ error: err });
    }
};
exports.createCategory = createCategory;
const getAllCategory = async (req, res) => {
    try {
        const data = await prisma_client_1.default.category.findMany();
        if (!data) {
            res.status(400).json({ msg: "category is empty" });
            return;
        }
        res.status(200).json(data);
        return;
    }
    catch (err) {
        res.status(500).json({ msg: err });
        return;
    }
};
exports.getAllCategory = getAllCategory;
const uploadProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category, brand, discount, images, reviews = [], dimensions, returnPolicy, } = req.body;
        const productsData = await prisma_client_1.default.$transaction(async (prisma) => {
            const product = await prisma.product.create({
                data: {
                    name,
                    description,
                    price: parseFloat(price),
                    stock: parseInt(stock),
                    category: {
                        connectOrCreate: {
                            where: { name: category },
                            create: { name: category },
                        },
                    },
                    brand,
                    discount: parseFloat(discount),
                    returnPolicy: returnPolicy || "no return accepted",
                    images: {
                        create: (images || []).map((img) => ({ path: img })),
                    },
                    dimension: {
                        create: {
                            depth: parseFloat(dimensions.depth) || 0,
                            height: parseFloat(dimensions.height) || 0,
                            width: parseFloat(dimensions.width) || 0,
                        },
                    },
                },
            });
            if (reviews.length > 0) {
                await Promise.all(reviews.map(async (review) => {
                    const user = await prisma.user.upsert({
                        where: { email: review.reviewerEmail },
                        update: { name: review.reviewerName },
                        create: {
                            name: review.reviewerName,
                            email: review.reviewerEmail,
                            password: "dummyPassword",
                            image: "",
                        },
                    });
                    await prisma.review.create({
                        data: {
                            rating: parseInt(review.rating),
                            comment: review.comment,
                            product: { connect: { id: product.id } },
                            user: { connect: { id: user.id } },
                        },
                    });
                }));
            }
            return await prisma.product.findUnique({
                where: { id: product.id },
                include: {
                    category: true,
                    images: true,
                    reviews: {
                        include: {
                            user: true,
                        },
                    },
                    dimension: true,
                },
            });
        }, {
            maxWait: 40000,
            timeout: 40000
        });
        res.status(201).json({ productsData });
        return;
    }
    catch (err) {
        res.status(400).json({ err: err });
        return;
    }
};
exports.uploadProduct = uploadProduct;
