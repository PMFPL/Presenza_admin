import { Link, useLocation } from 'react-router-dom';
import { getSidebarItems } from './NavigationItem';
import { useState, useEffect } from 'react';

function NavigationItems() {
  const [sidebarItems, setSidebarItems] = useState(getSidebarItems());

  // Update sidebar items when role changes
  useEffect(() => {
    const handleStorageChange = () => {
      setSidebarItems(getSidebarItems());
    };

    // Listen for storage changes (for cross-tab sync)
    window.addEventListener('storage', handleStorageChange);

    // Also check for role changes in the same tab
    const interval = setInterval(() => {
      const currentRole = localStorage.getItem('Role');
      // You might want to store the previous role in a ref or state
      // For simplicity, we'll just update on each interval
      setSidebarItems(getSidebarItems());
    }, 1000); // Check every second

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="bg-white/10 rounded-[50px] p-2 my-8 w-fit">
      <ul className="list-none p-0 text-white text-[14px] font-semibold flex gap-4 items-center">
        {sidebarItems.map((item) => (
          <ListItem key={item.id} title={item.title} icon={item.icon} path={item.path} />
        ))}
      </ul>
    </div>
  );
}

export default NavigationItems;

const ListItem = ({ title, icon: Icon, path }) => {
  const location = useLocation();
  const isActive = location.pathname.includes(path);

  return (
    <li
      className={`flex items-center gap-1 cursor-pointer py-0 px-3 rounded-[50px] transition-colors ${
        isActive ? 'bg-[#ff6b35]' : 'hover:bg-[#ff6b35]'
      }`}
    >
      <Link to={path} className="no-underline text-white hover:text-[#131a1b] transition-colors">
        {title}
      </Link>
    </li>
  );
};