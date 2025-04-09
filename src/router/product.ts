import express from "express"
import { generateAccessToken, verifyUser } from "../controller/adminUser"
import { createCategory, createProduct } from "../controller/product"
import multer from "multer"
const upload= multer({storage:multer.memoryStorage()})
const router= express.Router()
router.route("/verifyuser").post(express.json(),verifyUser)
router.route("/refresh-token").get(express.json(),generateAccessToken)
router.route("/create-product").post(upload.array("images"),createProduct)
router.route("/create-category").post(express.json(),createCategory)

export default router