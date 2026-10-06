import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchApplicationListUsedByEmp,
  fetchEmployeeStats,
  selectAppDetails,
  selectAppError,
  selectAppLoading,
  selectEfficiency,
  clearStats,
  clearAppDetails
} from "./slice/applicationUsedByEmpSlice";

const DEFAULT_VISIBLE_COUNT = 5;

export const useApplicationUsedByEmp = ({ selectedEmp = '', selectedDate = '' }) => {
  const dispatch = useDispatch();
  const appDetails = useSelector(selectAppDetails);
  const efficiency = useSelector(selectEfficiency);
  const loading = useSelector(selectAppLoading);
  const error = useSelector(selectAppError);
  const [showAll, setShowAll] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Holds the in-flight thunk promises so they can be cancelled if the
  // employee/date filters change again before the requests resolve, or on
  // unmount — prevents "Can't perform a React state update on an unmounted
  // component" warnings and stale-data races.
  const activeThunksRef = useRef([]);

  const cancelActiveRequests = useCallback(() => {
    activeThunksRef.current.forEach((promise) => {
      if (promise && typeof promise.abort === 'function') promise.abort();
    });
    activeThunksRef.current = [];
  }, []);

  const runFetch = useCallback(async (employeeId, date) => {
    cancelActiveRequests();

    const listPromise = dispatch(fetchApplicationListUsedByEmp({ employeeId, date }));
    const statsPromise = dispatch(fetchEmployeeStats({ employeeId, date }));
    activeThunksRef.current = [listPromise, statsPromise];

    try {
      await Promise.allSettled([listPromise, statsPromise]);
    } finally {
      setIsInitialized(true);
    }
  }, [dispatch, cancelActiveRequests]);

  useEffect(() => {
    if (selectedEmp) {
      runFetch(selectedEmp, selectedDate);
    } else {
      cancelActiveRequests();
      dispatch(clearStats());
      dispatch(clearAppDetails());
      setShowAll(false);
      setIsInitialized(false);
    }

    return () => {
      cancelActiveRequests();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmp, selectedDate]);

  const refetch = useCallback(() => {
    if (selectedEmp) runFetch(selectedEmp, selectedDate);
  }, [selectedEmp, selectedDate, runFetch]);

  const displayedApps = useMemo(() => {
    if (!appDetails || appDetails.length === 0) return [];
    return showAll ? appDetails : appDetails.slice(0, DEFAULT_VISIBLE_COUNT);
  }, [appDetails, showAll]);

  const hasMoreRecords = useMemo(() =>
    (appDetails?.length || 0) > DEFAULT_VISIBLE_COUNT,
    [appDetails]
  );

  const toggleShow = useCallback(() => {
    setShowAll(prev => !prev);
  }, []);

  const reset = useCallback(() => {
    setShowAll(false);
    setIsInitialized(false);
  }, []);

  const hasData = useMemo(() =>
    Array.isArray(appDetails) && appDetails.length > 0,
    [appDetails]
  );

  const totalCount = useMemo(() =>
    appDetails?.length || 0,
    [appDetails]
  );

  return {
    showAll,
    setShowAll,
    toggleShow,
    appDetails,
    loading,
    error,
    displayedApps,
    hasMoreRecords,
    efficiency,
    isInitialized,
    hasData,
    totalCount,
    refetch,
    reset
  };
};