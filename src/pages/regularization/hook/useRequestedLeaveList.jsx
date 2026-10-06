import { useEffect, useMemo, useState } from "react";
import { getRequest, postRequest } from "../../../services/api/APIMethodCaller";
import { useLocation } from "react-router-dom";

export const useRequestedLeaveList = () => {
  const today = new Date().toISOString().split('T')[0];
  const { state } = useLocation();

  const [requestedLeaveList, setRequestedLeaveList] = useState([]);
  const [employeeDeptMap, setEmployeeDeptMap] = useState({}); // id -> departmentName
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchEmpId, setSearchEmpId] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [dateFilter, setDateFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  useEffect(() => {
    if (state === 'LEAVES') {
      setDateFilter(today);
      setStatusFilter('APPROVED');
    }
  }, [state]);

  useEffect(() => {
    fetchAll();
  }, []);

  // 🔑 Fetch leaves + employees in parallel, then merge
  const fetchAll = async () => {
    try {
      setLoading(true);

      // 1. Fetch both in parallel
      const [leaveRes, empRes] = await Promise.all([
        getRequest('/leave'),
        getRequest('/employees?limit=1000').catch(() => null),
      ]);

      const leaves = leaveRes?.data?.data || leaveRes?.data || [];

      // 2. Build employeeId → departmentName map
      let empList = [];
      if (empRes) {
        empList =
          empRes?.data?.data ||
          empRes?.data?.employees ||
          empRes?.data ||
          [];
        if (!Array.isArray(empList)) empList = [];
      }

      const map = {};
      empList.forEach((emp) => {
        const id = emp?._id || emp?.id;
        const dept =
          emp?.departmentName ||
          emp?.department?.name ||
          emp?.department ||
          emp?.deptName ||
          null;
        if (id && dept) map[id] = dept;
      });
      setEmployeeDeptMap(map);

      // 3. Normalize leaves — attach departmentName from map
      const normalized = leaves.map((item) => {
        const emp = item?.employeeId || item?.employee || {};
        const empId = emp?._id || (typeof emp === 'string' ? emp : null);

        const dept =
          item?.departmentName ||
          emp?.departmentName ||
          emp?.department?.name ||
          emp?.department ||
          (empId ? map[empId] : null) ||
          null;

        return {
          ...item,
          employeeCode: item?.employeeCode || emp?.employeeCode || emp?.empCode || 'N/A',
          employeeName: item?.employeeName || emp?.fullName || emp?.name || 'Unknown',
          departmentName: dept,
          startDate: item?.startDate || item?.attendanceDate || null,
          endDate: item?.endDate || null,
        };
      });

      setRequestedLeaveList(normalized);

      // 🔍 Debug
      console.log('📋 Employee map size:', Object.keys(map).length);
      console.log('📋 Sample employee map:', Object.entries(map).slice(0, 3));
      console.log('🔍 Sample normalized leave:', normalized[0]);
      console.log('📋 Departments found:',
        [...new Set(normalized.map(l => l.departmentName).filter(Boolean))]);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch leave list');
    } finally {
      setLoading(false);
    }
  };

  // Department options — now populated from normalized data
  const departments = useMemo(() => {
    return [...new Set(
      requestedLeaveList.map((leave) => leave?.departmentName).filter(Boolean)
    )].sort();
  }, [requestedLeaveList]);

  const status = useMemo(() => {
    return [...new Set(requestedLeaveList.map((e) => e?.status).filter(Boolean))];
  }, [requestedLeaveList]);

  const checkBetweenDate = (filterDate, startDate, endDate) => {
    if (!filterDate || !startDate) return false;
    const target = new Date(filterDate).toISOString().split('T')[0];
    const start = new Date(startDate).toISOString().split('T')[0];
    const end = endDate ? new Date(endDate).toISOString().split('T')[0] : start;
    return target >= start && target <= end;
  };

  const filteredLeaveList = useMemo(() => {
    return requestedLeaveList.filter((leave) => {
      const search = searchEmpId?.toLowerCase().trim() || '';
      if (search) {
        const code = leave.employeeCode?.toLowerCase() || '';
        const name = leave.employeeName?.toLowerCase() || '';
        if (!code.includes(search) && !name.includes(search)) return false;
      }

      const matchStatus = statusFilter ? leave.status === statusFilter : true;
      const matchDepartment = departmentFilter
        ? leave.departmentName === departmentFilter
        : true;

      const leaveStart = leave.startDate?.split('T')[0] || '';
      const leaveEnd = leave.endDate?.split('T')[0] || '';
      const matchesDate = dateFilter
        ? leaveStart === dateFilter || checkBetweenDate(dateFilter, leaveStart, leaveEnd)
        : true;

      return matchStatus && matchDepartment && matchesDate;
    });
  }, [requestedLeaveList, searchEmpId, statusFilter, dateFilter, departmentFilter]);

  const handleLeaveApproval = async (empId, status) => {
    if (!window.confirm("Are you sure you want to approve this leave request?")) return;
    if (status === 'APPROVED') { alert("Leave Already Approved"); return; }
    try {
      const response = await postRequest(`/leave/${empId}/approve`);
      if (response.success) fetchAll();
      else alert(response.data?.message || 'Failed to approve leave request');
    } catch (err) { console.log(err); }
  };

  const handleLeaveRejection = async (empId, status, rejectionReason = '') => {
    if (status === 'REJECTED') { alert("Leave Already Rejected"); return; }
    try {
      const response = await postRequest(`/leave/${empId}/reject`, { rejectionReason });
      if (response.success) fetchAll();
      else alert(response.data?.message || 'Failed to reject leave request');
    } catch (err) { console.log(err); }
  };

  return {
    today, status, statusFilter, setStatusFilter,
    dateFilter, setDateFilter,
    departmentFilter, setDepartmentFilter,
    departments, filteredLeaveList,
    searchEmpId, setSearchEmpId,
    requestedLeaveList, loading, error,
    handleLeaveApproval, handleLeaveRejection,
  };
};