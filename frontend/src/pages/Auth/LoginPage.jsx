import React ,{useState} from 'react'
import {Link,useNavigate} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext.jsx';
import authService from '../../services/authService.js';
import toast from 'react-hot-toast'

import {BrainCircuit,Mail,Lock,ArrowRight} from 'lucide-react'

const LoginPage = ()=>{
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(false);
  

  const navigate = useNavigate();
  const {login} = useAuth();

  const handleSubmit = async(e)=>{
    e.preventDefault();
    setError('');
    setLoading(true);
    try{
      const {token,user} = await authService.login(email,password);
      login(user,token);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    }catch(err){
      setError(err.message || "Failed to Login.Please check your credentials!");
      toast.error(err.message || "Failed to login");
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className='bg-gray-100 h-screen flex justify-center items-center flex-col'>
      <div className='bg-white shadow-2xl w-95 p-10 rounded-xl text-center'>
        <div className='text-center  flex items-center justify-center'>
          <div className='bg-green-700 p-3 shadow-xl mb-3 rounded-xl text-white'>
            <BrainCircuit />

          </div>
           </div>
          <h1 className='text-xl font-bold '>Welcome Back</h1>
          <p className='text-sm text-gray-700 mb-8'>Sign in to continue your journey</p>


          <label className=' block text-left text-sm mb-1'>EMAIL</label>
          <div className='flex mb-5 border border-gray-200 focus-within:border-green-400 transition p-2 rounded-xl'>
            <span className='text-gray-500'><Mail /></span>
            <input className='ml-3 outline-none w-full' 
            
            placeholder='Enter your email'
            type='email'
            onChange={(e)=>setEmail(e.target.value)}
            ></input>
          </div>
          <label className='block text-left text-sm mb-1'>PASSWORD</label>
         
          <div className='flex mb-5 border border-gray-200 focus-within:border-green-400 p-2 rounded-xl'>
            <span className='text-gray-500'><Lock /></span>
            <input className='ml-3 outline-none' 
            placeholder='Enter your password'
            
            onChange={(e)=>setPassword(e.target.value)}></input>
          </div>

          {error &&(
            <div className='border border-red-200 items-center flex justify-center p-2  rounded-xl mb-3 bg-red-200/20' >
              <p className='text-red-500 text-xs font-semibold ' >{error}</p>
            </div>
          )}
          
          <div className='flex p-2 rounded-xl hover:bg-green-800 items-center text-white justify-center bg-green-600 '>
            <button className='mr-2 cursor-pointer ' disabled={loading} onClick={handleSubmit}>
              {loading ? (
                <>
                <div>Signing in....</div>
                </>
              ) :(
                <div className='flex justify-center items-center'>Sign In<p className=''><ArrowRight className='w-5 h-4' strokeWidth={3}/></p></div>
              )}
            </button>
            
            
          </div>
          < hr className='my-8 text-gray-200 '/>
          <div className='flex justify-center items-center mt-3' >
            <p className='text-gray-500'>Don't have an account? </p>
          <Link to='/register' className='text-green-600  hover:underline ml-1 font-semibold'>Sign up</Link>
         </div>

        
       

      </div>
       <p className='text-gray-600 text-xs mt-5 '>By continuing, you agree to our Terms & Privacy Policy</p>
          
    </div>
  )

}

export default LoginPage;
