import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { Bell, Menu, User } from 'lucide-react'


const Header = ({toggleSideBar}) => {
    const {user} = useAuth();

    return(
        <div className='w-full z-50  bg-white/80 h-16 flex shadow-md backdrop-blur-lg '>
           <button onClick={toggleSideBar}
           className='md:hidden ml-4 z-50'>
           <Menu size={24}/>
           
           </button>
           
            <div className='flex-1 relative flex justify-end items-center p-4'>
                <div className=' p-1 relative '>
                     <Bell className=''  />
                     <span className='absolute top-0 right-0 h-2 w-2 bg-green-500 rounded-xl shadow-2xs'></span>

                </div>
                
                

            </div>

            <div className='flex   border-l-2 border-gray-200/20 shadow- p-4 items-center'>
                <div className='bg-green-500 p-2 ml-4 shadow-md backdrop-blur-2xl rounded-xl text-white'>
                     <User size={19} strokeWidth={3}/>
                </div>

                <div className='flex flex-col ml-3'>
                    <p className='text-sm font-bold tracking-tight '>
  {user?.username || "Test"}
                    </p>
                    <p className='text-xs text-gray-600'>
   {user?.email || "Test@gmail.com"}
                    </p>
                  
                 

                </div>
              


            </div>

        </div>
    )






}

export default Header