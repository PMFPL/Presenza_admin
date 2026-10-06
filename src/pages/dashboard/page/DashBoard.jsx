
import { useDashboard } from '../hook/useDashboard';
import Loading from '../../../components/common/Loading';
import AttendanceChart from '../../../components/chart/attendance/AttendanceChart';
import DepartmentChart from '../../../components/chart/department/DepartmentChart';
import GettingError from '../../../components/common/GettingError';

function Dashboard() {
  const { empCount, loading, error, handleCardClick } = useDashboard();
  const loggedInUserRole=localStorage.getItem('Role')
  return (
    <div className="mt-6">
      {loading && <Loading message="Fetching Employees data..." />}
      {error && <GettingError error={error} />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {empCount?.map((item) => {
          const IconComponent = item.icon;
          // const SubIconComponent=item.subLabel && item.subLabel.icon;
          return (
            <div
              key={item.id}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-xl
              cursor-pointer
              "
              onClick={() => handleCardClick(item.path, item.key)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${item.iconBgColor} rounded-lg`}>
                  <IconComponent className={`h-6 w-6 ${item.iconColor}`} />
                </div>
                <div className="text-center">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{item.value}</h3>
                    <p className="text-sm text-gray-300">{item.label}</p>
                  </div>
                  {item.subLabel &&
                  <div className='border-t border-gray-100 mt-1 mb-1'>
                    <h3 className="text-2xl font-bold text-white mb-1">{item.subValue}</h3>
                    <p className="text-sm text-gray-300">{item.subLabel}</p>
                  </div>
                  }
                </div>
              </div>
            </div>
          );
        })}
      </div>
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`${loggedInUserRole === 'MANAGER' ? 'col-span-2':'col-span-1'}`}>
          <AttendanceChart />
          </div>
          <div>
          {loggedInUserRole !== 'MANAGER' &&
          <DepartmentChart />
          }
          </div>
        </div>
    </div>
  );
}

export default Dashboard;
