import React from 'react'

const PageHeader = ({title,subtitle,children}) => {
    if(!title)return null;
  return (
    <div>
        <div>
            <div>
                <h1 className='font-semibold text-2xl '>{title}</h1>
                {subtitle &&(
                    <p>{subtitle}</p>
                )}
            </div>
            {children &&(
                {children}
            )}
        </div>
    </div>
  )
}

export default PageHeader;