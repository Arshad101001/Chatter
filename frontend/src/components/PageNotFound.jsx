import React from 'react'

function PageNotFound() {
    return (
        <div className='flex h-screen justify-center items-center space-x-2 flex-col '>
            <span className='text-2xl'>404</span>
            <br />
            <div className='text-xl font-semibold text-red-700'>Page not found</div>
        </div>
    )
}

export default PageNotFound