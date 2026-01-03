import jwt from 'jsonwebtoken';
import {Request,Response,NextFunction} from 'express';
const verifyToken=(req:Request,res:Response,next:NextFunction)=>{
let token=req.cookies?.token;
if(!token){
    return res.status(401).json({
        message:"do a signUp first",
    });
}
const data=jwt.verify(token,process.env.JWT_SECRET!);
(req as any).user=data;
next();
}

export default verifyToken;