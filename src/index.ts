import prisma from "./database/prisma.client";
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import passport from "passport"
import google from "./router/google"
import dotenv from "dotenv"
import { googleStrategy } from "./controller/googleStrategy";
import session from "express-session";
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
  resave:false,
  saveUninitialized:false
}))
app.use(passport.initialize())
app.use(passport.session())
googleStrategy()

app.use(google)

app.listen(PORT,()=> {
  console.log(`server started at ${PORT}`)
})
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    console.log('Prisma client disconnected');
    process.exit(0);
  });

  