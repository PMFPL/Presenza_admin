import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { getRequest } from "../../../services/api/APIMethodCaller";
import { sortArrayBasedOnKey } from "../../../utils/sortArrayBasedOnKey";

const DEFAULT_VISIBLE_COUNT = 5;
const INCREMENT_COUNT = 5;

export const useWindowsUsedByEmp = ({ selectedEmp = '', selectedDate = '' }) => {
  const [windowDetails, setWindowDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(DEFAULT_VISIBLE_COUNT);
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const totalRecords = windowDetails?.length || 0;
  const displayedApps = useMemo(() =>
    windowDetails?.slice(0, visibleCount) || [],
    [windowDetails, visibleCount]
  );
  const isExpanded = visibleCount >= totalRecords && totalRecords > 0;
  const hasData = Array.isArray(windowDetails) && windowDetails.length > 0;

  const fetchWindowsTilesUsedByEmp = useCallback(async () => {
    // Cancel any previous in-flight request before starting a new one.
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    try {
      setLoading(true);
      setError(null);

      const url = selectedDate
        ? `/activities?employeeId=${selectedEmp}&date=${selectedDate}`
        : `/activities?employeeId=${selectedEmp}`;

      const response = await getRequest(url, { signal });

      if (!isMountedRef.current) return;

      if (response?.success) {
        const rawList = Array.isArray(response.data) ? response.data : [];
        const sortedList = sortArrayBasedOnKey(rawList, "duration");
        setWindowDetails(sortedList);
        setVisibleCount(DEFAULT_VISIBLE_COUNT);
      } else {
        setError(response?.error || 'Failed to fetch window data');
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      if (err?.name !== 'AbortError' && err?.name !== 'CanceledError') {
        setError(err?.message || 'An unexpected error occurred');
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [selectedEmp, selectedDate]);

  useEffect(() => {
    if (selectedEmp) {
      fetchWindowsTilesUsedByEmp();
    } else {
      setWindowDetails(null);
      setError(null);
      setVisibleCount(DEFAULT_VISIBLE_COUNT);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [selectedEmp, selectedDate, fetchWindowsTilesUsedByEmp]);

  const showMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + INCREMENT_COUNT, totalRecords));
  }, [totalRecords]);

  const showLess = useCallback(() => {
    setVisibleCount(DEFAULT_VISIBLE_COUNT);
  }, []);

  const toggleShow = useCallback(() => {
    if (isExpanded) {
      showLess();
    } else {
      showMore();
    }
  }, [isExpanded, showMore, showLess]);

  const reset = useCallback(() => {
    setWindowDetails(null);
    setError(null);
    setVisibleCount(DEFAULT_VISIBLE_COUNT);
  }, []);

  return {
    windowDetails,
    loading,
    error,
    visibleCount,
    setVisibleCount,
    totalRecords,
    displayedApps,
    isExpanded,
    hasData,
    showMore,
    showLess,
    toggleShow,
    reset,
    refetch: fetchWindowsTilesUsedByEmp
  };
};