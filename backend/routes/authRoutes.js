import express from "express";
import {register,login,getProfile,updateProfile,changePassword} from "../controllers/authController.js"
import  protect  from "../middleware/auth.js"; 

const router = express.Router();

router.post("/register",register);

router.post("/login",login);

router.get("/profile",protect ,getProfile);

router.put("/profile",updateProfile);

router.post("/change-password", protect, changePassword)

export default router;