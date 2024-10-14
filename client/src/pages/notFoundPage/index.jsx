import React from 'react'
import notFoundimage from '@/assets/notFoundimage.webp'
import { useNavigate } from 'react-router-dom'
const NotFoundPage = () => {
  const navigate = useNavigate();
  const redirect=()=>{
    navigate('/auth')
  }
  return (
    <div className='h-[100vh] w-[100vw] flex items-center justify-center bg-[#1c1d25]'>
      <div className='p-6 border border-[#5A00EE] rounded-md shadow-lg mb-6 transition-shadow hover:shadow-xl bg-[#2a2b32]'>
      <img src={notFoundimage} width={500} height={250} />
      <div className='font-bold flex items-center justify-center'>
        <button className="bg-[#5A00EE] text-white mt-4 py-2 px-6 rounded-lg shadow-md hover:bg-[#3B0088] transition-colors duration-300" onClick={redirect}>
        Back To the Content 
        </button>
      </div>
      </div>
      </div>
  )
}

export default NotFoundPage