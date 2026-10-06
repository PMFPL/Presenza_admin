import React from 'react'

function TrucatedValue({title}) {
  return (
    <div className="relative group w-fit flex justify-center items-center">
        <p className="max-w-[100px] truncate cursor-pointer">
          {title}
        </p>
        <div className="absolute left-0 top-[-15px] z-50 hidden group-hover:block bg-gray-800 text-white text-xs rounded-md px-3 py-2 shadow-lg min-w-[200px] max-w-[300px] break-words">
         <p>{title}</p>
        </div>
      </div>
  )
}

export default TrucatedValue;
