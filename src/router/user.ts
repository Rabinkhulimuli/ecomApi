import express from "express"
import { getUser } from "../controller/user"

const router=express.Router()
router.route("/user").get(getUser)

export default router