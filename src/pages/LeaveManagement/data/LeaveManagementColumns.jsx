import { FaCheck, FaTimes, FaClock } from 'react-icons/fa';

export const REQUEST_TYPE_LABELS = {
  MISSING_PUNCH_IN: 'Missing Punch In',
  MISSING_PUNCH_OUT: 'Missing Punch Out',
  MISSING_BOTH: 'Missing Both',
  WRONG_PUNCH_TIME: 'Wrong Punch Time',
  ABSENT_MARKED: 'Absent Marked',
};

const REQUEST_TYPE_STYLES = {
  MISSING_PUNCH_IN: 'bg-[#4EA1FF]/15 text-[#4EA1FF] border-[#4EA1FF]/30',
  MISSING_PUNCH_OUT: 'bg-[#22D3EE]/15 text-[#22D3EE] border-[#22D3EE]/30',
  MISSING_BOTH: 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/30',
  WRONG_PUNCH_TIME: 'bg-[#A78BFA]/15 text-[#A78BFA] border-[#A78BFA]/30',
  ABSENT_MARKED: 'bg-[#FB7185]/15 text-[#FB7185] border-[#FB7185]/30',
};

// Format date only (DD/MM/YYYY) in IST
const formatDateOnly = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Format full datetime (DD/MM/YYYY, HH:mm AM/PM) in IST – kept for other uses
const formatDateTimeIST = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// Format time in IST (for original timings)
const formatTimeOnly = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// Format time in UTC (for approved timings)
const formatUtcTime = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleTimeString('en-US', {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// Format requested punches literally (no timezone shift)
const formatLiteralTime = (isoStr) => {
  if (!isoStr) return '-';
  const match = isoStr.match(/T(\d{2}:\d{2})/);
  if (!match) return '-';
  let [hour, minute] = match[1].split(':').map(Number);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
};

export const getLeaveManagementColumns = ({
  onApprove,
  onReject,
  originalTimesMap,
  statusFilter,               // ← passed from LeaveManagement
}) => {
  // Show "Remark by Admin" only when the filter is NOT "Pending"
  const showAdminRemark = statusFilter !== 'Pending';

  return [
    {
      header: 'S No',
      render: (_, index) => (
        <span className="text-left text-xs font-medium text-[#8FB3DA]">
          {index + 1}
        </span>
      ),
    },
    {
      header: 'Employee',
      render: (row) => (
        <div className="flex items-center gap-3 text-left">
          <div>
            <div className="text-sm font-semibold text-white">{row.employeeName}</div>
            <div className="text-xs text-[#8FB3DA]">{row.employeeId}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Request Type',
      render: (row) => {
        const style = REQUEST_TYPE_STYLES[row.requestType] || 'bg-white/10 text-[#A9C6EA] border-white/15';
        const label = REQUEST_TYPE_LABELS[row.requestType] || row.requestType || '-';
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${style}`}>
            {label}
          </span>
        );
      },
    },
    {
      header: 'Request Date',
      render: (row) => (
        <div className="text-left text-sm text-[#A9C6EA]">
          {formatDateOnly(row.requestDate)}
        </div>
      ),
    },
    // ----- RAISED ON – date only (no time) -----
    {
      header: 'Raised On',
      render: (row) => {
        // The raw API object is stored under row.raw by your hook
        const created = row.raw?.createdAt || row.createdAt || null;
        return (
          <div className="text-left text-sm text-[#A9C6EA]">
            {created ? formatDateOnly(created) : '-'}
          </div>
        );
      },
    },
    // ----- ORIGINAL TIMINGS -----
    {
      header: 'Original Timings',
      render: (row) => {
        console.log("row--0-------->", row);

        // MISSING_BOTH → hide both
        const isMissingBoth    = row.requestType === 'MISSING_BOTH';
        // WRONG_PUNCH_TIME → hide Out
        const isWrongPunchTime = row.requestType === 'WRONG_PUNCH_TIME';

        let punchIn, punchOut;
        if (originalTimesMap && originalTimesMap.has(row.id)) {
          const orig = originalTimesMap.get(row.id);
          console.log("orig===================", orig);
          punchIn  = orig.punchIn;
          punchOut = orig.punchOut;
        } else {
          punchIn  = row.existingPunchIn  || row.attendanceId?.firstPunchIn  || null;
          punchOut = row.existingPunchOut || row.attendanceId?.lastPunchOut || null;
        }

        // autoPunchedOut / manualPunchedOut live inside sessions[]
        const sessions = row.attendanceId?.sessions || [];
        const isAutoPunchedOut = sessions.some((s) => s.autoPunchedOut === true);

        // If BOTH real timings exist → always show them (overrides the hide rules)
        const hasBothPunches = !!punchIn && !!punchOut;

        // ---- FINAL RENDER ----
        const inTime = isMissingBoth || !punchIn
          ? '-'
          : formatTimeOnly(punchIn);

        const shouldHideOut =
          !hasBothPunches &&
          (isMissingBoth || isWrongPunchTime || isAutoPunchedOut || !punchOut);

        const outTime = shouldHideOut ? '-' : formatTimeOnly(punchOut);

        console.log("hasBothPunches----->", hasBothPunches);
        console.log("isMissingBoth----->", isMissingBoth);
        console.log("isWrongPunchTime----->", isWrongPunchTime);
        console.log("isAutoPunchedOut----->", isAutoPunchedOut);
        console.log("inTime----->", inTime, " outTime----->", outTime);

        return (
          <div className="text-left space-y-0.5 text-sm text-[#A9C6EA]">
            <div>In: {inTime}</div>
            <div>Out: {outTime}</div>
          </div>
        );
      },
    },
    {
      header: 'Requested In/Out',
      render: (row) => {
        const reqIn = row.requestedPunchIn ? formatLiteralTime(row.requestedPunchIn) : '-';
        const reqOut = row.requestedPunchOut ? formatLiteralTime(row.requestedPunchOut) : '-';
        return (
          <div className="text-left space-y-0.5 text-sm text-[#FBBF24]">
            <div>In: {reqIn}</div>
            <div>Out: {reqOut}</div>
          </div>
        );
      },
    },
    {
      header: 'Approved In/Out',
      render: (row) => {
        const appIn = row.approvedPunchIn
          ? new Date(row.approvedPunchIn).toLocaleTimeString('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })
          : '-';

        const appOut = row.approvedPunchOut
          ? new Date(row.approvedPunchOut).toLocaleTimeString('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })
          : '-';

        return (
          <div className="text-left space-y-0.5 text-sm text-[#34D399]">
            <div>In: {appIn}</div>
            <div>Out: {appOut}</div>
          </div>
        );
      },
    },
    {
      header: 'Reason by Employee',
      render: (row) => (
        <div
          className="text-left max-w-xs truncate text-sm text-[#A9C6EA]"
          title={row.reason}
        >
          {row.reason || '-'}
        </div>
      ),
    },
    // ---- Remark by Admin: only included when filter is NOT "Pending" ----
    ...(showAdminRemark
      ? [
          {
            header: 'Remark by Admin',
            render: (row) => {
              // Show the remark ONLY when the request has been approved
              if (row.status !== 'Approved') {
                return (
                  <span className="text-left text-xs text-[#8FB3DA]/70 italic">
                    —
                  </span>
                );
              }

              const remark = row.approvalRemark || row.raw?.approvalRemark || null;

              if (!remark) {
                return (
                  <span className="text-left text-xs text-[#8FB3DA]/70 italic">
                    —
                  </span>
                );
              }

              return (
                <div
                  className="text-left max-w-xs truncate text-sm text-[#34D399]"
                  title={remark}
                >
                  {remark}
                </div>
              );
            },
          },
        ]
      : []),
    {
      header: 'Status',
      render: (row) => {
        const status = row.status;
        let bgColor = 'bg-white/10 text-[#A9C6EA]';
        let icon = null;
        let borderColor = 'border-white/15';

        if (status === 'Pending') {
          bgColor = 'bg-[#FBBF24]/20 text-[#FBBF24]';
          borderColor = 'border-[#FBBF24]/30';
          icon = <FaClock className="mr-1.5 h-2.5 w-2.5" />;
        } else if (status === 'Approved') {
          bgColor = 'bg-[#34D399]/20 text-[#34D399]';
          borderColor = 'border-[#34D399]/30';
          icon = <FaCheck className="mr-1.5 h-2.5 w-2.5" />;
        } else if (status === 'Rejected') {
          bgColor = 'bg-[#FB7185]/20 text-[#FB7185]';
          borderColor = 'border-[#FB7185]/30';
          icon = <FaTimes className="mr-1.5 h-2.5 w-2.5" />;
        }

        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${bgColor} ${borderColor}`}>
            {icon}
            {status}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      render: (row) => {
        if (row.status !== 'Pending') {
          return (
            <span className="text-left text-xs text-[#8FB3DA]/70 italic">No action</span>
          );
        }
        return (
          <div className="text-left flex gap-2">
            <button
              onClick={() => onApprove(row)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#34D399]/20 hover:bg-[#34D399]/30 text-[#34D399] rounded-lg text-xs font-medium transition-all duration-300 border border-[#34D399]/30 hover:border-[#34D399]/50 hover:scale-105"
            >
              <FaCheck className="h-2.5 w-2.5" />
              Approve
            </button>
            <button
              onClick={() => onReject(row)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FB7185]/20 hover:bg-[#FB7185]/30 text-[#FB7185] rounded-lg text-xs font-medium transition-all duration-300 border border-[#FB7185]/30 hover:border-[#FB7185]/50 hover:scale-105"
            >
              <FaTimes className="h-2.5 w-2.5" />
              Reject
            </button>
          </div>
        );
      },
    },
  ];
};