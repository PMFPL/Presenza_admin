import { useEffect, useState } from "react";
import { getRequest } from "../../../services/api/APIMethodCaller";
import { createDashboardItems } from "../../../utils/formatedDashboardData";
import { useNavigate } from "react-router-dom";
import { removeToken } from "../../../utils/removeToken";

export const useDashboard = () => {
  const [empCount, setEmpCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployeeStats();
  }, []);

  const fetchEmployeeStats = async () => {
    try {
      setLoading(true);
      const response = await getRequest('/dashboard');
      console.log("Dashboard Response:", response);
      if (response.success) {
        setEmpCount(createDashboardItems(response.data.data) || []);
      } else {
        setError(response.error || 'Something went wrong');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch Dashboard data');
    } finally {
      setLoading(false);
    }
  }

  const naviagte = useNavigate();
  const handleCardClick = (path, key) => {
    console.log("path and Key:", path, key)
    naviagte(`/${path}`, { state: key })
  }

  return {
    empCount, loading, error, handleCardClick
  }
}
