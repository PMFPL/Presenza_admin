// hooks/useAttendance.js
import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { getRequest } from "../../../services/api/APIMethodCaller";
import { getAttendanceColumns } from "../data/AttendanceColumns";

export const useAttendance = () => {
  const { state } = useLocation();

  // ---------- State ----------
  const [searchEmpId, setSearchEmpId] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDetails, setIsDetails] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [empSession, setEmpSession] = useState([]);
  const [empCode, setEmpCode] = useState('');
  const [showFullImage, setShowFullImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  // ---------- Client‑side pagination ----------
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const today = new Date().toISOString().split('T')[0];

  // ---------- Init date & dashboard status ----------
  useEffect(() => {
    setDateFilter(today);
    if (state) {
      setStatusFilter(state);
    } else {
      setStatusFilter('');
    }
  }, [state, today]);

  // ---------- Image handlers ----------
  const showImage = useCallback((Img) => {
    if (!Img) return;
    setShowFullImage(true);
    setSelectedImage(Img);
  }, []);

  const closeImage = useCallback(() => {
    setShowFullImage(false);
    setSelectedImage('');
  }, []);

  // ---------- Fetch ALL attendance records for the selected date ----------
  const fetchEmployeesAttendance = useCallback(async () => {
    if (!dateFilter) return;
    try {
      setLoading(true);
      setError(null);
      // Send a large limit to get all records (no pagination)
      const response = await getRequest(`/attendance?date=${dateFilter}&limit=1000`);
      if (response.success) {
        setEmployees(response.data.data || []);
        console.log(`✅ Fetched ${response.data.data?.length || 0} records for ${dateFilter}`);
      } else {
        setError(response.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to fetch attendance: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [dateFilter]);

  useEffect(() => {
    fetchEmployeesAttendance();
  }, [fetchEmployeesAttendance]);

  // ---------- Reset page to 1 when any filter changes ----------
  useEffect(() => {
    setPage(1);
  }, [searchEmpId, departmentFilter, attendanceFilter, statusFilter, dateFilter]);

  // ---------- Derived filter options ----------
  const departments = useMemo(() => {
    return [...new Set(employees.map((e) => e?.employee?.departmentName).filter(Boolean))].sort();
  }, [employees]);

  const attendenceStatus = useMemo(() => {
    return [...new Set(employees.map((e) => e.attendanceStatus).filter(Boolean))].sort();
  }, [employees]);

  const statuses = useMemo(() => {
    return [...new Set(employees.map((e) => e?.status).filter(Boolean))].sort();
  }, [employees]);

  // ---------- Client‑side filtering (exactly as your original) ----------
  const filteredAttendance = useMemo(() => {
    const result = employees.filter((emp) => {
      const search = searchEmpId?.toLowerCase().trim() || '';
      if (search) {
        const code = emp?.employee?.employeeCode?.toLowerCase() || '';
        const name = emp?.employee?.fullName?.toLowerCase() || '';
        if (!code.includes(search) && !name.includes(search)) {
          return false;
        }
      }

      const matchesDept = departmentFilter
        ? emp?.employee?.departmentName === departmentFilter
        : true;

      const matchesAttendance = attendanceFilter
        ? emp.attendanceStatus === attendanceFilter
        : true;

      const matchesStatus = statusFilter
        ? statusFilter === 'LATE_ARRIVAL'
          ? emp.lateMinutes > 0
          : emp?.status === statusFilter
        : true;

      return matchesDept && matchesAttendance && matchesStatus;
    });

    console.log(`🔍 Filtered records: ${result.length} (limit = ${limit})`);
    return result;
  }, [employees, searchEmpId, departmentFilter, attendanceFilter, statusFilter]);

  // ---------- Client‑side pagination metadata ----------
  const totalItems = filteredAttendance.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  console.log(`📄 Page ${page} of ${totalPages} (totalItems: ${totalItems})`);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredAttendance.slice(start, end);
  }, [filteredAttendance, page, limit]);

  // ---------- Table columns ----------
  const columns = useMemo(
    () =>
      getAttendanceColumns({
        data: employees,
        showImage: showImage,
        onViewDetails: (row) => {
          setSelectedEmployee(row);
          setEmpSession(row.sessions || []);
          setIsDetails(true);
          setEmpCode(row?.employee?.employeeCode || '');
        },
      }),
    [employees, showImage]
  );

  // ---------- Details handlers ----------
  const openDetailsPage = useCallback((empCode) => {
    setIsDetails(true);
    setEmpCode(empCode);
  }, []);

  const closeDetailsPage = useCallback(() => {
    setIsDetails(false);
    setSelectedEmployee(null);
    setEmpSession([]);
  }, []);

  const employeeData = useMemo(() => selectedEmployee, [selectedEmployee]);

  // ---------- Summary stats (based on full filtered data) ----------
  const summaryStats = useMemo(() => {
    const total = filteredAttendance.length;
    const present = filteredAttendance.filter(e => e.status === 'PRESENT').length;
    const absent = filteredAttendance.filter(e => e.status === 'ABSENT').length;
    const shortLeave = filteredAttendance.filter(e => e.attendanceStatus === 'SHORT_LEAVE').length;
    const late = filteredAttendance.filter(e => e.lateMinutes > 0).length;
    return { total, present, absent, shortLeave, late };
  }, [filteredAttendance]);

  // ---------- Return ----------
  return {
    today,
    searchEmpId,
    setSearchEmpId,
    departmentFilter,
    setDepartmentFilter,
    dateFilter,
    setDateFilter,
    departments,
    statuses,
    statusFilter,
    setStatusFilter,
    attendanceFilter,
    setAttendanceFilter,
    attendenceStatus,
    employees,
    loading,
    error,
    isDetails,
    empSession,
    empCode,
    columns,
    showFullImage,
    selectedImage,
    employeeData,
    summaryStats,
    filteredAttendance,
    paginatedData,
    currentPage: page,
    setPage,
    totalPages,
    totalItems,
    hasNext,
    hasPrev,
    limit,
    closeDetailsPage,
    openDetailsPage,
    closeImage,
    showImage,
  };
};