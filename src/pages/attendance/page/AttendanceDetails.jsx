import React, { useMemo, useState } from 'react';
import Table from '../../../components/common/Table';
import {
  getAttendanceDetailsColumn,
  getAttendanceSessionBreakColumn,
  getAttendanceSessionVisitColumn,
  ShortLeaveSummary,
} from '../data/SessionAndBreakColumn';
import {
  X,
  Clock,
  Calendar,
  User,
  Info,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock as ClockIcon,
  MapPin,
} from 'lucide-react';
import ShowFullImage from '../../../components/common/ShowFullImage';
import { formatedDate, formatedTime } from '../../../utils/formateddateAndTime';
import { formatDuration } from '../../../utils/formatedDuration';

// ----- Helper: color class mapping (fixes dynamic Tailwind issues) -----
const colorClasses = {
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

// ----- Status Card Component -----
const StatusCard = ({ icon: Icon, label, value, color, subtitle }) => {
  const classes = colorClasses[color] || colorClasses.gray;
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-3 mb-1">
        <div className={`p-2 rounded-lg ${classes}`}>
          <Icon size={16} className="text-current" />
        </div>
        <span className="text-white/40 text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-white/90 text-lg font-semibold">{value}</p>
      {subtitle && <p className="text-white/30 text-xs mt-0.5">{subtitle}</p>}
    </div>
  );
};

function AttendenceDetails({ sessions = [], empCode, employeeData, close }) {
  const [showFullImage, setShowFullImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const showImage = (Img) => {
    if (!Img) return;
    setShowFullImage(true);
    setSelectedImage(Img);
  };

  const closeImage = () => {
    setShowFullImage(false);
    setSelectedImage('');
  };

  // ---- Customize columns to add icon before location addresses (with 2-line limit and hover) ----
  const baseColumns = useMemo(() => getAttendanceDetailsColumn({ showImage }), []);
  const columns = useMemo(() => {
    return baseColumns.map((col) => {
      if (col.Header === 'In Location' || col.Header === 'Out Location') {
        return {
          ...col,
          Cell: ({ row }) => {
            let location = '';
            if (col.accessor) {
              location = typeof col.accessor === 'function'
                ? col.accessor(row.original)
                : row.original[col.accessor];
            }
            return (
              <div 
                className="flex items-start justify-center gap-1.5 w-full cursor-help px-1"
                title={String(location || '—')}
              >
                <MapPin size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
                {/* Inline styles guarantee the 2-line clamp works regardless of Tailwind setup */}
                <div 
                  className="min-w-0 text-left text-xs text-white/80 leading-relaxed"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    maxWidth: '100%'
                  }}
                >
                  {location || '—'}
                </div>
              </div>
            );
          }
        };
      }
      return col;
    });
  }, [baseColumns]);

  const breakColumns = useMemo(() => getAttendanceSessionBreakColumn(), []);
  
  // ---- Customize visits columns to allow multi-line wrapping and hover tooltips ----
  const visitColumns = useMemo(() => {
    const baseVisitColumns = getAttendanceSessionVisitColumn({ showImage });
    // Columns that need multi-line wrapping and hover tooltips
    const textColumns = ['Purpose', 'In Location', 'Out Location', 'Customer', 'Remarks'];

    return baseVisitColumns.map((col) => {
      if (textColumns.includes(col.Header)) {
        const originalCell = col.Cell;
        return {
          ...col,
          Cell: (props) => {
            let textValue = '';
            if (col.accessor) {
              textValue = typeof col.accessor === 'function'
                ? col.accessor(props.row.original)
                : props.row.original[col.accessor];
            }

            const content = originalCell ? originalCell(props) : (textValue || '—');

            return (
              <div
                className="text-left text-xs cursor-help mx-auto"
                title={String(textValue || '—')}
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  maxWidth: '150px' // Prevents this column from expanding infinitely
                }}
              >
                {content}
              </div>
            );
          }
        };
      }
      return col;
    });
  }, []);

  // Attendance summary
  const attendanceSummary = useMemo(() => {
    if (!employeeData) return null;
    return {
      status: employeeData.status,
      attendanceStatus: employeeData.attendanceStatus,
      isLate: employeeData.isLate,
      lateMinutes: employeeData.lateMinutes,
      isEarlyLeave: employeeData.isEarlyLeave,
      earlyLeaveMinutes: employeeData.earlyLeaveMinutes,
      isHalfDay: employeeData.isHalfDay,
      halfDayType: employeeData.halfDayType,
      totalWorkingMinutes: employeeData.totalWorkingMinutes,
      totalBreakMinutes: employeeData.totalBreakMinutes,
      breakCount: employeeData.breakCount,
      morningShortLeave: employeeData.morningShortLeave,
      eveningShortLeave: employeeData.eveningShortLeave,
      firstPunchIn: employeeData.firstPunchIn,
      lastPunchOut: employeeData.lastPunchOut,
      date: employeeData.date,
      employee: employeeData.employee,
    };
  }, [employeeData]);

  // Status badge
  const getStatusBadge = (status) => {
    const configs = {
      PRESENT: { icon: CheckCircle, color: 'green', label: 'Present' },
      ABSENT: { icon: XCircle, color: 'red', label: 'Absent' },
      SHORT_LEAVE: { icon: Clock, color: 'yellow', label: 'Short Leave' },
      HALF_DAY: { icon: ClockIcon, color: 'purple', label: 'Half Day' },
    };
    const config = configs[status] || { icon: Info, color: 'gray', label: status };
    const Icon = config.icon;
    const classes = colorClasses[config.color] || colorClasses.gray;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${classes}`}
      >
        <Icon size={14} className="text-current" />
        {config.label}
      </span>
    );
  };

  return (
    <>
      {/* ===== STYLES TO PREVENT OVERLAP AND HANDLE MULTI-LINE TEXT ===== */}
      <style>{`
        /* --- Session detail table --- */
        .session-table-wrapper {
          overflow-x: auto;
        }
        .session-table-wrapper table {
          table-layout: fixed;
          width: 100%;
          border-collapse: collapse;
        }
        .session-table-wrapper td,
        .session-table-wrapper th {
          word-break: break-word !important;
          overflow-wrap: break-word !important;
          white-space: normal !important;
          padding: 8px 6px;
          vertical-align: top;
          font-size: 13px;
        }
        
        /* Column widths */
        .session-table-wrapper td:nth-child(1),
        .session-table-wrapper th:nth-child(1) { width: 10%; }  /* Punch In */
        
        .session-table-wrapper td:nth-child(2),
        .session-table-wrapper th:nth-child(2) { 
          width: 30%; 
          text-align: center !important;
        }  /* In Location – centered */
        
        .session-table-wrapper td:nth-child(3),
        .session-table-wrapper th:nth-child(3) { width: 10%; }  /* In Image */
        
        .session-table-wrapper td:nth-child(4),
        .session-table-wrapper th:nth-child(4) { width: 10%; }  /* Punch Out */
        
        .session-table-wrapper td:nth-child(5),
        .session-table-wrapper th:nth-child(5) { 
          width: 30%; 
          text-align: center !important;
        }  /* Out Location – centered */
        
        .session-table-wrapper td:nth-child(6),
        .session-table-wrapper th:nth-child(6) { width: 10%; }  /* Out Image */
        
        .session-table-wrapper td:nth-child(7),
        .session-table-wrapper th:nth-child(7) { width: 10%; }  /* Duration */

        /* Image constraints – center images */
        .session-table-wrapper img {
          max-width: 80px !important;
          max-height: 80px !important;
          object-fit: contain;
          border-radius: 4px;
          display: block;
          margin: 0 auto !important;
        }

        /* --- Breaks / Visits tables --- */
        .break-visit-wrapper {
          overflow-x: auto;
        }
        .break-visit-wrapper table {
          table-layout: fixed; /* Enforce fixed layout to prevent horizontal scroll */
          width: 100%;
          border-collapse: collapse;
        }
        .break-visit-wrapper td,
        .break-visit-wrapper th {
          white-space: normal !important; /* Force wrapping */
          word-break: break-word !important;
          overflow-wrap: break-word !important;
          padding: 8px 6px;
          font-size: 12px;
          vertical-align: top; 
        }
        .break-visit-wrapper img {
          max-width: 50px !important;
          max-height: 50px !important;
          object-fit: contain;
          margin: 0 auto;
        }
      `}</style>

      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-start z-50 pt-8 pb-8 overflow-y-auto">
        <div className="bg-gradient-to-br from-[#032446] to-[#1a2d4a] rounded-2xl mx-4 border border-white/10 shadow-2xl max-h-[95vh] w-[95vw] max-w-7xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/10 sticky top-0 bg-[#032446]/95 backdrop-blur-sm z-10">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/5 rounded-xl">
                <User size={20} className="text-white/60" />
              </div>
              <div>
                <h4 className="text-white/90 font-semibold text-lg">Attendance Details</h4>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-white/60 font-medium">{empCode}</span>
                  <span className="text-white/30">•</span>
                  <span className="text-white/40">{attendanceSummary?.employee?.fullName || '—'}</span>
                  <span className="text-white/30">•</span>
                  <span className="text-white/30">{attendanceSummary?.employee?.departmentName || '—'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={close}
              className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 text-white/50 hover:text-white/80"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-6 py-6">
            {/* Summary Cards */}
            {attendanceSummary && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                <StatusCard
                  icon={Calendar}
                  label="Date"
                  value={formatedDate(attendanceSummary.date) || '—'}
                  color="blue"
                />
                <StatusCard
                  icon={CheckCircle}
                  label="Status"
                  value={getStatusBadge(attendanceSummary.attendanceStatus)}
                  color="green"
                />
                <StatusCard
                  icon={ClockIcon}
                  label="Working Time"
                  value={
                    attendanceSummary.totalWorkingMinutes
                      ? formatDuration(attendanceSummary.totalWorkingMinutes)
                      : '—'
                  }
                  color="blue"
                />
                <StatusCard
                  icon={Clock}
                  label="Punch In"
                  value={formatedTime(attendanceSummary.firstPunchIn) || '—'}
                  color="green"
                />
                <StatusCard
                  icon={Clock}
                  label="Punch Out"
                  value={formatedTime(attendanceSummary.lastPunchOut) || '—'}
                  color="red"
                />
                <StatusCard
                  icon={Info}
                  label="Breaks"
                  value={attendanceSummary.breakCount || 0}
                  color="purple"
                  subtitle={
                    attendanceSummary.totalBreakMinutes
                      ? formatDuration(attendanceSummary.totalBreakMinutes)
                      : ''
                  }
                />
              </div>
            )}

            {/* Short Leave Summary */}
            {attendanceSummary?.morningShortLeave?.isShortLeave && (
              <ShortLeaveSummary
                morningShortLeave={attendanceSummary.morningShortLeave}
                eveningShortLeave={attendanceSummary.eveningShortLeave}
                className="mb-6"
              />
            )}

            {/* Late/Early Leave Notes */}
            {(attendanceSummary?.isLate ||
              attendanceSummary?.isEarlyLeave ||
              attendanceSummary?.isHalfDay) && (
              <div className="mb-6 p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={16} className="text-orange-400" />
                  <h5 className="text-orange-400/90 font-medium text-sm">Attendance Notes</h5>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {attendanceSummary?.isLate && (
                    <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-white/40 text-xs">Late Arrival</span>
                        <span className="text-orange-400 font-semibold text-sm">
                          {formatDuration(attendanceSummary.lateMinutes)}
                        </span>
                      </div>
                    </div>
                  )}
                  {attendanceSummary?.isEarlyLeave && (
                    <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-white/40 text-xs">Early Leave</span>
                        <span className="text-orange-400 font-semibold text-sm">
                          {formatDuration(attendanceSummary.earlyLeaveMinutes)}
                        </span>
                      </div>
                    </div>
                  )}
                  {attendanceSummary?.isHalfDay && (
                    <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-white/40 text-xs">Half Day</span>
                        <span className="text-purple-400 font-semibold text-sm">
                          {attendanceSummary.halfDayType || 'Yes'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sessions */}
            {sessions.length > 0 ? (
              <div className="space-y-6">
                {sessions.map((session, idx) => (
                  <div
                    key={`session_${idx}`}
                    className="bg-white/5 rounded-xl border border-white/10 overflow-hidden"
                  >
                    {/* Session Header */}
                    <div className="flex items-center justify-between p-4 bg-white/5 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium">
                          Session {idx + 1}
                        </span>
                        {session.durationMinutes > 0 && (
                          <span className="text-white/40 text-xs font-mono">
                            {formatDuration(session.durationMinutes)}
                          </span>
                        )}
                        {session.autoPunchedOut && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400/80 rounded text-[10px]">
                            Auto Punch Out
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-white/30 text-xs">
                        <span>Punch In: {formatedTime(session.punchIn)}</span>
                        {session.punchOut && (
                          <>
                            <span>•</span>
                            <span>Punch Out: {formatedTime(session.punchOut)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Session Table */}
                    <div className="p-4 session-table-wrapper">
                      <Table columns={columns} data={[session]} />
                    </div>

                    {/* Breaks */}
                    {session.breaks && session.breaks.length > 0 && (
                      <div className="border-t border-white/10 px-4 py-3 break-visit-wrapper">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-white/50 text-sm font-medium">Breaks</span>
                          <span className="text-white/20 text-xs bg-white/10 px-2 py-0.5 rounded">
                            {session.breaks.length}
                          </span>
                        </div>
                        <Table columns={breakColumns} data={session.breaks} />
                      </div>
                    )}

                    {/* Visits */}
                    {session.visits && session.visits.length > 0 && (
                      <div className="border-t border-white/10 px-4 py-3 break-visit-wrapper">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-white/50 text-sm font-medium">Visits</span>
                          <span className="text-white/20 text-xs bg-white/10 px-2 py-0.5 rounded">
                            {session.visits.length}
                          </span>
                        </div>
                        <Table columns={visitColumns} data={session.visits} />
                      </div>
                    )}

                    {/* No breaks/visits message */}
                    {(!session.breaks || session.breaks.length === 0) &&
                      (!session.visits || session.visits.length === 0) && (
                        <div className="border-t border-white/10 px-4 py-3">
                          <p className="text-white/20 text-sm italic">
                            No breaks or visits recorded for this session
                          </p>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex p-4 bg-white/5 rounded-2xl mb-4">
                  <Info size={32} className="text-white/20" />
                </div>
                <p className="text-white/40 text-lg font-medium">No Session Data Available</p>
                <p className="text-white/20 text-sm mt-1">
                  This employee has no punch records for the selected date
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 sticky bottom-0 bg-[#032446]/95 backdrop-blur-sm flex justify-end">
            <button
              onClick={close}
              className="px-6 py-2.5 bg-gradient-to-r from-[#ff6b35] to-[#e55a2a] hover:from-[#e55a2a] hover:to-[#cc4a1a] cursor-pointer text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Full Image Viewer */}
      {showFullImage && <ShowFullImage close={closeImage} Img={selectedImage} />}
    </>
  );
}

export default AttendenceDetails;