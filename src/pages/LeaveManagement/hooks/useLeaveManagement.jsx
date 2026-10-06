import { useState, useEffect, useMemo, useCallback } from 'react';
import { getRequest, putRequest } from '../../../services/api/APIMethodCaller';

export const useLeaveManagement = () => {
  const [allRequests, setAllRequests] = useState([]); // all fetched data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [isInitialized, setIsInitialized] = useState(false);

  // ---------- Client‑side pagination (same as Attendance) ----------
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  const getToken = () => localStorage.getItem('accessToken') || '';

  const transformRequest = (item) => {
    const attendance = item.attendanceId;
    const sessions = attendance?.sessions || [];

    const existingPunchIn =
      attendance?.firstPunchIn || sessions[0]?.punchIn || null;
    const existingPunchOut =
      attendance?.lastPunchOut || sessions[sessions.length - 1]?.punchOut || null;

    return {
      id: item._id,
      employeeName: item.employeeId?.fullName || 'Unknown',
      employeeId: item.employeeId?.employeeCode || 'N/A',
      requestDate: item.attendanceDate || item.createdAt,
      requestType: item.requestType || '',
      reason: item.reason || '',
      status: item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase(),
      attendanceId: attendance?._id,
      requestedPunchIn: item.requestedPunchIn,
      requestedPunchOut: item.requestedPunchOut,
      existingPunchIn,
      existingPunchOut,
      approvalRemark: item.approvalRemark,
      approvedPunchIn: item.approvedPunchIn,
      approvedPunchOut: item.approvedPunchOut,
      raw: item,
    };
  };

  // ---------- Fetch ALL records (no pagination) ----------
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all records – adjust limit if needed (1000 is safe)
      const url = `/attendance/regularization?limit=1000`;
      const response = await getRequest(url);

      if (response.success && Array.isArray(response.data.data)) {
        const transformed = response.data.data.map(transformRequest);
        setAllRequests(transformed);
        setIsInitialized(true);
      } else {
        setError(response.message || 'Failed to fetch requests');
        setAllRequests([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Could not load requests. Please try again.');
      setAllRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ---------- Client‑side filtering ----------
  const filteredRequests = useMemo(() => {
    let result = allRequests;

    // Apply status filter
    if (statusFilter !== 'All') {
      result = result.filter((r) => r.status === statusFilter);
    }

    // Apply search (by name or ID)
    const search = searchTerm.trim().toLowerCase();
    if (search) {
      result = result.filter((r) =>
        r.employeeName.toLowerCase().includes(search) ||
        r.employeeId.toLowerCase().includes(search)
      );
    }

    return result;
  }, [allRequests, statusFilter, searchTerm]);

  // ---------- Client‑side pagination (derived from filtered data) ----------
  const totalItemsFiltered = filteredRequests.length;
  const totalPagesFiltered = Math.ceil(totalItemsFiltered / limit) || 1;
  const hasPrevFiltered = page > 1;
  const hasNextFiltered = page < totalPagesFiltered;

  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return filteredRequests.slice(start, end);
  }, [filteredRequests, page, limit]);

  // Update pagination metadata when filtered data changes
  useEffect(() => {
    setTotalItems(totalItemsFiltered);
    setTotalPages(totalPagesFiltered);
    setHasNext(hasNextFiltered);
    setHasPrev(hasPrevFiltered);
  }, [totalItemsFiltered, totalPagesFiltered, hasNextFiltered, hasPrevFiltered]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  // ---------- Approve / Reject (unchanged) ----------
  const approveRequest = async (requestId, payload) => {
    // Optimistic update
    setAllRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Approved' } : r))
    );
    try {
      const url = `/attendance/regularization/${requestId}/approve`;
      await putRequest(url, payload, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
    } catch (err) {
      console.error('Approve error:', err);
      setAllRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'Pending' } : r))
      );
      throw err;
    }
  };

  const rejectRequest = async (requestId, rejectionRemark) => {
    setAllRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Rejected' } : r))
    );
    try {
      const url = `/attendance/regularization/${requestId}/reject`;
      await putRequest(url, { rejectionRemark }, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
    } catch (err) {
      console.error('Reject error:', err);
      setAllRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'Pending' } : r))
      );
      throw err;
    }
  };

  // Stats (from filtered data)
  const stats = useMemo(() => ({
    total: filteredRequests.length,
    pending: filteredRequests.filter((r) => r.status === 'Pending').length,
    approved: filteredRequests.filter((r) => r.status === 'Approved').length,
    rejected: filteredRequests.filter((r) => r.status === 'Rejected').length,
  }), [filteredRequests]);

  // Return same interface as before – component sees no difference
  return {
    requests: paginatedData, // only current page
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    approveRequest,
    rejectRequest,
    refetch: fetchRequests,
    stats,
    isInitialized,
    currentPage: page,
    setPage,
    totalPages,
    totalItems,
    hasNext,
    hasPrev,
    limit,
  };
};