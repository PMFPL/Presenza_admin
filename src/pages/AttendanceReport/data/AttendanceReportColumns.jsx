
// File: src\pages\AttendanceReport\data\AttendanceReportColumns.jsx

// ---------- Module-level helpers ----------

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
};

// Normalize any date value to YYYY-MM-DD without timezone shifts.
const normalizeDate = (dateValue) => {
  if (!dateValue) return null;

  const value = String(dateValue).trim();
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return match[1] + "-" + match[2] + "-" + match[3];

  const date = new Date(value);
  if (isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
};

// Check whether a date is today's date.
// NOTE: This is kept for reference / potential future use,
// but is no longer used to override the attendance status.
const isToday = (dateValue) => {
  const normalizedDate = normalizeDate(dateValue);
  if (!normalizedDate) return false;
  return normalizedDate === getTodayDate();
};

// Full human-readable date for tooltips.
const buildFullDate = (dateValue) => {
  const normalizedDate = normalizeDate(dateValue);
  if (!normalizedDate) return "";

  const [year, month, day] = normalizedDate.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);

  return dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Detects if a record should be treated as a Short Leave.
 * Since the backend is not sending explicit SL flags, we use a time-based
 * fallback: if they punched out after 4:30 PM but before 6:30 PM, it's an SL.
 */
const isShortLeaveRecord = (record) => {
  if (!record) return false;

  // 1. Direct Status matches (checking multiple common field names)
  const statusFields = ['attendanceStatus', 'status', 'leaveStatus', 'attendanceType', 'dayStatus'];
  for (const field of statusFields) {
    if (record[field] && typeof record[field] === 'string' && record[field].toUpperCase().includes('SHORT')) {
      return true;
    }
  }

  // 2. Boolean/Flag checks
  const flagFields = ['shortLeave', 'hasShortLeave', 'isShortLeave', 'isSL', 'slFlag'];
  for (const field of flagFields) {
    const val = record[field];
    if (val === true || val === 1 || String(val).toLowerCase() === 'true' || String(val).toLowerCase() === 'yes') {
      return true;
    }
  }

  // 3. Numeric duration checks
  const durationFields = ['shortLeaveHours', 'shortLeaveMinutes', 'shortLeaveDuration', 'slHours', 'slMinutes', 'slDuration', 'shortHours'];
  for (const field of durationFields) {
    if (record[field]) {
       const num = Number(record[field]);
       if (!isNaN(num) && num > 0) return true;
       if (typeof record[field] === 'string' && record[field].trim() !== '' && record[field] !== '0' && record[field] !== '0.0') {
           const str = record[field].toLowerCase();
           if (str.includes('short') || str.includes('hr') || str.includes('min')) {
               return true;
           }
       }
    }
  }

  // 4. Remarks / Reason text
  const textFields = ['remarks', 'remark', 'reason', 'note', 'description', 'leaveReason'];
  for (const field of textFields) {
    if (record[field] && typeof record[field] === 'string' && record[field].toUpperCase().includes('SHORT LEAVE')) {
      return true;
    }
  }

  // 5. Nested Arrays/Objects
  if (Array.isArray(record.shortLeave) && record.shortLeave.length > 0) return true;
  if (Array.isArray(record.shortLeaveDetails) && record.shortLeaveDetails.length > 0) return true;
  
  if (Array.isArray(record.leaves) && record.leaves.some(l => {
     const t = String(l.leaveType || l.type || l.status || l.name || '').toUpperCase();
     return t.includes('SHORT');
  })) return true;

  if (record.shortLeave && typeof record.shortLeave === 'object' && !Array.isArray(record.shortLeave) && Object.keys(record.shortLeave).length > 0) return true;
  if (record.shortLeaveDetails && typeof record.shortLeaveDetails === 'object' && !Array.isArray(record.shortLeaveDetails) && Object.keys(record.shortLeaveDetails).length > 0) return true;

  // 6. FALLBACK: Time-based check (Evening Short Leave)
  // If the backend sends PRESENT, we check the punch-out time.
  if (record.attendanceStatus === "PRESENT") {
    const punchOut = record.lastPunchOutLocal || record.lastPunchOut;
    
    if (punchOut) {
      const punchOutDate = new Date(punchOut);
      if (!isNaN(punchOutDate.getTime())) {
        const hours = punchOutDate.getHours();
        const minutes = punchOutDate.getMinutes();
        const totalMinutes = hours * 60 + minutes;
        
        // 16:30 (4:30 PM) = 990 minutes
        // 18:30 (6:30 PM) = 1110 minutes
        const SL_START_MINS = 16 * 60 + 30; 
        const SL_END_MINS = 18 * 60 + 30; 

        // If they punched out between 4:30 PM and 6:30 PM, it's a Short Leave
        if (totalMinutes >= SL_START_MINS && totalMinutes < SL_END_MINS) {
           return true;
        }
      }
    }
  }

  return false;
};

/**
 * The effective status used for rendering (and export).
 */
export const getEffectiveAttendanceStatus = (record) => {
  if (!record) return "";
  
  // If it's marked PRESENT but our logic determines it's a Short Leave
  if (record.attendanceStatus === "PRESENT" && isShortLeaveRecord(record)) {
    return "SHORT_LEAVE";
  }
  return record.attendanceStatus;
};

/**
 * Compute the summary counts using the effective status.
 */
export const computeAttendanceSummary = (attendance) => {
  const today = getTodayDate();
  const summary = {
    present: 0, notPunchedOut: 0, absent: 0, halfDay: 0,
    shortLeave: 0, weekOff: 0, holiday: 0, onLeave: 0,
  };

  (attendance || []).forEach((r) => {
    const status = getEffectiveAttendanceStatus(r);
    switch (status) {
      case "PRESENT": {
        summary.present++;
        const hasPunchOut = r.lastPunchOutLocal || r.lastPunchOut;
        const normalized = normalizeDate(r.date);
        const isPastDay = normalized && normalized < today;
        if (!hasPunchOut && isPastDay) {
          summary.notPunchedOut++;
        }
        break;
      }
      case "ABSENT": summary.absent++; break;
      case "HALF_DAY": summary.halfDay++; break;
      case "SHORT_LEAVE": summary.shortLeave++; break;
      case "WEEK_OFF": summary.weekOff++; break;
      case "HOLIDAY": summary.holiday++; break;
      case "ON_LEAVE": summary.onLeave++; break;
      default: break;
    }
  });

  return summary;
};

const summaryCache = new WeakMap();
const getRowSummary = (row) => {
  if (!summaryCache.has(row)) {
    summaryCache.set(row, computeAttendanceSummary(row.attendance));
  }
  return summaryCache.get(row);
};

// ---------- Columns ----------

export const getAttendanceReportColumns = ({ monthDays = [] }) => {
  // Base columns.
  const baseColumns = [
    {
      header: "S No",
      render: (_, index) => index + 1,
    },
    {
      header: "Emp Id",
      render: (row) => row.employeeCode || "-",
    },
    {
      header: "Emp Name",
      render: (row) => row.fullName || "-",
    },
    {
      header: "Department",
      render: (row) => row.department?.name || "-",
    },
  ];

  // Dynamic day columns with day names.
  const dayColumns = monthDays.map((dayInfo) => ({
    header: (
      <div className="flex flex-col items-center min-w-[40px]">
        <span className="text-xs font-medium text-gray-400">
          {dayInfo.dayName}
        </span>
        <span className="text-[10px] text-gray-500">{dayInfo.day}</span>
      </div>
    ),

    render: (row) => {
      const tooltipDate = dayInfo.fullDate || buildFullDate(dayInfo.date);

      const attendanceRecord = row.attendance?.find(
        (record) => normalizeDate(record.date) === normalizeDate(dayInfo.date)
      );

      // No attendance record for this date.
      if (!attendanceRecord) {
        return (
          <div className="flex items-center justify-center group relative">
            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-500/20 text-gray-400 w-8 text-center cursor-help">
              -
            </span>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-[10px] rounded-md px-2 py-1 max-w-xs whitespace-normal z-50 shadow-lg">
              <div className="font-semibold">{tooltipDate}</div>
              <div className="mt-1">No record</div>
            </div>
          </div>
        );
      }

      // ✅ Use the EFFECTIVE status (calculates SL if between 4:30 PM - 6:30 PM)
      const status = getEffectiveAttendanceStatus(attendanceRecord);

      let bgColor = "bg-gray-500/20 text-gray-400";
      let label = "-";
      let tooltipText = status || "Unknown";

      switch (status) {
        case "PRESENT": {
          const hasPunchOut =
            attendanceRecord.lastPunchOutLocal || attendanceRecord.lastPunchOut;

          const normalizedDate = normalizeDate(attendanceRecord.date);
          const today = getTodayDate();
          const isPastDay = normalizedDate && normalizedDate < today;

          if (hasPunchOut) {
            bgColor = "bg-green-500/20 text-green-400";
            label = "P";
            tooltipText = "Present";
          } else if (isPastDay) {
            // Past day, punched in but never punched out → real anomaly.
            bgColor = "bg-orange-500/20 text-orange-400";
            label = "NA";
            tooltipText = "Not Punched Out";
          } else {
            // Today, punched in, still working → just show Present.
            bgColor = "bg-green-500/20 text-green-400";
            label = "P";
            tooltipText = "Present";
          }
          break;
        }

        case "ABSENT":
          bgColor = "bg-red-500/20 text-red-400";
          label = "A";
          tooltipText = "Absent";
          break;

        case "WEEK_OFF":
          bgColor = "bg-blue-500/20 text-blue-400";
          label = "W";
          tooltipText = "Week Off";
          break;

        case "HOLIDAY":
          bgColor = "bg-purple-500/20 text-purple-400";
          label = "H";
          tooltipText = "Holiday";
          break;

        case "ON_LEAVE":
          bgColor = "bg-yellow-500/20 text-yellow-400";
          label = "L";
          tooltipText = "Leave";
          break;

        case "HALF_DAY":
          bgColor = "bg-orange-500/20 text-orange-400";
          label = "HD";
          tooltipText = "Half Day";
          break;

        case "SHORT_LEAVE":
          bgColor = "bg-cyan-500/20 text-cyan-400";
          label = "SL";
          tooltipText = "Short Leave";
          break;

        case "NOT_JOINED":
          bgColor = "bg-gray-500/20 text-gray-400";
          label = "-";
          tooltipText = "Not Joined";
          break;

        default:
          bgColor = "bg-gray-500/20 text-gray-400";
          label = "-";
          tooltipText = status || "Unknown";
      }

      // Add remarks to tooltip if available.
      if (attendanceRecord.remarks) {
        tooltipText = tooltipText + " - " + attendanceRecord.remarks;
      }

      // Add punch-in time if available.
      if (attendanceRecord.firstPunchIn) {
        const punchTime = new Date(
          attendanceRecord.firstPunchIn
        ).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        tooltipText = tooltipText + " | In: " + punchTime;
      }

      // Add punch-out time if available.
      if (attendanceRecord.lastPunchOut) {
        const punchOutTime = new Date(
          attendanceRecord.lastPunchOut
        ).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        tooltipText = tooltipText + " | Out: " + punchOutTime;
      } else if (status === "PRESENT") {
        tooltipText = tooltipText + " | Out: Not punched out";
      }

      return (
        <div className="flex items-center justify-center group relative">
          <span
            className={
              "px-2 py-1 rounded text-xs font-medium " +
              bgColor +
              " w-8 text-center cursor-help"
            }
          >
            {label}
          </span>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-[10px] rounded-md px-2 py-1 max-w-xs whitespace-normal z-50 shadow-lg">
            <div className="font-semibold">{tooltipDate}</div>
            <div className="mt-1">{tooltipText}</div>
          </div>
        </div>
      );
    },
  }));

  // Summary columns — computed from effective status via getRowSummary.
  const summaryColumns = [
    {
      header: "Present",
      render: (row) => (
        <span className="text-green-400 font-semibold">
          {getRowSummary(row).present}
        </span>
      ),
    },
    {
      header: "Not Punched Out",
      render: (row) => (
        <span className="text-orange-400 font-semibold">
          {getRowSummary(row).notPunchedOut}
        </span>
      ),
    },
    {
      header: "Absent",
      render: (row) => (
        <span className="text-red-400 font-semibold">
          {getRowSummary(row).absent}
        </span>
      ),
    },
    {
      header: "Half Day",
      render: (row) => (
        <span className="text-orange-400 font-semibold">
          {getRowSummary(row).halfDay}
        </span>
      ),
    },
    {
      header: "Short Leave",
      render: (row) => (
        <span className="text-cyan-400 font-semibold">
          {getRowSummary(row).shortLeave}
        </span>
      ),
    },
    {
      header: "Week Off",
      render: (row) => (
        <span className="text-blue-400 font-semibold">
          {getRowSummary(row).weekOff}
        </span>
      ),
    },
    {
      header: "Holiday",
      render: (row) => (
        <span className="text-purple-400 font-semibold">
          {getRowSummary(row).holiday}
        </span>
      ),
    },
    {
      header: "Leave",
      render: (row) => (
        <span className="text-yellow-400 font-semibold">
          {getRowSummary(row).onLeave}
        </span>
      ),
    },
    {
      header: "Total",
      render: (row) => {
        const s = getRowSummary(row);
        const total =
          s.present +
          s.absent +
          s.halfDay +
          s.shortLeave +
          s.weekOff +
          s.holiday +
          s.onLeave;
        return (
          <span className="text-white font-semibold">{total || 0}</span>
        );
      },
    },
  ];

  return [...baseColumns, ...dayColumns, ...summaryColumns];
};
