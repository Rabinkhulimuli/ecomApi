import express from "express"
import { loginUser,createUser } from "../controller/user"

const router=express.Router()
router.route("/loginUser").post(loginUser)
router.route("/createUser").post(createUser)
export default router