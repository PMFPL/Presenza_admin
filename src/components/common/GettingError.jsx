import { RefreshCcw } from 'lucide-react';
import React from 'react'
import { useNavigate } from 'react-router-dom';

function GettingError({ error }) {
  const navigate = useNavigate();
  return (
    <div className='fixed top-0 left-0 z-99 w-screen h-screen bg-[#032446] rounded-md p-4 flex justify-center items-center z-50'>
      <div className='flex flex-col items-center gap-4'>
        <p className="text-red-400 text-lg">{error} </p>
        <button className='flex items-center gap-1 rounded-md px-4 py-2 cursor-pointer bg-gradient-to-r from-[#ff6b35] to-[#ff8555] text-white hover:shadow-lg'
          onClick={() => navigate('/login')}
        >
          <RefreshCcw className='h-4 w-4' />
          Please LogIn
        </button>
      </div>
    </div>
  )
}

export default GettingError;
