import React, { memo } from 'react';
import { Loader } from 'lucide-react';

function Loading({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#1e2f4f] via-[#2a4470] to-[#1e2f4f] flex items-center justify-center z-50">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Loading card */}
      <div className="relative z-10 text-center">
        <div className="inline-flex items-center justify-center mb-6">
          <div className="relative w-16 h-16">
            <Loader className="w-16 h-16 text-cyan-400 animate-spin" />
            <div className="absolute inset-0 border-4 border-transparent border-t-cyan-400 border-r-blue-400 rounded-full animate-spin opacity-30 animation-delay-500"></div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Please wait</h2>
        <p className="text-gray-300 text-sm font-medium">{message}</p>

        {/* Loading dots animation */}
        {/* <div className="flex justify-center gap-2 mt-6">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
        </div> */}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
        .animate-bounce {
          animation: bounce 1.4s infinite;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}

export default memo(Loading);
