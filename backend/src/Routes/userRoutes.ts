import {Router} from 'express';
const userRouter=Router();
import { getSignUp,getAll } from '../Controllers/userControllers';

userRouter.get("/allUser",getAll);
userRouter.post("/getSignUp",getSignUp);

export default userRouter;