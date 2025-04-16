"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminUser_1 = require("../controller/adminUser");
const product_1 = require("../controller/product");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const router = express_1.default.Router();
router.route("/verifyuser").post(adminUser_1.verifyUser);
router.route("/refresh-token").get(adminUser_1.generateAccessToken);
router.route("/create-product").post(upload.array("images"), product_1.createProduct);
router.route("/create-category").post(product_1.createCategory);
router.route("/get-all-category").get(product_1.getAllCategory);
router.route("/upload-product").post(product_1.uploadProduct);
exports.default = router;
