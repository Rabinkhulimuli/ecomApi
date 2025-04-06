import { Request, Response } from "express"
import jwt from "jsonwebtoken"
import cookie from "cookie"
import prisma from "../database/prisma.client"
const jwtSecret= process.env.JWT_SECRET!
const generateTokens=(userId:string)=> {
    const accessToken= jwt.sign({userId},jwtSecret,{expiresIn:'15m'})
    const refreshToken= jwt.sign({userId},jwtSecret,{expiresIn:'7d'})
    return {accessToken,refreshToken}
}
const generateAccessToken=async(req:Request,res:Response)=> {
    const refreshToken= req.cookies.refresh_token;
    if(!refreshToken){
        res.status(401).json({message:"no refresh token provided"})
        return
    }
    jwt.verify(refreshToken,jwtSecret,(err:any,decoded:any)=> {
        if(err){
            res.status(401).json({message:"invalid refresh token"})
            return
        }
        const {accessToken}= generateTokens(decoded.userId)
        res.json({token:accessToken})
        return
    })
}
const verifyUser= async (req:Request,res:Response)=> {
    const {email,id}=  req.body
    try{
        console.log(email)
        let user = await prisma?.user.findUnique({
            where:{email:email}
        })
        if (!user) {
            user= await prisma?.user.create({
                data:{
                    email:email,
                    id:id,
                    image:"",
                    role:"ADMIN"

                }
            })
        }
        console.log(user)
        if(!user){
            res.status(401).json({msg:"error creating user"})
            return
        }
        const{accessToken,refreshToken}= generateTokens(user.id)
        res.setHeader('set-Cookie',cookie.serialize('refresh-token',refreshToken,{
            httpOnly:true,
            secure:process.env.NODE_ENV ==='production',
            sameSite:'lax',
            maxAge:7*24*60*60,
        }))
        res.json({token:accessToken})
        return
    }
    catch(err){

        res.status(401).json({message:"invalid credentials"})
        return
    }
}
export {
    verifyUser,
    generateAccessToken
}