import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { BookOpen, BrainCircuit, FileText, LayoutDashboard, LogOut, User, X } from 'lucide-react'

const SideBar = ({isSidebarOpen,toggleSidebar}) => {
    const {logout} = useAuth();
    const navigate = useNavigate();

    const handleLogout =()=>{
        logout();
        navigate("/login");
    }

    const navLinks = [
        {to:'/dashboard',icon:LayoutDashboard,text:'Dashboard'},
        {to:'/documents',icon:FileText,text:'Documents'},
        {to:'/flashcards',icon:BookOpen,text:'Flashcards'},
        {to:'/profile',icon:User,text:'Profile'},
        
    ]
    
  return (
    <div className={`fixed top-0 z-30 left-0 h-full w-64 bg-white shadow-lg transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
     
    
       <div className=' flex p-3 items-center'>
        <div className='bg-green-500 p-2 rounded-xl text-white shadow-md'>
           <BrainCircuit  />
       

        </div>
        <p className='ml-2 font-bold'>AI Learning Assistant</p>

      </div>
   

      <div className=' mt-2'>
        {navLinks.map((link)=>(
          
          <NavLink  to={link.to} className="flex px-5 mx-4 py-2 items-center hover:bg-green-500 hover:rounded-lg  gap-3 hover:shadow-md hover:text-white font-semibold" >

            <link.icon size={18} strokeWidth={2.5} />
            {link.text }

          </NavLink>
        ))}

      </div>


      <div className='flex items-center absolute bottom-6 px-8'>
        <LogOut size={18} strokeWidth={2.5}/>
        <p className='ml-2 font-semibold '>Logout</p>
      </div>

     </div>
     

      
     
   
  )

}
export default SideBar;

