import express from "express"
import { generateAccessToken, verifyUser } from "../controller/adminUser"
import { createCategory, createProduct, getAllCategory } from "../controller/product"
import multer from "multer"
const upload= multer({storage:multer.memoryStorage()})
const router= express.Router()
router.route("/verifyuser").post(verifyUser)
router.route("/refresh-token").get(generateAccessToken)
router.route("/create-product").post(upload.array("images"),createProduct)
router.route("/create-category").post(createCategory)
router.route("/get-all-category").get(getAllCategory)
export default router