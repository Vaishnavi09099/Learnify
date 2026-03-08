import mongoose from "mongoose";
import bcrypt from "bcryptjs"

export const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:[true,"please provide a username"],
        unique:true,
        trim:true,
        minlength:[3,"Username must be at least 3 characters long"]
    },
    email:{
        type:String,
        required:[true,"Please provide a valid email"],
        unique:true,
        lowercase:true,
    },
    password:{
        type:String,
        required:[true,'Please provide a password'],
            minlength:[6,"Password must be atleast 6 characters long"],
            select:false
            
        
    },
    profileImage:{
        type:String,
        default:null
    }

},{
    timestamps:true
})


userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
      return ;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
  
})

userSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);


}

const User = mongoose.model('User',userSchema);

export default User;