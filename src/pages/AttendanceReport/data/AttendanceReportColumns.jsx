// File: src\pages\AttendanceReport\data\AttendanceReportColumns.jsx

export const getAttendanceReportColumns = ({ monthDays = [] }) => {
  // Get today's date in local timezone as YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
  };

  // Normalize date to YYYY-MM-DD
  // This avoids timezone-related date changes.
  const normalizeDate = (dateValue) => {
    if (!dateValue) {
      return null;
    }

    const value = String(dateValue).trim();

    // If API already provides YYYY-MM-DD or an ISO date
    // beginning with YYYY-MM-DD, use the date directly.
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (match) {
      return match[1] + "-" + match[2] + "-" + match[3];
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return null;
    }

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

    if (!normalizedDate) {
      return false;
    }

    return normalizedDate === getTodayDate();
  };

  // Build a full, human-readable date string for tooltips.
  const buildFullDate = (dateValue) => {
    const normalizedDate = normalizeDate(dateValue);

    if (!normalizedDate) {
      return "";
    }

    const [year, month, day] = normalizedDate.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);

    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Base columns
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

  // Dynamic day columns with day names
  const dayColumns = monthDays.map((dayInfo) => ({
    header: (
      <div className="flex flex-col items-center min-w-[40px]">
        <span className="text-xs font-medium text-gray-400">
          {dayInfo.dayName}
        </span>

        <span className="text-[10px] text-gray-500">
          {dayInfo.day}
        </span>
      </div>
    ),

    render: (row) => {
      // Resolve the tooltip date (prefer the one passed from monthDays,
      // otherwise build it from the raw date value).
      const tooltipDate = dayInfo.fullDate || buildFullDate(dayInfo.date);

      // Find attendance for this date
      const attendanceRecord = row.attendance?.find(
        (record) =>
          normalizeDate(record.date) === normalizeDate(dayInfo.date)
      );

      /*
       * ============================================================
       * NO ATTENDANCE RECORD FOR THIS DATE
       * ============================================================
       *
       * We no longer force "P" for today's date. If the API did not
       * return a record for this date, display a neutral "-".
       */
      if (!attendanceRecord) {
        return (
          <div className="flex items-center justify-center group relative">
            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-500/20 text-gray-400 w-8 text-center cursor-help">
              -
            </span>

            {/* Tooltip showing full date */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-[10px] rounded-md px-2 py-1 max-w-xs whitespace-normal z-50 shadow-lg">
              <div className="font-semibold">{tooltipDate}</div>
              <div className="mt-1">No record</div>
            </div>
          </div>
        );
      }

      const status = attendanceRecord.attendanceStatus;

      /*
       * ============================================================
       * STATUS MAPPING
       * ============================================================
       *
       * The API is the single source of truth. We map every status
       * to a display label + colour and NEVER override it based on
       * whether the date is "today".
       */

      // Map status to display
      let bgColor = "bg-gray-500/20 text-gray-400";
      let label = "-";
      let tooltipText = status || "Unknown";

      // switch (status) {
      //   case "PRESENT": {
      //     // Check if the employee has punched out
      //     const hasPunchOut =
      //       attendanceRecord.lastPunchOutLocal ||
      //       attendanceRecord.lastPunchOut;

      //     if (hasPunchOut) {
      //       bgColor = "bg-green-500/20 text-green-400";
      //       label = "P";
      //       tooltipText = "Present";
      //     } else {
      //       bgColor = "bg-orange-500/20 text-orange-400";
      //       label = "NA";
      //       tooltipText = "Not Punched Out";
      //     }

      //     break;
      //   }

      //   case "ABSENT":
      //     bgColor = "bg-red-500/20 text-red-400";
      //     label = "A";
      //     tooltipText = "Absent";
      //     break;

      //   case "WEEK_OFF":
      //     bgColor = "bg-blue-500/20 text-blue-400";
      //     label = "W";
      //     tooltipText = "Week Off";
      //     break;

      //   case "HOLIDAY":
      //     bgColor = "bg-purple-500/20 text-purple-400";
      //     label = "H";
      //     tooltipText = "Holiday";
      //     break;

      //   case "ON_LEAVE":
      //     bgColor = "bg-yellow-500/20 text-yellow-400";
      //     label = "L";
      //     tooltipText = "Leave";
      //     break;

      //   case "HALF_DAY":
      //     bgColor = "bg-orange-500/20 text-orange-400";
      //     label = "HD";
      //     tooltipText = "Half Day";
      //     break;

      //   case "SHORT_LEAVE":
      //     bgColor = "bg-cyan-500/20 text-cyan-400";
      //     label = "SL";
      //     tooltipText = "Short Leave";
      //     break;

      //   case "NOT_JOINED":
      //     bgColor = "bg-gray-500/20 text-gray-400";
      //     label = "-";
      //     tooltipText = "Not Joined";
      //     break;

      //   default:
      //     bgColor = "bg-gray-500/20 text-gray-400";
      //     label = "-";
      //     tooltipText = status || "Unknown";
      // }

      switch (status) {
        case "PRESENT": {
          // A "PRESENT" record with no punch-out is normal for a live
          // employee who is still working. Only flag it as "Not Punched Out"
          // if the attendance day has clearly ended (i.e., the date is in
          // the past) AND there's still no punch-out.
          const hasPunchOut =
            attendanceRecord.lastPunchOutLocal ||
            attendanceRecord.lastPunchOut;

          // Is this date strictly before today?
          const normalizedDate = normalizeDate(attendanceRecord.date);
          const today = getTodayDate();
          const isPastDay = normalizedDate && normalizedDate < today;

          if (hasPunchOut) {
            bgColor = "bg-green-500/20 text-green-400";
            label = "P";
            tooltipText = "Present";
          } else if (isPastDay) {
            // Past day, punched in but never punched out → real anomaly
            bgColor = "bg-orange-500/20 text-orange-400";
            label = "NA";
            tooltipText = "Not Punched Out";
          } else {
            // Today, punched in, still working → just show Present
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

      // Add remarks to tooltip if available
      if (attendanceRecord.remarks) {
        tooltipText = tooltipText + " - " + attendanceRecord.remarks;
      }

      // Add punch-in time if available
      if (attendanceRecord.firstPunchIn) {
        const punchTime = new Date(
          attendanceRecord.firstPunchIn
        ).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });

        tooltipText = tooltipText + " | In: " + punchTime;
      }

      // Add punch-out time if available
      if (attendanceRecord.lastPunchOut) {
        const punchOutTime = new Date(
          attendanceRecord.lastPunchOut
        ).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });

        tooltipText = tooltipText + " | Out: " + punchOutTime;
      } else if (status === "PRESENT") {
        // If present but no punch-out, add a note
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

          {/* Tooltip showing full date and status */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-[10px] rounded-md px-2 py-1 max-w-xs whitespace-normal z-50 shadow-lg">
            <div className="font-semibold">{tooltipDate}</div>
            <div className="mt-1">{tooltipText}</div>
          </div>
        </div>
      );
    },
  }));

  // Summary columns
  const summaryColumns = [
    {
      header: "Present",
      render: (row) => (
        <span className="text-green-400 font-semibold">
          {row.summary?.present || 0}
        </span>
      ),
    },

    {
      header: "Not Punched Out",
      render: (row) => (
        <span className="text-orange-400 font-semibold">
          {row.summary?.notPunchedOut || 0}
        </span>
      ),
    },

    {
      header: "Absent",
      render: (row) => (
        <span className="text-red-400 font-semibold">
          {row.summary?.absent || 0}
        </span>
      ),
    },

    {
      header: "Half Day",
      render: (row) => (
        <span className="text-orange-400 font-semibold">
          {row.summary?.halfDay || 0}
        </span>
      ),
    },

    {
      header: "Short Leave",
      render: (row) => (
        <span className="text-cyan-400 font-semibold">
          {row.summary?.shortLeave || 0}
        </span>
      ),
    },

    {
      header: "Week Off",
      render: (row) => (
        <span className="text-blue-400 font-semibold">
          {row.summary?.weekOff || 0}
        </span>
      ),
    },

    {
      header: "Holiday",
      render: (row) => (
        <span className="text-purple-400 font-semibold">
          {row.summary?.holiday || 0}
        </span>
      ),
    },

    {
      header: "Leave",
      render: (row) => (
        <span className="text-yellow-400 font-semibold">
          {row.summary?.onLeave || 0}
        </span>
      ),
    },

    {
      header: "Total",
      render: (row) => {
        const total =
          (row.summary?.present || 0) +
          (row.summary?.absent || 0) +
          (row.summary?.halfDay || 0) +
          (row.summary?.shortLeave || 0) +
          (row.summary?.weekOff || 0) +
          (row.summary?.holiday || 0) +
          (row.summary?.onLeave || 0);

        return (
          <span className="text-white font-semibold">
            {total || 0}
          </span>
        );
      },
    },
  ];

  return [...baseColumns, ...dayColumns, ...summaryColumns];
};