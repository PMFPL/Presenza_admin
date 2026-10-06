import { useMemo, useState } from 'react';
import Loading from '../../../components/common/Loading';
import Table from '../../../components/common/Table';
import { useAttendance } from '../hook/useAttendance';
import AttendenceDetails from './AttendanceDetails';
import GettingError from '../../../components/common/GettingError';
import { captalizeWords } from '../../../utils/captalizeWords';
import ShowFullImage from '../../../components/common/ShowFullImage';
import { Users, UserCheck, UserX, Clock, AlertCircle, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { formatDuration } from '../../../utils/formatedDuration';

// ---------- StatusBadge (copied from your original working file) ----------
const StatusBadge = ({ status, attendanceStatus, morningShortLeave, eveningShortLeave, lateMinutes }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  let primaryStatus = attendanceStatus || status;
  let badgeColor = '';
  let icon = '';
  let tooltipText = '';
  let shortLeaveDetails = [];
  
  if (morningShortLeave?.isShortLeave && morningShortLeave?.minutes > 0) {
    shortLeaveDetails.push(`Morning: ${formatDuration(morningShortLeave.minutes)}`);
  }
  if (eveningShortLeave?.isShortLeave && eveningShortLeave?.minutes > 0) {
    shortLeaveDetails.push(`Evening: ${formatDuration(eveningShortLeave.minutes)}`);
  }
  
  switch (primaryStatus) {
    case 'PRESENT':
      if (lateMinutes > 0) {
        badgeColor = 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        icon = '⏳';
        tooltipText = `Late Arrival: ${formatDuration(lateMinutes)}`;
      } else {
        badgeColor = 'bg-green-500/20 text-green-400 border-green-500/30';
        icon = '✅';
        tooltipText = 'Present';
      }
      break;
    case 'SHORT_LEAVE':
      badgeColor = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      icon = '⏰';
      tooltipText = shortLeaveDetails.length > 0 ? `Short Leave (${shortLeaveDetails.join(', ')})` : 'Short Leave';
      break;
    case 'ABSENT':
      badgeColor = 'bg-red-500/20 text-red-400 border-red-500/30';
      icon = '❌';
      tooltipText = 'Absent';
      break;
    case 'HALF_DAY':
      badgeColor = 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      icon = '🌓';
      tooltipText = 'Half Day';
      break;
    default:
      badgeColor = 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      icon = 'ℹ️';
      tooltipText = captalizeWords(primaryStatus);
  }

  let displayText = '';
  if (primaryStatus === 'SHORT_LEAVE') {
    displayText = 'SL';
    if (shortLeaveDetails.length > 0) {
      const totalMins = (morningShortLeave?.minutes || 0) + (eveningShortLeave?.minutes || 0);
      if (totalMins > 0) {
        displayText += ` (${formatDuration(totalMins)})`;
      }
    }
  } else if (primaryStatus === 'PRESENT' && lateMinutes > 0) {
    displayText = `Late (${formatDuration(lateMinutes)})`;
  } else {
    displayText = captalizeWords(primaryStatus);
  }

  return (
    <div 
      className="relative inline-flex items-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badgeColor} flex items-center gap-1.5`}>
        {icon}
        <span>{displayText}</span>
        {(primaryStatus === 'SHORT_LEAVE' || (primaryStatus === 'PRESENT' && lateMinutes > 0)) && (
          <Info size={12} className="opacity-60 ml-0.5" />
        )}
      </span>
      
      {showTooltip && (primaryStatus === 'SHORT_LEAVE' || (primaryStatus === 'PRESENT' && lateMinutes > 0)) && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-lg shadow-xl border border-white/10 whitespace-nowrap min-w-[150px]">
          <div className="font-medium text-white/90">{tooltipText}</div>
          {shortLeaveDetails.length > 0 && (
            <div className="mt-1 text-yellow-400/80 text-[10px]">
              {shortLeaveDetails.map((detail, i) => (
                <div key={i}>{detail}</div>
              ))}
            </div>
          )}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900/95 border-r border-b border-white/10"></div>
        </div>
      )}
    </div>
  );
};

// ---------- Summary Card ----------
const SummaryCard = ({ icon: Icon, label, value, color, subtitle }) => (
  <div className={`bg-white/5 rounded-xl p-4 border border-white/10 flex items-center gap-4`}>
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

// ---------- Main Component ----------
function Attendance() {
  const {
    today,
    searchEmpId,
    setSearchEmpId,
    departmentFilter,
    setDepartmentFilter,
    dateFilter,
    setDateFilter,
    departments,
    attendanceFilter,
    setAttendanceFilter,
    attendenceStatus,
    loading,
    error,
    isDetails,
    empSession,
    empCode,
    columns: originalColumns,
    closeDetailsPage,
    showFullImage,
    selectedImage,
    closeImage,
    employeeData,
    summaryStats: hookSummaryStats,
    filteredAttendance,
    paginatedData,          // ← use this for the table
    currentPage,
    setPage,
    totalPages,
    totalItems,
    hasNext,
    hasPrev,
    limit,
  } = useAttendance();

  // Enrich only the current page data (paginatedData)
  const enrichedData = useMemo(() => {
    if (!Array.isArray(paginatedData)) return [];
    return paginatedData.map(emp => {
      const isPresent = emp.attendanceStatus === 'PRESENT' || emp.status === 'PRESENT';
      const hasPunchOut = emp.lastPunchOutLocal || emp.lastPunchOut;
      let computedStatus = emp.attendanceStatus || emp.status || 'UNKNOWN';
      if (isPresent && !hasPunchOut) computedStatus = 'NA';
      return { ...emp, computedStatus };
    });
  }, [paginatedData]);

  // Override Status column
  const columns = useMemo(() => {
    if (!originalColumns || originalColumns.length === 0) return [];
    const statusIndex = originalColumns.findIndex(col =>
      col.Header === 'Status' || col.header === 'Status' || col.accessor === 'status'
    );
    if (statusIndex === -1) return originalColumns;
    const newColumns = [...originalColumns];
    newColumns[statusIndex] = {
      ...newColumns[statusIndex],
      Cell: ({ row }) => {
        const emp = row.original;
        const status = emp.computedStatus || emp.attendanceStatus || emp.status || 'UNKNOWN';
        return (
          <StatusBadge
            status={status}
            attendanceStatus={status}
            morningShortLeave={emp.morningShortLeave}
            eveningShortLeave={emp.eveningShortLeave}
            lateMinutes={emp.lateMinutes}
          />
        );
      },
      accessor: 'computedStatus',
    };
    return newColumns;
  }, [originalColumns, enrichedData]);

  // Pagination handlers
  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) setPage(pageNum);
  };
  const goToPrev = () => { if (hasPrev) setPage(currentPage - 1); };
  const goToNext = () => { if (hasNext) setPage(currentPage + 1); };

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  return (
    <>
      {loading && <Loading message="Fetching Employee Attendance..." />}
      {error ? (
        <GettingError error={error} />
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <SummaryCard icon={Users} label="Total Employees" value={hookSummaryStats.total} color="blue" />
            <SummaryCard
              icon={UserCheck}
              label="Present"
              value={hookSummaryStats.present}
              color="green"
              subtitle={hookSummaryStats.total > 0 ? `${Math.round((hookSummaryStats.present / hookSummaryStats.total) * 100)}%` : ''}
            />
            <SummaryCard
              icon={UserX}
              label="Absent"
              value={hookSummaryStats.absent}
              color="red"
              subtitle={hookSummaryStats.total > 0 ? `${Math.round((hookSummaryStats.absent / hookSummaryStats.total) * 100)}%` : ''}
            />
            <SummaryCard icon={Clock} label="Short Leave" value={hookSummaryStats.shortLeave} color="yellow" />
            <SummaryCard icon={AlertCircle} label="Late Arrival" value={hookSummaryStats.late} color="orange" />
          </div> */}

          {/* Main Table */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl overflow-hidden">
            {/* Filters */}
            <div className="p-6 border-b border-white/10">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex-1 min-w-[200px] max-w-md">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by Emp ID or Name..."
                      value={searchEmpId}
                      onChange={(e) => setSearchEmpId(e.target.value)}
                      className="w-full px-4 py-2.5 pl-10 text-white placeholder-white/30 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-200"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 text-white border border-white/10 outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-200 min-w-[150px]"
                  >
                    <option value="" className="text-black">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept} className="text-black">{dept}</option>
                    ))}
                  </select>
                  <select
                    value={attendanceFilter}
                    onChange={(e) => setAttendanceFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 text-white border border-white/10 outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-200 min-w-[150px]"
                  >
                    <option value="" className="text-black">All Status</option>
                    {attendenceStatus.map((st) => (
                      <option key={st} value={st} className="text-black">{captalizeWords(st)}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    max={today}
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 text-white border border-white/10 outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-200 min-w-[180px]"
                  />
                  <span className="text-white/40 text-sm font-mono bg-white/5 px-3 py-2 rounded-xl">
                    {totalItems} records
                  </span>
                </div>
              </div>
            </div>

            {/* Table - uses enrichedData from paginatedData */}
            <div className="p-0">
              <Table columns={columns} data={enrichedData} loading={loading} />
            </div>

            {/* Pagination - uses metadata from filtered data */}
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
      )}

      {/* Modals */}
      {isDetails && (
        <AttendenceDetails
          empCode={empCode}
          sessions={empSession}
          employeeData={employeeData}
          close={closeDetailsPage}
        />
      )}
      {showFullImage && <ShowFullImage close={closeImage} Img={selectedImage} />}
    </>
  );
}

export default Attendance;