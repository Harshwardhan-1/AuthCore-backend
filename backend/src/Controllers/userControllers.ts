import {Request,Response} from 'express';
import {userModel} from '../models/userModel';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
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
        sameSite:"none"
    });
    return res.status(200).json({
        data:checkUser,
        message:"Login Successfully",
    });
});
}