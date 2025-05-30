
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import passport from "passport"
import google from "./router/google"
import user from "./router/user"
import product from "./router/product"
import dotenv from "dotenv"
import session from "express-session";
import { googleStrategy } from "./controller/googleStrategy";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";

import prisma from "./database/prisma.client"
import { PrismaClient } from "@prisma/client"

const PORT = process.env.PORT
const app= express()
app.use(cookieParser())

dotenv.config()
app.use(cors({
  origin:process.env.ORIGIN,
  credentials:true
}))
app.use(session({
  secret:process.env.SESSION_SECRET||"djdjjdsc",
  resave:true,
  saveUninitialized:true,
  store: new PrismaSessionStore(
    new PrismaClient() as any,{
      checkPeriod:2*60*1000,
        dbRecordIdIsSessionId:true,
        ttl:24*60*60*1000,
        dbRecordIdFunction: undefined
    }
  )
}))

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(passport.initialize())
app.use(passport.session())
googleStrategy()

app.use(google)
app.use("/user",user)
app.use("/admin",product)
app.get("/",(req,res)=> {
  res.status(200).send("hello")
  return
})
app.listen(PORT,()=> {
  console.log(`server started at ${PORT}`)
})
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    console.log('Prisma client disconnected');
    process.exit(0);
  });

  