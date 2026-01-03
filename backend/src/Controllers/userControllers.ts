import {Request,response,Response} from 'express';
import { Resend } from 'resend';
import {userModel} from '../models/userModel';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
const resend = new Resend(process.env.RESEND_API_KEY);
export const getAll=async(req:Request,res:Response)=>{
    const allUser=await userModel.find();
    return res.status(200).json({
        allUser
    });
}
export const getSignUp=async(req:Request,res:Response)=>{
const {name,gmail,password}=req.body;
if(!name || !gmail || !password){
    return res.status(401).json({
        message:"Enter proper detail"
    }); 
}
const check=await userModel.findOne({gmail});
if(check){
    return res.status(401).json({
        message:"Something went wrong"
    })
}

bcrypt.genSalt(12, function(err, salt) {
    bcrypt.hash(password, salt,async function(err, hash) {
        const newUser=await userModel.create({
    name,
    gmail,
    password:hash,
});
let token=jwt.sign({gmail:gmail,userId:newUser._id},process.env.JWT_SECRET!);
res.cookie("token",token,{
    httpOnly:true,
    secure:true,
    sameSite:"none",
});
return res.status(200).json({
    data:newUser,
    message:"Successfully Login"  
});
    });
});
}


export const getSignIn=async(req:Request,res:Response)=>{
    const {gmail,password}=req.body;
    const checkUser=await userModel.findOne({gmail})
    if(!checkUser){
        return res.status(401).json({
            message:"Something went Wrong"
        });
    }
    if(!checkUser.password){
        return res.status(401).json({
            message:"Something went wrong",
        });
    }
  bcrypt.compare(password, checkUser.password, function(err, result) {
    if(!result){
        return res.status(401).json({
            message:"Password is incorrect",
        });
    }
    let token=jwt.sign({gmail:gmail,userId:checkUser._id},process.env.JWT_SECRET!);
    res.cookie("token",token,{
        httpOnly:true,
        secure:true,
        sameSite:"none",
        maxAge:7*24*60*60*1000,
    });
    return res.status(200).json({
        data:{
            _id:checkUser._id,
            name:checkUser.name,
            gmail:checkUser.gmail,
        },
        message:"Login Successfully",
    });
});
}




export const forgotPassword=async(req:Request,res:Response)=>{
const {gmail}=req.body;
const checkUser=await userModel.findOne({gmail});
if(!checkUser){
    return res.status(401).json({
        message:"Please do a signUp first",
    });
}
const randomNumber=Math.floor(100000+Math.random()*900000);
checkUser.otp=randomNumber;
checkUser.otpExpire=Date.now()+(2*60*1000);
await checkUser.save();

    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: gmail,
      subject: "OTP for Password Reset",
      text: `Hello ${checkUser.name},
Your OTP for resetting password is: ${randomNumber}

This OTP will expire in 2 minutes.

Regards,
AuthCore Team`,
    });
return res.status(200).json({
    message:"otp send successfully",
    data:{
        name:checkUser.name,
        gmail:checkUser.gmail,
    },
});
}





export const otpVerify=async(req:Request,res:Response)=>{
    const {otp}=req.body;
    if(!otp){
        return res.status(401).json({
            message:"Enter otp correctly",
        })
    }
    const currentUser=(req as any).user.gmail;
    const checkUser=await userModel.findOne({gmail:currentUser});
    if(!checkUser){
        return res.status(401).json({
            message:"user not found",
        });
    }
    if(!checkUser.otp){
        return res.status(401).json({
            messsage:"user has not otp"
        });
    }
    if(!checkUser.otpExpire){
        return res.status(401).json({
            message:"user has not yet click forgot password"
        });
    }
    if(checkUser.otpExpire<Date.now()){
        return res.status(401).json({
            message:"please enter correct otp"
        });
    }
    if(Number(checkUser.otp)!==Number(otp)){
        return res.status(401).json({
            message:"incorrect otp",
        });
    }
    checkUser.otp=null;
    checkUser.otpExpire=null;
    await checkUser.save();
        return res.status(200).json({
            message:"User enter correct otp",
            data:checkUser,
        });
}



export const changePassword=async(req:Request,res:Response)=>{
    const {password,confirmPassword}=req.body;
    if(!password || !confirmPassword){
        return res.status(401).json({
            message:"enter detail properly",
        });
    }
    if(password!==confirmPassword){
        return res.status(401).json({
            message:"fill your detail properly",
        });
    }
    const currentUser=(req as any).user.gmail;
    const checkUser=await userModel.findOne({gmail:currentUser});
    if(!checkUser){
        return res.status(401).json({
            message:"user not found"
        });
    }
    if(!checkUser.password){
        return res.status(401).json({
            message:"do a signUp first",
        });
    }
    const salt=bcrypt.genSaltSync(12);
    const changePassword=bcrypt.hashSync(password, salt);
    checkUser.password=changePassword;
    await checkUser.save();
    return res.status(200).json({
        message:"change successfull",
        data:{
            name:checkUser.name,
            gmail:checkUser.gmail,
        }
    });
}