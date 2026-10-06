import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { getRequest } from "../../../services/api/APIMethodCaller";

// Module-level cache for employee data to avoid repeated API calls across
// mounts of the tracker page within the same session.
let employeeCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useTracker = () => {
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const isCacheValid = useCallback(() => {
    return Boolean(
      employeeCache &&
      cacheTimestamp &&
      (Date.now() - cacheTimestamp) < CACHE_DURATION
    );
  }, []);

  const fetchEmployees = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && isCacheValid()) {
      setEmployees(employeeCache);
      setIsInitialized(true);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    try {
      setLoading(true);
      setError(null);

      const response = await getRequest('/employee?isSystemProvided=true', { signal });

      if (!isMountedRef.current) return;

      if (response?.success) {
        const employeeData = Array.isArray(response.data?.data) ? response.data.data : [];
        employeeCache = employeeData;
        cacheTimestamp = Date.now();
        setEmployees(employeeData);
      } else {
        setError(response?.error || 'Failed to fetch employees');
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      if (err?.name !== 'AbortError' && err?.name !== 'CanceledError') {
        setError(err?.message || 'An unexpected error occurred');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setIsInitialized(true);
      }
    }
  }, [isCacheValid]);

  // Initial fetch
  useEffect(() => {
    fetchEmployees();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const returnValue = useMemo(() => ({
    selectedDate,
    setSelectedDate,
    employees,
    loading,
    error,
    selectedEmp,
    setSelectedEmp,
    isInitialized,
    refetchEmployees: () => fetchEmployees(true),
    hasEmployees: employees.length > 0,
    selectedEmployeeData: employees.find(emp => emp._id === selectedEmp) || null,
  }), [selectedDate, employees, loading, error, selectedEmp, isInitialized, fetchEmployees]);

  return returnValue;
};