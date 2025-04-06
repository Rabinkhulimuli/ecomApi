import { Request, Response } from "express";
import jwt from 'jsonwebtoken'
const jwtsecret= process.env.JWT_SECRET!
export const authenticate= (req:Request,res:Response,next:Function)=> {
    const token= req.cookies.accessToken || req.headers['authorization']?.split(" ")[1];
    if(!token){
        return res.status(401).json({message:'No access token provided'})

    }
    jwt.verify(token,jwtsecret,(err:any,decoded:any)=> {
        if (err)
        {
            return res.status(401).json({message:'invalid or expired token'})

        }
        req.user=decoded
        next()
    })
}