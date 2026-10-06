import React, { useState, useCallback, useEffect, useRef } from 'react';
import Loading from '../../components/common/Loading';
import GettingError from '../../components/common/GettingError';
import Table from '../../components/common/Table';
import { useLeaveManagement } from './hooks/useLeaveManagement';
import { getLeaveManagementColumns, REQUEST_TYPE_LABELS } from './data/LeaveManagementColumns';
import {
  PiUsersFourDuotone,
  PiClockDuotone,
  PiCheckCircleDuotone,
  PiXCircleDuotone
} from 'react-icons/pi';
import {
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  X,
  Activity,
  ClipboardList,
  Lock,
  MessageSquareQuote,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// ---- Helpers ----
const IST_OFFSET_MINUTES = 330;

const formatIST = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const formatChip = (isoString) => {
  if (!isoString) return 'Not recorded';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return 'Not recorded';
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/* ---------- requested value <-> UTC ISO (unchanged backend contract) ---------- */
const literalIsoToDatetimeLocal = (isoString) => {
  if (!isoString) return '';
  const match = String(isoString).match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  return match ? `${match[1]}T${match[2]}` : '';
};

const istDatetimeLocalToUtcIso = (localValue) => {
  if (!localValue) return null;
  const asUtcDigits = new Date(`${localValue}:00.000Z`);
  const trueUtc = new Date(asUtcDigits.getTime() - IST_OFFSET_MINUTES * 60000);
  return trueUtc.toISOString();
};

const requestedFieldToUtcIso = (isoString) => {
  const literalLocal = literalIsoToDatetimeLocal(isoString);
  return literalLocal ? istDatetimeLocalToUtcIso(literalLocal) : null;
};

/* ---------- NEW: display / edit everything in IST ---------- */
// UTC ISO -> IST date string (YYYY-MM-DD)
const utcIsoToIstDateStr = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  return new Date(date.getTime() + IST_OFFSET_MINUTES * 60000).toISOString().slice(0, 10);
};

// UTC ISO -> { hour: '09', minute: '30', ampm: 'AM' } in IST
const utcIsoToIstTimeParts = (isoString) => {
  if (!isoString) return { hour: '12', minute: '00', ampm: 'AM' };
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return { hour: '12', minute: '00', ampm: 'AM' };
  const ist = new Date(date.getTime() + IST_OFFSET_MINUTES * 60000);
  const hours = ist.getUTCHours();
  const minutes = ist.getUTCMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return { hour: String(hour12), minute: String(minutes).padStart(2, '0'), ampm };
};

// IST date + time parts -> UTC ISO
const buildUtcIsoFromIstParts = (dateStr, hour, minute, ampm) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  let h = parseInt(hour, 10);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  const istAsUtcMs = Date.UTC(year, month - 1, day, h, parseInt(minute, 10), 0, 0);
  return new Date(istAsUtcMs - IST_OFFSET_MINUTES * 60000).toISOString();
};

// The single shared date for both punches (falls back to punch out if needed)
const getSharedIstDateStr = (punchInIso, punchOutIso) =>
  utcIsoToIstDateStr(punchInIso) || utcIsoToIstDateStr(punchOutIso) || '';

// 'YYYY-MM-DD' -> '01 May 2024'
const formatDateLabel = (dateStr) => {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return '—';
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-IN', {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getFieldVisibility = (requestType) => {
  switch (requestType) {
    case 'MISSING_PUNCH_IN':
      return { showPunchIn: true, showPunchOut: false };
    case 'MISSING_PUNCH_OUT':
      return { showPunchIn: false, showPunchOut: true };
    case 'MISSING_BOTH':
    case 'WRONG_PUNCH_TIME':
    case 'ABSENT_MARKED':
    default:
      return { showPunchIn: true, showPunchOut: true };
  }
};

/**
 * Defaults for the modal.
 * Priority: requested punch (what the employee asked for / what is shown on the page)
 *           -> existing punch -> attendance record.
 */
const getInitialPunchTimesUtc = (request) => {
  const requestedIn = request?.requestedPunchIn
    ? requestedFieldToUtcIso(request.requestedPunchIn)
    : null;
  const requestedOut = request?.requestedPunchOut
    ? requestedFieldToUtcIso(request.requestedPunchOut)
    : null;

  const punchInUtc =
    requestedIn ||
    request?.existingPunchIn ||
    request?.attendanceId?.firstPunchIn ||
    null;

  const punchOutUtc =
    requestedOut ||
    request?.existingPunchOut ||
    request?.attendanceId?.lastPunchOut ||
    null;

  return { punchInUtc, punchOutUtc };
};

// ---- StatCard ----
const StatCard = ({ icon: Icon, label, value, color, subtitle }) => (
  <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center gap-4">
    <div className={`p-3 rounded-lg bg-${color}-500/20`}>
      <Icon size={20} className={`text-${color}-400`} />
    </div>
    <div>
      <p className="text-white/40 text-xs font-medium uppercase tracking-wider">{label}</p>
      <p className="text-white/90 text-2xl font-semibold">{value}</p>
      {subtitle && <p className="text-white/30 text-xs">{subtitle}</p>}
    </div>
  </div>
);

// ---- Main Component ----
const LeaveManagement = () => {
  const {
    requests,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    approveRequest,
    rejectRequest,
    refetch,
    stats,
    isInitialized,
    currentPage,
    setPage,
    totalPages,
    totalItems,
    hasNext,
    hasPrev,
    limit,
  } = useLeaveManagement();

  // ---- Store original punch times ----
  const originalTimesRef = useRef(new Map());
  const isOriginalMapInitialized = useRef(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    if (isInitialized && !loading && requests.length > 0 && !isOriginalMapInitialized.current) {
      const map = originalTimesRef.current;
      requests.forEach(req => {
        const id = req.id;
        if (!id) return;
        const punchIn = req.existingPunchIn || req.attendanceId?.firstPunchIn || null;
        const punchOut = req.existingPunchOut || req.attendanceId?.lastPunchOut || null;
        map.set(id, { punchIn, punchOut });
      });
      isOriginalMapInitialized.current = true;
      setForceUpdate(prev => prev + 1);
    }
  }, [isInitialized, loading, requests]);

  // ---- Modal state ----
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [approvalRemark, setApprovalRemark] = useState('');
  const [approvedPunchIn, setApprovedPunchIn] = useState(null);
  const [approvedPunchOut, setApprovedPunchOut] = useState(null);
  const [rejectionRemark, setRejectionRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldVisibility, setFieldVisibility] = useState({ showPunchIn: true, showPunchOut: true });
  const [timeParts, setTimeParts] = useState({
    punchIn: { hour: '12', minute: '00', ampm: 'AM' },
    punchOut: { hour: '12', minute: '00', ampm: 'PM' }
  });

  // ---- Modal handlers ----
  const openModal = useCallback((type, request) => {
    setSelectedRequest(request);
    setModalType(type);
    setRejectionRemark('');
    setApprovalRemark('');

    if (type === 'approve') {
      const visibility = getFieldVisibility(request.requestType);
      const { punchInUtc, punchOutUtc } = getInitialPunchTimesUtc(request);

      setApprovedPunchIn(punchInUtc);
      setApprovedPunchOut(punchOutUtc);
      setFieldVisibility(visibility);

      // Default the pickers to the requested (or existing) punch times, in IST
      const inParts = punchInUtc
        ? utcIsoToIstTimeParts(punchInUtc)
        : { hour: '09', minute: '00', ampm: 'AM' };
      const outParts = punchOutUtc
        ? utcIsoToIstTimeParts(punchOutUtc)
        : { hour: '06', minute: '00', ampm: 'PM' };

      setTimeParts({
        punchIn: inParts,
        punchOut: outParts
      });
    } else {
      setApprovedPunchIn(null);
      setApprovedPunchOut(null);
      setFieldVisibility({ showPunchIn: true, showPunchOut: true });
      setTimeParts({
        punchIn: { hour: '12', minute: '00', ampm: 'AM' },
        punchOut: { hour: '12', minute: '00', ampm: 'PM' }
      });
    }

    setModalOpen(true);
  }, []);

  const handleApprove = useCallback((row) => openModal('approve', row), [openModal]);
  const handleReject = useCallback((row) => openModal('reject', row), [openModal]);

  const handleTimeChange = useCallback((field, part, value) => {
    const currentParts = timeParts[field];
    const newHour = part === 'hour' ? value : currentParts.hour;
    const newMinute = part === 'minute' ? value : currentParts.minute;
    const newAmpm = part === 'ampm' ? value : currentParts.ampm;

    setTimeParts(prev => ({
      ...prev,
      [field]: { ...prev[field], [part]: value }
    }));

    // Both punches share the same (single) date
    const dateStr = getSharedIstDateStr(approvedPunchIn, approvedPunchOut);
    if (!dateStr) return;

    const newUtc = buildUtcIsoFromIstParts(dateStr, newHour, newMinute, newAmpm);
    if (field === 'punchIn') {
      setApprovedPunchIn(newUtc);
    } else {
      setApprovedPunchOut(newUtc);
    }
  }, [approvedPunchIn, approvedPunchOut, timeParts]);

  const confirmAction = useCallback(async () => {
    if (!selectedRequest) return;

    if (modalType === 'approve') {
      if (!approvalRemark.trim()) {
        alert('Please enter an approval remark.');
        return;
      }
      if (fieldVisibility.showPunchIn && !approvedPunchIn) {
        alert('Please enter the punch in time.');
        return;
      }
      if (fieldVisibility.showPunchOut && !approvedPunchOut) {
        alert('Please enter the punch out time.');
        return;
      }
      if (approvedPunchIn && approvedPunchOut) {
        const inDate = new Date(approvedPunchIn);
        const outDate = new Date(approvedPunchOut);
        if (outDate <= inDate) {
          alert('Punch out time must be after punch in time.');
          return;
        }
      }

      const payload = { approvalRemark: approvalRemark.trim(), approvedPunchIn, approvedPunchOut };
      setIsSubmitting(true);
      try {
        await approveRequest(selectedRequest.id, payload);
        setModalOpen(false);
      } catch (err) {
        alert('Failed to approve. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else if (modalType === 'reject') {
      if (!rejectionRemark.trim()) {
        alert('Please enter a rejection remark.');
        return;
      }
      const rejectPayload = rejectionRemark.trim();
      setIsSubmitting(true);
      try {
        await rejectRequest(selectedRequest.id, rejectPayload);
        setModalOpen(false);
      } catch (err) {
        alert('Failed to reject. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [selectedRequest, modalType, approvalRemark, approvedPunchIn, approvedPunchOut, rejectionRemark, fieldVisibility, approveRequest, rejectRequest]);

  const closeModal = useCallback(() => {
    if (!isSubmitting) {
      setModalOpen(false);
      setSelectedRequest(null);
      setModalType(null);
    }
  }, [isSubmitting]);

  // ---- Columns ----
  const columns = getLeaveManagementColumns({
    onApprove: handleApprove,
    onReject: handleReject,
    originalTimesMap: originalTimesRef.current,
  });

  // ---- Pagination handlers ----
  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) setPage(pageNum);
  };
  const goToPrev = () => { if (hasPrev) setPage(currentPage - 1); };
  const goToNext = () => { if (hasNext) setPage(currentPage + 1); };

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  // The single date shown once in the modal
  const sharedDateStr = getSharedIstDateStr(approvedPunchIn, approvedPunchOut);

  // ---- Render ----
  return (
    <div className="space-y-6">
      {loading && <Loading message="Loading requests..." />}
      {error && <GettingError error={error} onRetry={refetch} />}

      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl overflow-hidden">
        {/* Header / Filters */}
        <div className="p-6 border-b border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Left side: search bar */}
            <div className="flex items-center gap-3">
              <div className="relative w-106">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4EA1FF] pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 text-white placeholder-white/30 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors duration-200 text-sm font-medium"
                />
              </div>
            </div>

            {/* Right side: filter dropdown */}
            <div className="relative min-w-[170px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none bg-white/5 text-white border border-white/10 rounded-xl pl-10 pr-9 py-2.5 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors duration-200 text-sm font-medium"
              >
                <option value="All" className="text-white bg-[#0B3260]">All Status</option>
                <option value="Pending" className="text-white bg-[#0B3260]">Pending</option>
                <option value="Approved" className="text-white bg-[#0B3260]">Approved</option>
                <option value="Rejected" className="text-white bg-[#0B3260]">Rejected</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table area */}
        <div className="p-0">
          <div className="p-0">
            <Table
              columns={columns}
              data={requests}
              emptyMessage={
                <div className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/60 font-medium">No requests found</p>
                  <p className="text-sm text-white/30 mt-1">No regularization requests match your criteria</p>
                </div>
              }
              className="text-white"
            />
          </div>

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="px-6 py-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="text-white/50 text-sm">
                Showing {startItem}–{endItem} of {totalItems} entries
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrev}
                  disabled={!hasPrev}
                  className={`p-2 rounded-lg transition-colors ${
                    hasPrev
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-white/5 text-white/30 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft size={18} />
                </button>

                {(() => {
                  const delta = 2;
                  let start = Math.max(1, currentPage - delta);
                  let end = Math.min(totalPages, currentPage + delta);
                  if (end - start < 4) {
                    if (start === 1) {
                      end = Math.min(totalPages, start + 4);
                    } else if (end === totalPages) {
                      start = Math.max(1, end - 4);
                    }
                  }
                  const pageNumbers = [];
                  for (let i = start; i <= end; i++) {
                    pageNumbers.push(i);
                  }
                  return pageNumbers.map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        pageNum === currentPage
                          ? 'bg-white/20 text-white font-semibold'
                          : 'bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ));
                })()}

                <button
                  onClick={goToNext}
                  disabled={!hasNext}
                  className={`p-2 rounded-lg transition-colors ${
                    hasNext
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-white/5 text-white/30 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="text-center text-xs text-white/30 py-4 border-t border-white/10 font-mono">
        <p>© {new Date().getFullYear()} Attendance Regularization — data is tracked securely.</p>
      </footer>

      {/* Modal */}
      {modalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0B3260]/95 backdrop-blur-xl border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl shadow-black/50 max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${
                  modalType === 'approve'
                    ? 'from-[#34D399]/20 to-[#22D3EE]/10 text-[#34D399]'
                    : 'from-[#FB7185]/20 to-[#FB7185]/5 text-[#FB7185]'
                }`}>
                  {modalType === 'approve'
                    ? <CheckCircle className="h-5 w-5" />
                    : <XCircle className="h-5 w-5" />
                  }
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-white tracking-tight">
                    {modalType === 'approve' ? 'Approve Request' : 'Reject Request'}
                  </h3>
                  <p className="text-xs text-[#8FB3DA] font-medium">
                    {selectedRequest.employeeName} • {selectedRequest.employeeId}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                disabled={isSubmitting}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors duration-200 disabled:opacity-50 border border-white/10"
              >
                <X className="h-4 w-4 text-[#8FB3DA]" />
              </button>
            </div>

            {/* Request context */}
            <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8FB3DA]">
                  Request Type
                </span>
                <span className="text-xs font-medium text-[#4EA1FF]">
                  {REQUEST_TYPE_LABELS[selectedRequest.requestType] || selectedRequest.requestType || '-'}
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <MessageSquareQuote className="h-3.5 w-3.5 text-[#8FB3DA] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-[#A9C6EA] leading-relaxed">
                  {selectedRequest.reason || 'No reason provided.'}
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="space-y-4">
              {modalType === 'approve' ? (
                <>
                  <div>
                    <label className="text-xs font-medium text-[#A9C6EA] block mb-1.5">
                      Approval Remark <span className="text-[#FB7185]">*</span>
                    </label>
                    <textarea
                      rows="2"
                      value={approvalRemark}
                      onChange={(e) => setApprovalRemark(e.target.value)}
                      className="w-full bg-[#0E3A6E]/80 text-white border border-white/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA1FF]/40 focus:border-[#4EA1FF]/40 placeholder-[#8FB3DA]/60 resize-none"
                      placeholder="e.g., Verified with CCTV footage"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Single shared date (shown only once) */}
                  <div>
                    <label className="text-xs font-medium text-[#A9C6EA] block mb-1.5">
                      Date
                    </label>
                    <div className="w-full bg-[#0E3A6E]/80 text-white border border-white/15 rounded-xl px-3 py-2 text-sm font-medium">
                      {formatDateLabel(sharedDateStr)}
                    </div>
                  </div>

                  {/* Punch In */}
                  {fieldVisibility.showPunchIn ? (
                    <div>
                      <label className="text-xs font-medium text-[#A9C6EA] block mb-1.5">
                        Punch In <span className="text-[#FB7185]">*</span>
                      </label>
                      <div className="flex items-center gap-1">
                        <select
                          value={timeParts.punchIn.hour}
                          onChange={(e) => handleTimeChange('punchIn', 'hour', e.target.value)}
                          className="flex-1 bg-[#0E3A6E]/80 text-white border border-white/15 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA1FF]/40"
                          disabled={isSubmitting}
                        >
                          {[...Array(12)].map((_, i) => {
                            const h = (i + 1).toString();
                            return <option key={h} value={h}>{h}</option>;
                          })}
                        </select>
                        <span className="text-white">:</span>
                        <select
                          value={timeParts.punchIn.minute}
                          onChange={(e) => handleTimeChange('punchIn', 'minute', e.target.value)}
                          className="flex-1 bg-[#0E3A6E]/80 text-white border border-white/15 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA1FF]/40"
                          disabled={isSubmitting}
                        >
                          {[...Array(60)].map((_, i) => {
                            const m = i.toString().padStart(2, '0');
                            return <option key={m} value={m}>{m}</option>;
                          })}
                        </select>
                        <select
                          value={timeParts.punchIn.ampm}
                          onChange={(e) => handleTimeChange('punchIn', 'ampm', e.target.value)}
                          className="bg-[#0E3A6E]/80 text-white border border-white/15 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA1FF]/40"
                          disabled={isSubmitting}
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-medium text-[#8FB3DA] flex items-center gap-1 mb-1.5">
                        <Lock className="h-3 w-3" /> Punch In
                      </label>
                      <div className="w-full bg-white/5 text-[#A9C6EA] border border-white/10 rounded-xl px-3 py-2 text-sm">
                        {formatChip(selectedRequest.existingPunchIn)}
                      </div>
                    </div>
                  )}

                  {/* Punch Out */}
                  {fieldVisibility.showPunchOut ? (
                    <div>
                      <label className="text-xs font-medium text-[#A9C6EA] block mb-1.5">
                        Punch Out <span className="text-[#FB7185]">*</span>
                      </label>
                      <div className="flex items-center gap-1">
                        <select
                          value={timeParts.punchOut.hour}
                          onChange={(e) => handleTimeChange('punchOut', 'hour', e.target.value)}
                          className="flex-1 bg-[#0E3A6E]/80 text-white border border-white/15 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA1FF]/40"
                          disabled={isSubmitting}
                        >
                          {[...Array(12)].map((_, i) => {
                            const h = (i + 1).toString();
                            return <option key={h} value={h}>{h}</option>;
                          })}
                        </select>
                        <span className="text-white">:</span>
                        <select
                          value={timeParts.punchOut.minute}
                          onChange={(e) => handleTimeChange('punchOut', 'minute', e.target.value)}
                          className="flex-1 bg-[#0E3A6E]/80 text-white border border-white/15 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA1FF]/40"
                          disabled={isSubmitting}
                        >
                          {[...Array(60)].map((_, i) => {
                            const m = i.toString().padStart(2, '0');
                            return <option key={m} value={m}>{m}</option>;
                          })}
                        </select>
                        <select
                          value={timeParts.punchOut.ampm}
                          onChange={(e) => handleTimeChange('punchOut', 'ampm', e.target.value)}
                          className="bg-[#0E3A6E]/80 text-white border border-white/15 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA1FF]/40"
                          disabled={isSubmitting}
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-medium text-[#8FB3DA] flex items-center gap-1 mb-1.5">
                        <Lock className="h-3 w-3" /> Punch Out
                      </label>
                      <div className="w-full bg-white/5 text-[#A9C6EA] border border-white/10 rounded-xl px-3 py-2 text-sm">
                        {formatChip(selectedRequest.existingPunchOut)}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-[#8FB3DA]/70 flex items-center gap-1.5 font-medium">
                    <Clock className="h-3 w-3" />
                    Times shown in <strong className="text-white">IST</strong> (12‑hour format). Punch Out must be after Punch In.
                  </p>
                </>
              ) : (
                <div>
                  <label className="text-xs font-medium text-[#A9C6EA] block mb-1.5">
                    Rejection Remark <span className="text-[#FB7185]">*</span>
                  </label>
                  <textarea
                    rows="3"
                    value={rejectionRemark}
                    onChange={(e) => setRejectionRemark(e.target.value)}
                    className="w-full bg-[#0E3A6E]/80 text-white border border-white/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA1FF]/40 focus:border-[#4EA1FF]/40 placeholder-[#8FB3DA]/60 resize-none"
                    placeholder="Provide reason for rejection..."
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
              <button
                onClick={closeModal}
                disabled={isSubmitting}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-[#A9C6EA] rounded-xl text-sm font-semibold transition-all duration-200 border border-white/10 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={isSubmitting}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center gap-2 ${
                  modalType === 'approve'
                    ? 'bg-gradient-to-r from-[#34D399] to-[#22D3EE] hover:shadow-xl hover:shadow-[#34D399]/25'
                    : 'bg-gradient-to-r from-[#FB7185] to-[#F43F5E] hover:shadow-xl hover:shadow-[#FB7185]/25'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  modalType === 'approve' ? 'Confirm Approve' : 'Confirm Reject'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;