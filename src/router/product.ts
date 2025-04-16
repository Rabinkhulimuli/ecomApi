import express from "express"
import { generateAccessToken, verifyUser } from "../controller/adminUser"
import { createCategory, createProduct, getAllCategory, uploadProduct } from "../controller/product"
import multer from "multer"
import { getAllProduct } from "../controller/userProduct"
const upload= multer({storage:multer.memoryStorage()})
const router= express.Router()
router.route("/verifyuser").post(verifyUser)
router.route("/refresh-token").get(generateAccessToken)
router.route("/create-product").post(upload.array("images"),createProduct)
router.route("/create-category").post(createCategory)
router.route("/product/get-all-category").get(getAllCategory)
router.route("/upload-product").post(uploadProduct)
router.route("/product/get-all-product").get(getAllProduct)
export default router