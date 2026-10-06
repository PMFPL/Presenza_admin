import { Users, UserCheck, UserX, Clock, CalendarDays } from 'lucide-react';

export const createDashboardItems = (data) => {
  return [
    {
      id: 1,
      icon: Users,
      iconBgColor: 'bg-cyan-400/20',
      iconColor: 'text-cyan-300',
      value: String(data.totalEmployees || 0),
      path: 'employee',
      label: 'Total Employees',
    },

    {
      id: 2,
      icon: UserCheck,
      iconBgColor: 'bg-green-400/20',
      iconColor: 'text-green-300',
      value: String((data.present || 0)),
      // subValue: String(data.lateArrivals || 0),
      path: 'attendance',
      key: 'PRESENT',
      label: 'Present Today',
      // subLabel: 'Late Arrivals',
    },

    {
      id: 3,
      icon: UserX,
      iconBgColor: 'bg-red-400/20',
      iconColor: 'text-red-300',
      value: String(data.absent || 0),
      path: 'attendance',
      key: 'ABSENT',
      label: 'Absent Today',
    },

    {
      id: 4,
      icon: CalendarDays,
      iconBgColor: 'bg-purple-400/20',
      iconColor: 'text-purple-300',
      value: String(
         (data.onLeave || 0)
      ),
      // subValue: `${data.shortLeave || 0} / ${data.halfDay || 0} / ${data.onLeave || 0}`,
      path: 'regularization',
      key: 'LEAVES',
      label: 'Leaves',
      // subLabel: 'Short Leave /Half Day /Full Day ',
    },
  ];
};
