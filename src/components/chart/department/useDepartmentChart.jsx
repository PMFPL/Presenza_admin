import { useEffect, useState } from "react";
import { getRequest } from "../../../services/api/APIMethodCaller";

export const useDepartmentChart=()=>{
   const [departmentData, setDepartmentData] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

    useEffect(() => {
        fetchDepartmentChartData();
    }, []);

    const fetchDepartmentChartData = async () => {
      try {
           setLoading(true);
            const response = await getRequest('/dashboard/department-distribution');
            if (response.success) {
              setDepartmentData(response.data.data || []);
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
     departmentData, loading, error
  }
}
