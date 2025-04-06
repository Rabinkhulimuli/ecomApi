import { Request, Response } from "express";

const createProduct=async(req:Request,res:Response)=> {
    const data= req.body
    try{
        console.log("body",req.body)
        res.send()
        return
    }catch(err){
        res.status(500).send("errror creating product")
    }
}
export {
    createProduct
}