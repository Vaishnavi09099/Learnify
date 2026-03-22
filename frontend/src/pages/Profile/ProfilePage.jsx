import React, { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import Header from '../../components/layout/Header'
import PageHeader from '../../components/common/PageHeader'
import authServices from '../../services/authService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Mail, User,Lock } from 'lucide-react'
import authService from '../../services/authService'
import { ClipLoader } from 'react-spinners'
import SideBar from '../../components/layout/SideBar'


const ProfilePage = () => {
 const [loading, setLoading] = useState(true);
const [passwordLoading, setPasswordLoading] = useState(false);
const [username, setUsername] = useState("");
const [email, setEmail] = useState("");
const [currentPassword, setCurrentPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmNewPassword, setConfirmNewPassword] = useState("");

useEffect(()=>{
  const fetchProfile = async ()=>{
  try{
    const data = await authService.getProfile();
    setUsername(data.data.username);
    setEmail(data.data.email);
  }catch(err){
    toast.error("Failed to fetch profile data");
    console.log(err);
  }finally{
    setLoading(false);
  }
};
fetchProfile();

},[]);

const handleChangePassword = async(e)=>{
  e.preventDefault();
  if(newPassword!==confirmNewPassword){
    toast.error("New password do not match.");
     return;
  }
  if(newPassword.length <6){
    toast.error("New password must be atleast 6 characters long.");
    return;
  }
   setPasswordLoading(false);

   try {
    await authService.changePassword({ currentPassword, newPassword });
    toast.success("Password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
} catch (error) {
    toast.error(error.message || "Failed to change password.");
} finally {
    setPasswordLoading(false);
}
};

  if(loading){
      return <ClipLoader color="#00d492" size={24} />;
      
    }

  return (
    <>

    <AppLayout>
            <div className='p-5 '>
         <PageHeader title="Profile Settings" />

     
      </div>

      <div className='border-gray-300/50 border bg-white m-4 shadow-md  rounded-xl p-4'>
        <p className='font-bold text-xl mb-3'>User Information</p>
        <label className='font-semibold  text-gray-600'>
            Username
          </label>
        <div className='flex rounded-md  p-2 border border-gray-300 shadow-sm text-gray-600/50 items-center mt-2  mb-4 gap-3 bg-gray-100/30 border'>
          <User size={20}/>
          <p className='font-bold text-gray-600'>{username}</p>
         </div>
         <label className='font-semibold text-gray-600'>
            Email Address
          </label>

        <div className='flex rounded-md  p-2 border border-gray-300 shadow-sm text-gray-600/50 items-center mt-2 mb-2 gap-3 bg-gray-100/30 border'>
          <Mail size={20}/>
          <p className='font-bold text-gray-600'>{email}</p>
         </div>
      </div>

 <form onSubmit={handleChangePassword}>
   <div className='border-gray-300/50 border bg-white m-4 shadow-md  rounded-xl p-4'>
        <p className='font-bold text-xl mb-3'>Change Password</p>
        <label className='font-semibold  text-gray-600'>
           Current Password
          </label>
        <div className='flex rounded-md  p-2 border border-gray-300 shadow-sm text-gray-600/50 items-center mt-2  mb-4 gap-3 bg-gray-100/30 border'>
          <Lock size={20}/>
          <input type='password' value={currentPassword}
              onChange={(e)=>setCurrentPassword(e.target.value)}
              required className=' w-full outline-none '>
                
              </input> 
              
               </div>


         <label className='font-semibold text-gray-600'>
           New Password
          </label>

        <div className='flex rounded-md  p-2 border border-gray-300 shadow-sm text-gray-600/50 items-center mt-2 mb-4 gap-3 bg-gray-100/30 border'>
          <Lock size={20}/>
         <input
            type='password'
            value={newPassword}
            onChange={(e)=>setNewPassword(e.target.value)}
           required
           className=' w-full outline-none  '
           >
            </input> </div>
         <label className='font-semibold text-gray-600'>
           Confirm New Password
          </label>


        <div className='flex rounded-md  p-2 border border-gray-300 shadow-sm text-gray-600/50 items-center mt-2 mb-2 gap-3 bg-gray-100/30 border'>
          <Lock size={20}/>
          <input type='password' value={confirmNewPassword} onChange={(e)=>setConfirmNewPassword(e.target.value)}
              required className=' w-full outline-none '>
              </input>  </div>
     
     <div className='flex justify-end p-2 '>
       <button className='p-2 border-green-600 border rounded-xl px-4 shadow-md bg-green-600/80 text-white font-bold' type='submit' disabled={passwordLoading}>
              {passwordLoading ? "Changing...." : "Change Password"}

            </button>
      
     </div>
     
      </div>
      



 </form>

    </AppLayout>
     

 
     


     


       
    
    </>
        
    

  )
}

export default ProfilePage