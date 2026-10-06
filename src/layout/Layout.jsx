import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import NavigationItems from '../components/common/NavigationItems';

function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e2f4f] via-[#2a4470] to-[#1e2f4f] p-6">
      <Header />
      <NavigationItems />
      <main>
       <Outlet />
      </main>
    </div>
  );
}

export default Layout;
