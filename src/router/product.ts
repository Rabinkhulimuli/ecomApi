import express from "express"
import { generateAccessToken, verifyUser } from "../controller/adminUser"
import { createProduct } from "../controller/product"
const router= express.Router()
router.route("/verifyuser").post(verifyUser)
router.route("/refresh-token").get(generateAccessToken)
router.route("/create-product").post(createProduct)
export default router