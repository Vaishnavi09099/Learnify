import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { Bell, Menu, User } from 'lucide-react'


const Header = ({toggleSideBar}) => {
    const {user} = useAuth();

    return(
        <div className='w-full bg-white/80 h-16 flex shadow-md backdrop-blur-lg '>
            <div className='w-[80%] relative flex justify-end items-center p-4'>
                <div className=' p-1 relative '>
                     <Bell className=''  />
                     <span className='absolute top-0 right-0 h-2 w-2 bg-green-500 rounded-xl shadow-2xs'></span>

                </div>
                
                

            </div>

            <div className='flex   border-l-2 border-gray-200/20 shadow- p-4 items-center'>
                <div className='bg-green-500 p-2 shadow-md backdrop-blur-2xl rounded-xl text-white'>
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





//   return <header className='sticky bg-amber-500 h-16 backdrop-blur-2xl border border-slate-600'>
//     <button onClick={toggleSideBar} className=''>
//     <Menu  size={24}/>

//     </button>

//     <div></div>

//     <div>
//         <button>
//             <Bell size={24}/>
//             <span></span>
//         </button>

//     <div>
//         <div>
//             <div>
//                 <User size={18} strokeWidth={2.5}/>
//             </div>
//         </div>
//         <p>{user?.username||"User"}</p>
//         <p>{user?.email||"user@example.com"}</p>
//     </div>
        
//     </div>

//   </header>
}

export default Header