import express  , {Request , Response} from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

import verifyToken from "./middleware/verifyToken";
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
import cookieParser from 'cookie-parser';
app.use(cookieParser());
app.use(cors({
  origin:process.env.FRONTEND_URL,
  credentials:true,
})); 
import userRouter from "./Routes/userRoutes";
app.get("/",(req : Request,res:Response)=>{
  res.send("hii harsh here")
})
// MongoDB Atlas connection
mongoose.connect(process.env.MONGO_URL!)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

app.use("/api/all",userRouter);
const PORT=process.env.PORT || 3000;
app.listen(PORT,()=>{
  console.log(`Server is listening to http://localhost:${PORT}`)
})

export default app; 