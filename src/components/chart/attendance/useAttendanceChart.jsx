import { useEffect, useState } from "react";
import { getRequest } from "../../../services/api/APIMethodCaller";

export const useAttendanceChart=()=>{
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
      fetchAttendanceChartData();
    }, []);

    const fetchAttendanceChartData = async () => {
      try {
        setLoading(true);
        const response = await getRequest('/dashboard/attendance-trend');
        if (response.success) {
          setAttendanceData(response.data.data || []);
        } else {
          setError(response.error || 'Something went wrong');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch Attendance data');
      } finally {
        setLoading(false);
      }
    };
  return {
    attendanceData, loading, error
  }
}
