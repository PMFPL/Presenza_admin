import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,

} from 'recharts';
import Loading from '../../common/Loading'
import { useAttendanceChart } from './useAttendanceChart';

function AttendanceChart() {
const {attendanceData, loading, error}=useAttendanceChart();

  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-xl">
      {loading && <Loading message='Fetching Attendence data...' />}
      {error && <p className="text-red-400">{error}</p>}
      <h3 className="text-lg font-semibold text-white mb-4">Weekly Attendance</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={attendanceData }>
          <defs>
            <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4dd0e1" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#4dd0e1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ff6b35" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
          <XAxis dataKey="date" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
            }}
          />
          <Area
            type="monotone"
            dataKey="present"
            stroke="#4dd0e1"
            fillOpacity={1}
            fill="url(#colorPresent)"
          />
          <Area
            type="monotone"
            dataKey="absent"
            stroke="#ff6b35"
            fillOpacity={1}
            fill="url(#colorAbsent)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AttendanceChart;
