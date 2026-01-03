import {Router} from 'express';
const userRouter=Router();
import { getSignUp,getAll,getSignIn,forgotPassword } from '../Controllers/userControllers';
import verifyToken from '../middleware/verifyToken';

userRouter.get("/allUser",getAll);
userRouter.post("/getSignUp",getSignUp);
userRouter.post("/getSignIn",getSignIn);
userRouter.post("/forgotPassword",verifyToken,forgotPassword);

export default userRouter;