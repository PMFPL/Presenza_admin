import { Eye, Info } from "lucide-react";
import { createPortal } from "react-dom";
import { captalizeWords } from "../../../utils/captalizeWords";
import { formatedDate, formatedTime } from "../../../utils/formateddateAndTime";
import { formatDuration } from "../../../utils/formatedDuration";
import { useRef, useState } from "react";

const today = new Date().toISOString().split("T")[0];

// ---------- Helper: check if a date is today ----------
const isToday = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const dStr = d.toISOString().split("T")[0];
  return dStr === today;
};

// ---------- Helper: check if current time is after 6:30 PM (18:30) ----------
const isAfterWorkHours = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  return hours > 18 || (hours === 18 && minutes >= 30);
};

// Status Badge Component with Portal Tooltip (shows on EVERY status)
const StatusBadge = ({
  status,
  attendanceStatus,
  morningShortLeave,
  eveningShortLeave,
  lateMinutes,
}) => {
  const [tip, setTip] = useState({ show: false, x: 0, y: 0 });
  const badgeRef = useRef(null);

  // Determine primary status for badge
  let primaryStatus = attendanceStatus || status;
  let badgeColor = "";
  let icon = "";
  let tooltipText = "";
  let shortLeaveDetails = [];

  if (morningShortLeave?.isShortLeave && morningShortLeave?.minutes > 0) {
    shortLeaveDetails.push(`Morning: ${formatDuration(morningShortLeave.minutes)}`);
  }
  if (eveningShortLeave?.isShortLeave && eveningShortLeave?.minutes > 0) {
    shortLeaveDetails.push(`Evening: ${formatDuration(eveningShortLeave.minutes)}`);
  }

  // Determine badge color and icon based on status
  switch (primaryStatus) {
    case "PRESENT":
      if (lateMinutes > 0) {
        badgeColor = "bg-orange-500/20 text-orange-400 border-orange-500/30";
        icon = "⏳";
        tooltipText = `Late Arrival: ${formatDuration(lateMinutes)}`;
      } else {
        badgeColor = "bg-green-500/20 text-green-400 border-green-500/30";
        icon = "✅";
        tooltipText = "Present";
      }
      break;
    case "SHORT_LEAVE":
      badgeColor = "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      icon = "⏰";
      tooltipText =
        shortLeaveDetails.length > 0
          ? `Short Leave (${shortLeaveDetails.join(", ")})`
          : "Short Leave";
      break;
    case "ABSENT":
      badgeColor = "bg-red-500/20 text-red-400 border-red-500/30";
      icon = "❌";
      tooltipText = "Absent";
      break;
    case "HALF_DAY":
      badgeColor = "bg-purple-500/20 text-purple-400 border-purple-500/30";
      icon = "🌓";
      tooltipText = "Half Day";
      break;
    case "NA":
      badgeColor = "bg-orange-500/20 text-orange-400 border-orange-500/30";
      icon = "⚠️";
      tooltipText = "Not Punched Out";
      break;
    default:
      badgeColor = "bg-gray-500/20 text-gray-400 border-gray-500/30";
      icon = "ℹ️";
      tooltipText = captalizeWords(primaryStatus);
  }

  // Determine display text (the label inside the badge)
  let displayText = "";
  if (primaryStatus === "SHORT_LEAVE") {
    displayText = "SL";
    if (shortLeaveDetails.length > 0) {
      const totalMins =
        (morningShortLeave?.minutes || 0) + (eveningShortLeave?.minutes || 0);
      if (totalMins > 0) {
        displayText += ` (${formatDuration(totalMins)})`;
      }
    }
  } else if (primaryStatus === "PRESENT" && lateMinutes > 0) {
    displayText = `Late (${formatDuration(lateMinutes)})`;
  } else if (primaryStatus === "NA") {
    displayText = "NA";
  } else {
    displayText = captalizeWords(primaryStatus);
  }

  // ✅ Tooltip now shows for EVERY status
  const handleEnter = () => {
    const el = badgeRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setTip({
      show: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  const handleLeave = () => setTip((t) => ({ ...t, show: false }));

  return (
    <>
      <div
        ref={badgeRef}
        className="relative inline-flex items-center"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${badgeColor} flex items-center gap-1.5 cursor-help`}
        >
          {icon}
          <span>{displayText}</span>
          <Info size={12} className="opacity-60 ml-0.5" />
        </span>
      </div>

      {tip.show &&
        createPortal(
          <div
            className="pointer-events-none"
            style={{
              position: "fixed",
              left: tip.x,
              top: tip.y,
              transform: "translate(-50%, calc(-100% - 10px))",
              zIndex: 99999,
              maxWidth: 260,
            }}
          >
            <div className="bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-lg shadow-xl border border-white/10 px-3 py-2 whitespace-nowrap min-w-[150px]">
              <div className="font-medium text-white/90">{tooltipText}</div>
              {shortLeaveDetails.length > 0 && (
                <div className="mt-1 text-yellow-400/80 text-[10px]">
                  {shortLeaveDetails.map((detail, i) => (
                    <div key={i}>{detail}</div>
                  ))}
                </div>
              )}
            </div>
            <div className="w-2 h-2 bg-gray-900/95 border-r border-b border-white/10 rotate-45 mx-auto -mt-1" />
          </div>,
          document.body
        )}
    </>
  );
};

export const getAttendanceColumns = ({ onViewDetails, data, showImage }) => {
  const isTodayData = data?.every(
    (item) => item.date?.split("T")[0] === today
  );

  const columns = [
    {
      header: "S No",
      render: (_, i) => (
        <span className="text-white/40 font-mono text-sm">
          {String(i + 1).padStart(2, "0")}
        </span>
      ),
    },
    {
      header: "Employee",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-white/90 font-medium">
            {row.employee?.employeeCode || "—"}
          </span>
          <span className="text-white/40 text-xs">
            {row.employee?.fullName || "—"}
          </span>
        </div>
      ),
    },
    {
      header: "Department",
      render: (row) => (
        <span className="text-white/60 text-sm">
          {row.employee?.departmentName || "—"}
        </span>
      ),
    },
    {
      header: "Punch In",
      render: (row) => {
        const punchIn = row.firstPunchIn || row.firstPunchInLocal;

        if (!punchIn) {
          return <span className="text-white/30">—</span>;
        }

        return (
          <div className="flex flex-col">
            <span className="text-white/80 text-sm">
              {formatedTime(punchIn) || "—"}
            </span>
            {row.lateMinutes > 0 && (
              <span className="text-orange-400/60 text-[10px]">
                Late: {formatDuration(row.lateMinutes)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Punch Out",
      render: (row) => {
        if (!row.firstPunchIn) {
          return <span className="text-white/30">—</span>;
        }
        const punchOut = row.lastPunchOutLocal || row.lastPunchOut;
        if (punchOut) {
          return (
            <span className="text-white/80 text-sm">
              {formatedTime(punchOut)}
            </span>
          );
        }
        const lastSession = row.sessions?.[row.sessions?.length - 1];
        if (lastSession?.punchOut) {
          return (
            <span className="text-white/80 text-sm">
              {formatedTime(lastSession.punchOut)}
            </span>
          );
        }
        return <span className="text-white/30">—</span>;
      },
    },
    {
      header: "Working Time",
      render: (row) => {
        if (!row.firstPunchIn) return <span className="text-white/30">—</span>;
        if (row.totalWorkingMinutes && row.totalWorkingMinutes > 0) {
          return (
            <span className="text-white/80 text-sm font-mono">
              {formatDuration(row.totalWorkingMinutes)}
            </span>
          );
        }
        return <span className="text-white/30">—</span>;
      },
    },
    {
      header: "Break/Visit",
      render: (row) => {
        const totalBreakMinutes = row.totalBreakMinutes || 0;
        let totalVisitMinutes = 0;
        row.sessions?.forEach((session) => {
          session.visits?.forEach((visit) => {
            totalVisitMinutes += visit.durationMinutes || 0;
          });
        });
        const totalMinutes = totalBreakMinutes + totalVisitMinutes;
        return totalMinutes > 0 ? (
          <span className="text-white/70 text-sm font-mono">
            {formatDuration(totalMinutes)}
          </span>
        ) : (
          <span className="text-white/30">—</span>
        );
      },
    },
    {
      header: "Status",
      render: (row) => {
        let baseStatus = (row.attendanceStatus || row.status || "").toUpperCase();
        const isPresent = baseStatus === "PRESENT";
        const hasPunchOut = row.lastPunchOutLocal || row.lastPunchOut;

        let effectiveStatus = baseStatus;
        if (isPresent && !hasPunchOut) {
          const recordDate = row.date || row.date;
          if (!isToday(recordDate) || (isToday(recordDate) && isAfterWorkHours())) {
            effectiveStatus = "NA";
          }
        }

        return (
          <StatusBadge
            status={effectiveStatus}
            attendanceStatus={effectiveStatus}
            morningShortLeave={row.morningShortLeave}
            eveningShortLeave={row.eveningShortLeave}
            lateMinutes={row.lateMinutes}
          />
        );
      },
    },
    {
      header: "",
      render: (row) => (
        <button
          className="group flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-200 hover:scale-110"
          onClick={() => onViewDetails(row)}
          title="View Details"
        >
          <Eye
            size={16}
            className="text-white/40 group-hover:text-white/80 transition-colors"
          />
        </button>
      ),
    },
  ];

  return columns.filter(Boolean);
};