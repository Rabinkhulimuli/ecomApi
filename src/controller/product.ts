import { Request, Response } from "express";
import { v2 as cloudanary } from "cloudinary";
import prisma from "../database/prisma.client";
cloudanary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
type cloudinaryResType = {
  secure_url: string;
  public_id: string;
};
const uploadImage = async (
  file: string
): Promise<cloudinaryResType | undefined> => {
  try {
    const resUrl = await cloudanary.uploader.upload(file, {
      resource_type: "auto",
    });
    return resUrl;
  } catch (err) {
    console.log(err);
    return undefined;
  }
};
const createProduct = async (req: Request, res: Response) => {
  const { name, description, price, stock, category, discount } = req.body;

  try {
    console.log("body", req.body);
    console.log("image", req.files);
    const images = req.files as Express.Multer.File[] | undefined;
    if (!images || images.length == 0) {
      res.status(500).json({ msg: "image is empty" });
      return;
    }
    
    const imageData= images.map(async(image)=> {
        const b64=Buffer.from(images[0].buffer).toString("base64")
        const dataUri="data:"+image.mimetype+ ";base64,"+b64;
        const urlResponse= await uploadImage(dataUri)
        if(!urlResponse){
            throw new Error("error image upload failed")
        }
        console.log(urlResponse.public_id)
        return {
            publicId:urlResponse.public_id,
            imageUrl:urlResponse.secure_url
        }
    })
    const uploadedImages= await Promise.all(imageData)
   const productData= await prisma.product.create({
    data:{
        name,
        description,
        price:parseFloat(price),
        stock:parseInt(stock),
        images:{
            createMany:{
                data:uploadedImages.map((img)=> ({
                    publicId:img.publicId,
                    path:img.imageUrl
                }))
            }
        },
        category:{
            connect:{name:category}
        }
    },
    include:{
        images:true,
        category:true
    }
   })
    res.status(201).json(productData)
    return;
  } catch (err) {
    res.status(500).json({ msg: "errror creating product", error: err });
    return;
  }
};

const createCategory = async (req: Request, res: Response) => {
  const { name } = req.body;
  const newname= name.toLowerCase()
  try {
    const category= await prisma.category.findUnique({
        where:{name:newname}
    })
    if(category){
        res.status(401).json({msg:"duplicate category"})
        return
    }
    const newCategory = await prisma?.category.create({
      data: {
        name:newname,
      },
    });
    res.status(201).json({ newCategory });
    return;
  } catch (err) {
    res.status(400).json({error:err});
  }
};
const getAllCategory=async(req:Request,res:Response)=> {
    try{
        const data = await prisma.category.findMany()
        if(!data){
            res.status(400).json({msg:"category is empty"})
            return
        }
        res.status(200).json({data})
        return
    }catch(err){
        res.status(500).json({msg:err})
        return
    }
}
export { createProduct, createCategory,getAllCategory };
