import { useAppStore } from '@/store'
import React from 'react'

const MainPost = () => {
  const {userInfo} = useAppStore();
  return (
    <div>
      <form className='border-b-1 pb-6'>
        <textarea
        placeholder='post ypur thought'
        className='bg-gray-500 rounded-lg w-full p-2 focus:outline-none focus:ring focus: border-blue-400'
        ></textarea>
        <input 
        type="file"
        id="pictureInput"
        onChange={()=>{}}
        accept="image/*, video/*"
        className="hidden"
      />
        <button
            type="button"
            onClick={()=>{}}
            className="my-2 focus:outline-none"
          ></button>
      </form>
    </div>
  )
}

export default MainPost