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
    <div className='w-30'>SideBar</div>
  )

}
export default SideBar;

