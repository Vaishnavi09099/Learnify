import jwt from "jsonwebtoken";
import User from "../models/User.js";


const generateToken = (id) =>{
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:"7d"});
}



export const register = async (req,res,next)=>{
   try{
    const{username,email,password} = req.body;
    const userExists = await User.findOne({email});
    if(userExists){
        return res.status(400).json({
            success:false,
            message:"User already exist with this email or username"
        });
    }

    const user = await User.create({
        username,
        email,
        password,
    });

    const token = generateToken(user._id);
     console.log("Register body:", req.body);
     console.log("Register API called");

    res.status(200).json({
        success:true,
        data:{
            user:{
                id:user._id,
                username:user.username,
                email:user.email,
                profileImage:user.profileImage,
                createdAt:user.createdAt,
            }
            ,token
        },
        message:"User registered Successfully!"
        
    }
)

   }catch(err){
      console.log("REGISTER ERROR:", err);
    return res.json({
        success:false,
        message:err.message
    })

   }
};

export const login = async (req,res)=>{
    try{
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                success:false,
                error:"Please provide email and password",
            });
        }

        const user = await User.findOne({email}).select("+password");

        if(!user){
            return res.status(401).json({
                success:false,
                message:"Invalid credentials"
            })
        }

        const isMatch = await user.matchPassword(password);

        if(!isMatch){
            return res.status(401).json({
                success:false,
                message:"Invalid credentials",
            })
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success:true,
            user:{
                id:user._id,
                username:user.username,
                email:user.email,
                profileImage:user.profileImage,
            },
            token,
            message:"Login Successful"
        })

    }catch(err){
        console.log(err) 
        return res.status(500).json({
            success:false,
            message:"Server Error"
        })
    }
};

export const getProfile =async (req,res)=>{
    try{
        const user = await User.findById(req.user._id);
        res.status(200).json({
            success:true,
            data:{
                id:user._id,
                username:user.username,
                email:user.email,
                profileImage:user.profileImage,
                createdAt:user.createdAt,
                updatedAt:user.updatedAt
            }
        })

    }catch(err){
        return res.staus(500).json({
            success:false,
            message:"Error is there"
        })

    }
}

export const updateProfile = async (req,res)=>{
    try{
   const{username,email,profileImage} = req.body;

   const user = await User.findById(req.user._id);
   if(username) user.username = username;
   if(email) user.email = email;
    if(profileImage) user.profileImage = profileImage;
    
    await user.save();
    res.status(200).json({
        success:true,
        data:{
            id:user._id,
            username:user.username,
            email:user.email,
            profileImage : user.profileImage,

        },
        message:"Profile Updated successfully",
    })
}catch(err){
    return res.status(500).json({
        success:false,
        message:"Something went wrong!"

    })
}
}
export const changePassword = async (req,res)=>{
    try{
        const{currentPassword,newPassword} = req.body;

        if(!currentPassword || !newPassword){
            return res.status(400).json({
                success:false,
                message:"Please provide current and new password",
            })
        }

        const user = await User.findById(req.user._id).select("+password");
        const isMatch = await user.matchPassword(currentPassword);

        if(!isMatch){
            return res.status(401).json({
                success:false,
                message:"Current passsword is incorrect"
            })
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success:true,
            message:"Password changed successfully"
        })

    }catch(err){
        return res.status(500).json({
            success:false,
            message:"Something went wrong"
        })

    }
    
}
