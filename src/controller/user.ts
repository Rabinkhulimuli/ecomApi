import { Request, Response } from "express"
import jwt, { JwtPayload } from "jsonwebtoken"
import prisma from "../database/prisma.client"
const getUser= async (req:Request,res:Response)=> {
    try{
        const secretToken=process.env.JWT_SECRET as string
        const token = req.cookies.jwt
        console.log("token",token)
        if (!token){
             res.status(401).json({message:"unauthorize access"})
             return
        }
        const decoded= jwt.verify(token,secretToken) as JwtPayload
        const user=await prisma.user.findUnique({
            where:{id: decoded.id }
        })
        if (!user) {
            res.status(404).json({message:"user not found"})
            return
        }
        res.status(200).json({data:user})
    }catch(err){
        res.status(401).json({message:"invalid token"})
    }
}
export {
    getUser
}