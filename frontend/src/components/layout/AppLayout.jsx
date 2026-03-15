import React, { useState } from 'react'
import SideBar from './SideBar'
import Header from './Header'

const AppLayout = ({children}) => {
    const [isSidebarOpen,setIsSidebarOpen]=useState(true);
    const toggleSidebar=()=>{
        setIsSidebarOpen(!isSidebarOpen);
    }

  return (

    <div className='min-h-screen w-full flex bg-gray-400'>
       

        <SideBar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>
         <div className={`bg-gray-100 w-full transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
                <Header toggleSideBar={toggleSidebar}/>
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