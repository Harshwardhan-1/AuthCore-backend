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
res.cookie("token",token);
return res.status(200).json({
    data:newUser,
    message:"Successfully Login"  
});
    });
});
}