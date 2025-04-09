import { Request, Response } from "express";
import {v2 as cloudanary} from 'cloudinary'

cloudanary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET
})
 const uploadImage=async (file:string)=> {
    const resUrl= await cloudanary.uploader
    .upload(
        file,{
            resource_type:"auto"
        }
    )
    
    .catch((error:Error)=> {console.log(error)})
    return resUrl
} 
const createProduct=async(req:Request,res:Response)=> {
   
    const {name,description,price,stock,category,discount}= req.body

    try{
        console.log("body",req.body)
      console.log("image",req.files)
      const images = req.files as Express.Multer.File[] | undefined
      if(!images || images.length ==0) {
        res.status(500).json({msg:"image is empty"})
        return
      }
      const singleImage=images[0]
    
     const b64= Buffer.from(images[0].buffer).toString("base64")
     const dataUri="data:"+singleImage.mimetype+";base64,"+b64;
     const urlResponse= await uploadImage(dataUri)
     const imageData= images.forEach((image)=> {
        
     })
     const productData = await prisma?.product.create({
      data:{
        name,
        description,
        price:parseFloat(price),
        stock:parseInt(stock),

      }

     })
     console.log(urlResponse)
        res.json({url:urlResponse})
        return
    }catch(err){
        res.status(500).json({msg:"errror creating product",error:err})
        return
    }
}

const createCategory= async(req:Request,res:Response)=> {
    const {name} = req.body
    try{
        const newCategory= await prisma?.category.create({
            data:{
                name
            }
        })
        res.status(201).json({newCategory})
        return
    }catch(err){
        res.status(400).send(err)
    }
}
export {
    createProduct,
    createCategory
}