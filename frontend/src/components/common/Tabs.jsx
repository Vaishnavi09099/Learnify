import React from 'react'

const Tabs = ({tabs,activeTab,setActiveTab}) => {
  
    const activeContent = tabs.find(tab=>tab.name===activeTab)?.content;
    return(
        <div>
            <nav className=' flex gap-10 p-5 font-semibold text-gray-800 '>
                {tabs.map((tab)=>{
                    const isActive = activeTab===tab.name;
                    return (
                        <button key={tab.name} onClick={()=>setActiveTab(tab.name)} className={ ` p-2 ${isActive ? 'text-green-600 font-bold border-b-2' : ''}`}>
                            {tab.label}
                            {isActive &&(
                                <span className='h-1 rounded-xl'></span>
                            )}

                        </button>
                    )
                })}
            </nav>
            <div>
                {activeContent}
            </div>
        </div>
    )
}

export default Tabs;