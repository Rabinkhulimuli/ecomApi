"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategory = exports.createProduct = void 0;
const cloudinary_1 = require("cloudinary");
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
                imageUrl: urlResponse.secure_url
            };
        });
        const uploadedImages = await Promise.all(imageData);
        console.log(await uploadImage);
        /*  const productData = await prisma?.product.create({
          data:{
            name,
            description,
            price:parseFloat(price),
            stock:parseInt(stock),
    
          }
    
         }) */
        res.json({});
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
    try {
        const newCategory = await prisma?.category.create({
            data: {
                name,
            },
        });
        res.status(201).json({ newCategory });
        return;
    }
    catch (err) {
        res.status(400).send(err);
    }
};
exports.createCategory = createCategory;
