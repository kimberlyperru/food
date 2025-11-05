import express from "express";
const router = express.Router();
import {userLogin,userSignUp,getUser} from "../controller/user.js"


router.post("/signUp",userSignUp)
router.post("/login",userLogin)
router.get("/:id",getUser)

export default router;
