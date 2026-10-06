import { useEffect, useState } from 'react';
import { FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isAdminLoggedIn');
    setIsLoggedIn(loggedInStatus === 'true');
  }, []);

  const logOut = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('Role');
    setIsLoggedIn(false);
    navigate('/login');
  }

  return (
    <div className='flex items-center justify-between px-8 py-2 bg-[#032446] rounded-xl'>
      <div className="flex gap-2 items-center">
        {/* <img src={logo} alt="Admin Logo" className="h-10 mx-auto" /> */}
        <div>
          <h2 className="text-lg font-bold text-white">Admin Dashboard</h2>
          <p className="text-[#53eafd] text-[12px]">Manage your Presenza attendance system</p>
        </div>
      </div>
      <div className=''>
        <button className="text-white text-5 font-bold cursor-pointer flex gap-2 items-center"
          onClick={logOut}
        >
          <span><FiLogOut title='Log Out' /></span>
          <span>{isLoggedIn ? 'Log out' : 'Log in'}</span>
        </button>
      </div>
    </div>
  )
}

export default Header
