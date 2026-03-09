import React, { useState } from 'react'
import SideBar from './SideBar'
import Header from './Header'

const AppLayout = ({children}) => {
    const [isSidebarOpen,setIsSidebarOpen]=useState(false);
    const toggleSidebar=()=>{
        setIsSidebarOpen(!isSidebarOpen);
    }

  return (

    <div className='min-h-screen w-full flex bg-gray-400'>
       

        <SideBar />
         <div className='bg-gray-100 w-full'>
             <Header />
        {children}

        </div>
       


    </div>
    





    // <div className=''>
    //     <SideBar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}></SideBar>
    //     <div>
    //         <Header toggleSidebar={toggleSidebar}></Header>
    //         <main>
    //             {children}
    //         </main>
    //     </div>
        
    // </div>
  )
}

export default AppLayout