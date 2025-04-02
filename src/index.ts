
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import passport from "passport"
import google from "./router/google"
import user from "./router/user"
import dotenv from "dotenv"
import session from "express-session";
import { googleStrategy } from "./controller/googleStrategy";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";

import prisma from "./database/prisma.client"

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
  saveUninitialized:false,
  store: new PrismaSessionStore(
    prisma as any,{
      checkPeriod:2*60*1000,
        dbRecordIdIsSessionId:true,
        ttl:24*60*60*1000
    }
  )
}))
app.use(passport.initialize())
app.use(passport.session())
googleStrategy()

app.use(google)
app.use(user)
app.listen(PORT,()=> {
  console.log(`server started at ${PORT}`)
})
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    console.log('Prisma client disconnected');
    process.exit(0);
  });

  