import React from 'react'
import { MdClose } from 'react-icons/md';

function ShowFullImage({Img,close}) {
  return (
    <div className='fixed top-0 left-0 z-60 w-full bg-black/60 h-full flex items-center justify-center'>
      <div className='max-w-[60vw] max-h-[90vh] relative'>
        <button className='absolute bg-[#ccc] px-4 py-2 cursor-pointer'
            onClick={()=>close()}
        ><MdClose size={20}/> </button>
        <div className='w-[45vw] h-[90vh] overflow-scroll'>
            <img src={Img} className='object-cover'/>
        </div>
      </div>
    </div>
  )
}

export default ShowFullImage;
