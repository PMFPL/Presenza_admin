
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';


import { useDepartmentChart } from './useDepartmentChart';
import Loading from '../../common/Loading';


function DepartmentChart() {
 const {departmentData, loading, error}=useDepartmentChart()

  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-xl">
       {loading && <Loading message='Fetching Department data...' />}
      {error && <p className="text-red-400">{error}</p>}
      <h3 className="text-lg font-semibold text-white mb-4">Department Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={departmentData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {departmentData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DepartmentChart;
