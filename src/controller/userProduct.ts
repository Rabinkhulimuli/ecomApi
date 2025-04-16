import { Request, Response } from "express"
import prisma from "../database/prisma.client"
import { URLSearchParams } from "url"
const getAllProduct =async(req:Request,res:Response)=> {
    try{
        const {myCursor}=req.query
        const product= await prisma?.product.findMany({
            take:10,
            skip:myCursor?1:0,
            cursor:myCursor?{
                id:String(myCursor) 
            }:undefined,
            orderBy:[{
                createdAt:'desc'
            },
            {
                id:'asc'
            }
        ],
        include:{
            dimension:true,
            reviews:true,
            images:true,
        }
        })
        if(!product){
            res.status(404).json({msg:"empty product lists"})
            return
        }
        res.status(200).json({data:product,nextCursor:product.length >=10?product[product.length-1].id:null})
        return
    }catch(err){
        res.status(400).json({err:err})
        return
    }
}
export  {
    getAllProduct
}