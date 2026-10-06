import { PiUsersFourDuotone } from 'react-icons/pi';
import { RxDashboard } from 'react-icons/rx';

// Remove the role check from here
// const role = localStorage.getItem('Role');

// Create a function that returns the sidebar items
export const getSidebarItems = () => {
  const role = localStorage.getItem('Role');

  return [
    {
      id: 1,
      title: 'Dashboard',
      path: 'dashboard',
      icon: RxDashboard,
    },
    {
      id: 2,
      path: 'attendance',
      title: 'Attendance',
      icon: RxDashboard,
    },
    {
      id: 3,
      path: 'employee',
      title: 'Employees',
      icon: PiUsersFourDuotone,
    },
    {
      id: 4,
      path: 'regularization',
      title: 'Leave Regularization',
      icon: PiUsersFourDuotone,
    },

    // Show only for CEO
    ...(role === 'CEO'
      ? [
        {
          id: 5,
          path: 'user_tracker',
          title: 'User Tracker',
          icon: PiUsersFourDuotone,
        },
      ]
      : []),

    {
      id: 6,
      path: 'kra-management',
      title: 'KRA Management',
      icon: PiUsersFourDuotone,
    },
    {
      id: 7,
      path: 'requested-expense',
      title: 'Requested Expense',
      icon: PiUsersFourDuotone,
    },
    {
      id: 8,
      path: 'report',
      title: 'Attendance Report',
      icon: PiUsersFourDuotone,
    },
    {
      id: 9,
      path: 'leave-management',   // adjust the route as per your app
      title: 'Attendance Regularization',
      icon: PiUsersFourDuotone,   // you can replace with a different icon
    },
  ];
};

// For backward compatibility, you can also export as sidebarItems
export const sidebarItems = getSidebarItems();
