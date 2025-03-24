import passport from "passport";
import jwt from "jsonwebtoken";
import { Strategy as GoogleStrategy, VerifyCallback } from "passport-google-oauth20";
import dotenv from "dotenv";
import { Request, Response } from "express";
import prisma from "../database/prisma.client";

dotenv.config();

const googleStrategy = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT || "",
        clientSecret: process.env.GOOGLE_SECRET || "",
        callbackURL: process.env.CALLBACK_URL || "http://localhost:3001/api/auth/google/redirect",
      },
      async(accessToken:string,
         refreshToken:string,
          profile:any,
           done:VerifyCallback) => {
        let user = await prisma.user.findUnique({
          where:{email: profile.emails?.[0].value}
        })
        if(!user){
          user = await prisma.user.create({
            data:{
              id: profile.id,
              name:profile.displayName,
              email:profile.emails?.[0].value ||"",
              image:profile.photos?.[0].value ||""
            }
          })
        }
        const token = jwt.sign(
          {
            id: user.id,
            name: user.name,
            email: user.email,
            image:user.image
          },
          process.env.JWT_SECRET || "default_secret",
          { expiresIn: "5m" }
        );

        return done(null, { token });
      }
    )
  );

  // Serialize user into session
  passport.serializeUser((user: any, done: (err:any,id?:string)=> void) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async(id:string, done:(error:any,user?:any)=> void) => {
    const user= await prisma.user.findUnique({
      where: {id}
    })
    done(null, user);
  });
};

const googleredirect = async (req: Request, res: Response, next: Function): Promise<void> => {
  try {
    const user = req.user as { token?: string } | undefined;

    if (!user || !user.token) {
        res.status(401).json({ message: "Authentication failed" });
        return
      }

    // Set the JWT token as a cookie
    res.cookie("jwt", user.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Redirect to the dashboard after setting the cookie
    res.redirect(`${process.env.ORIGIN}?message=successfullyloggedin`);
  } catch (err) {
    next(err);  // Ensure any error is passed to the error handler
  }
};

const logout=(req:Request,res:Response)=> {
  res.clearCookie('jwt')
  res.json({message:"logged out"})
}
export  {googleStrategy,logout,googleredirect};
