import {Router} from 'express';
const userRouter=Router();
import { getSignUp,getAll,getSignIn } from '../Controllers/userControllers';

userRouter.get("/allUser",getAll);
userRouter.post("/getSignUp",getSignUp);
userRouter.post("/getSignIn",getSignIn);

export default userRouter;