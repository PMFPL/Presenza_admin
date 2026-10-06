// File: src\pages\AttendanceReport\AttendanceReport.jsx

import Loading from "../../components/common/Loading";
import Table from "../../components/common/Table";
import GettingError from "../../components/common/GettingError";
import { useAttendanceReport } from "./hooks/useAttendanceReport";
import { getAttendanceReportColumns } from "./data/AttendanceReportColumns";
import { useMemo, useState, useEffect } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import * as XLSX from 'xlsx';
import { getRequest } from "../../services/api/APIMethodCaller";

// Helper to format date as YYYY-MM-DD without timezone issues
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format date for column header: "MMM DD" (e.g., "Jul 1")
const formatDateHeader = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
};

// Normalize any date string to YYYY-MM-DD
const normalizeDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  return formatDate(date);
};

// Check whether a date is the current local date.
// This intentionally uses local date values to avoid timezone-related issues.
const isCurrentDate = (dateStr) => {
  if (!dateStr) return false;

  const normalized = normalizeDate(dateStr);
  const today = formatDate(new Date());

  return normalized === today;
};

// Get first day of a month, with fallback to current month if invalid
const getFirstDay = (month, year) => {
  let m = parseInt(month);
  let y = parseInt(year);
  if (isNaN(m) || isNaN(y) || m < 1 || m > 12) {
    const now = new Date();
    m = now.getMonth() + 1;
    y = now.getFullYear();
  }
  const date = new Date(y, m - 1, 1);
  return formatDate(date);
};

const getLastDay = (month, year) => {
  let m = parseInt(month);
  let y = parseInt(year);
  if (isNaN(m) || isNaN(y) || m < 1 || m > 12) {
    const now = new Date();
    m = now.getMonth() + 1;
    y = now.getFullYear();
  }
  const date = new Date(y, m, 0);
  return formatDate(date);
};

const AttendanceReport = () => {
  const {
    searchEmpId,
    setSearchEmpId,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    // we will not use reportData from hook; we'll use our own range data
    loading: hookLoading,
    error: hookError,
    monthDays: hookMonthDays,
    months,
    years,
  } = useAttendanceReport();

  // ---------- Range state (exact dates) ----------
  const initialFrom = getFirstDay(selectedMonth, selectedYear);
  const initialTo = getLastDay(selectedMonth, selectedYear);

  const [rangeFromDate, setRangeFromDate] = useState(initialFrom);
  const [rangeToDate, setRangeToDate] = useState(initialTo);
  const [rangeLoading, setRangeLoading] = useState(false);
  const [rangeError, setRangeError] = useState(null);

  // ---------- Local state for range data ----------
  const [rangeReportData, setRangeReportData] = useState([]);
  const [rangeMonthDays, setRangeMonthDays] = useState([]);

  // Fetch data when range changes
  useEffect(() => {
    if (rangeFromDate && rangeToDate) {
      fetchRangeData();
    }
  }, [rangeFromDate, rangeToDate]);

  // const fetchRangeData = async () => {
  //   setRangeLoading(true);
  //   setRangeError(null);
  //   try {
  //     const response = await getRequest(`/attendance/report?startDate=${rangeFromDate}&endDate=${rangeToDate}`);
  //     if (response.success) {
  //       const report = response.data?.data?.report || response.data?.report || [];
  //       // Normalize dates
  //       const normalized = report.map(emp => ({
  //         ...emp,
  //         attendance: (emp.attendance || []).map(rec => ({
  //           ...rec,
  //           date: normalizeDate(rec.date) || rec.date,
  //           // The current date should be treated as Present in the report.
  //           // If the API sends ABSENT for today, show it as PRESENT instead.
  //           attendanceStatus:
  //             isCurrentDate(rec.date) && rec.attendanceStatus === "ABSENT"
  //               ? "PRESENT"
  //               : rec.attendanceStatus
  //         }))
  //       }));
  //       setRangeReportData(normalized);

  //       // Build monthDays from the attendance records (all unique dates in range)
  //       const datesSet = new Set();
  //       normalized.forEach(emp => {
  //         emp.attendance?.forEach(rec => {
  //           if (rec.date) datesSet.add(rec.date);
  //         });
  //       });
  //       const sortedDates = Array.from(datesSet).sort();
  //       const days = sortedDates.map(dateStr => {
  //         const date = new Date(dateStr);
  //         return {
  //           date: dateStr,
  //           day: date.getDate(),
  //           dayName: date.toLocaleString('en', { weekday: 'short' }),
  //         };
  //       });
  //       setRangeMonthDays(days);
  //     } else {
  //       setRangeError(response.message || 'Failed to fetch report');
  //       setRangeReportData([]);
  //       setRangeMonthDays([]);
  //     }
  //   } catch (err) {
  //     setRangeError(err.message || 'Something went wrong');
  //     setRangeReportData([]);
  //     setRangeMonthDays([]);
  //   } finally {
  //     setRangeLoading(false);
  //   }
  // };

const fetchRangeData = async () => {
  setRangeLoading(true);
  setRangeError(null);
  try {
    const response = await getRequest(`/attendance/report?startDate=${rangeFromDate}&endDate=${rangeToDate}`);
   
    if (response.success) {
      const report = response.data?.data?.report || response.data?.report || [];
console.log("Fetched report data=============>:", report);
      // Normalize dates only — do NOT override attendance status.
      // The backend already returns the correct status (PRESENT / ABSENT /
      // WEEK_OFF / HOLIDAY / ON_LEAVE / HALF_DAY / SHORT_LEAVE / NOT_JOINED).
      // Any frontend override (e.g. forcing today to PRESENT) would corrupt
      // the data and cause every employee to appear present.
      const normalized = report.map(emp => ({
        ...emp,
        attendance: (emp.attendance || []).map(rec => ({
          ...rec,
          date: normalizeDate(rec.date) || rec.date,
        }))
      }));

      setRangeReportData(normalized);

      // Build monthDays from the attendance records (all unique dates in range)
      const datesSet = new Set();
      normalized.forEach(emp => {
        emp.attendance?.forEach(rec => {
          if (rec.date) datesSet.add(rec.date);
        });
      });
      const sortedDates = Array.from(datesSet).sort();
      const days = sortedDates.map(dateStr => {
        const date = new Date(dateStr);
        return {
          date: dateStr,
          day: date.getDate(),
          dayName: date.toLocaleString('en', { weekday: 'short' }),
          fullDate: date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        };
      });
      setRangeMonthDays(days);
    } else {
      setRangeError(response.message || 'Failed to fetch report');
      setRangeReportData([]);
      setRangeMonthDays([]);
    }
  } catch (err) {
    setRangeError(err.message || 'Something went wrong');
    setRangeReportData([]);
    setRangeMonthDays([]);
  } finally {
    setRangeLoading(false);
  }
};


  // The data to display (filtered by search)
  const filteredData = useMemo(() => {
    if (!searchEmpId || !searchEmpId.trim()) return rangeReportData;
    const search = searchEmpId.trim().toLowerCase();
    return rangeReportData.filter(emp => {
      const code = emp.employeeCode?.toLowerCase() || '';
      const name = emp.fullName?.toLowerCase() || '';
      return code.includes(search) || name.includes(search);
    });
  }, [rangeReportData, searchEmpId]);

  // Columns based on rangeMonthDays
  const columns = useMemo(
    () => getAttendanceReportColumns({ monthDays: rangeMonthDays }),
    [rangeMonthDays]
  );

  const getMonthName = (month) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[parseInt(month) - 1] || month;
  };

  const getBaseFileName = (data) => {
    if (data.length === 1) {
      const emp = data[0];
      const code = emp.employeeCode || 'unknown';
      const name = (emp.fullName || 'unknown').replace(/\s+/g, '_');
      return `Attendance_${code}_${name}`;
    }
    return 'Attendance_Report';
  };

  // Build the export data (rows) with metadata prepended
  const buildExportRows = (data, days, fromDate, toDate, singleEmployee) => {
    if (!data || data.length === 0) return [];

    // First, build the actual data rows with computed summary from attendance
    const dataRows = data.map((emp, index) => {
      const row = {
        "S No": index + 1,
        "Emp Id": emp.employeeCode || "-",
        "Emp Name": emp.fullName || "-",
        "Department": emp.department?.name || "-"
      };

      // For each day, use the formatted date as the column header
      days.forEach(dayInfo => {
        const dateHeader = formatDateHeader(dayInfo.date);
        const record = emp.attendance?.find(r => r.date === dayInfo.date);
        if (record) {
          const status = record.attendanceStatus;
          let label = "-";
          switch(status) {
            case "PRESENT": label = "Present"; break;
            case "ABSENT": label = "Absent"; break;
            case "WEEK_OFF": label = "Week Off"; break;
            case "HOLIDAY": label = "Holiday"; break;
            case "ON_LEAVE": label = "Leave"; break;
            case "HALF_DAY": label = "Half Day"; break;
            case "SHORT_LEAVE": label = "Short Leave"; break;
            default: label = "-";
          }
          row[dateHeader] = label;
        } else {
          row[dateHeader] = "-";
        }
      });

      // Compute summary from attendance records (only within the range)
      const attendance = emp.attendance || [];
      const summary = {
        present: attendance.filter(r => r.attendanceStatus === 'PRESENT').length,
        absent: attendance.filter(r => r.attendanceStatus === 'ABSENT').length,
        halfDay: attendance.filter(r => r.attendanceStatus === 'HALF_DAY').length,
        shortLeave: attendance.filter(r => r.attendanceStatus === 'SHORT_LEAVE').length,
        weekOff: attendance.filter(r => r.attendanceStatus === 'WEEK_OFF').length,
        holiday: attendance.filter(r => r.attendanceStatus === 'HOLIDAY').length,
        onLeave: attendance.filter(r => r.attendanceStatus === 'ON_LEAVE').length,
      };

      row["Present"] = summary.present;
      row["Absent"] = summary.absent;
      row["Half Day"] = summary.halfDay;
      row["Short Leave"] = summary.shortLeave;
      row["Week Off"] = summary.weekOff;
      row["Holiday"] = summary.holiday;
      row["Leave"] = summary.onLeave;

      const total = summary.present + summary.absent + summary.halfDay + summary.shortLeave +
                    summary.weekOff + summary.holiday + summary.onLeave;
      row["Total"] = total;

      return row;
    });

    // Prepare metadata rows
    const headers = Object.keys(dataRows[0] || {});
    const metadataRows = [];

    // Row 1: Report title
    const titleRow = {};
    headers.forEach((key, idx) => {
      if (idx === 0) titleRow[key] = "Attendance Report";
      else titleRow[key] = "";
    });
    metadataRows.push(titleRow);

    // Row 2: Date range
    const dateRangeRow = {};
    headers.forEach((key, idx) => {
      if (idx === 0) dateRangeRow[key] = `Date Range: ${fromDate} to ${toDate}`;
      else dateRangeRow[key] = "";
    });
    metadataRows.push(dateRangeRow);

    // Row 3: Employee info (single or all)
    const empInfoRow = {};
    headers.forEach((key, idx) => {
      if (idx === 0) {
        if (singleEmployee) {
          empInfoRow[key] = `Employee: ${singleEmployee.employeeCode} - ${singleEmployee.fullName}`;
        } else {
          empInfoRow[key] = "Employee: All";
        }
      } else {
        empInfoRow[key] = "";
      }
    });
    metadataRows.push(empInfoRow);

    // Row 4: Blank separator
    const blankRow = {};
    headers.forEach((key) => { blankRow[key] = ""; });
    metadataRows.push(blankRow);

    // Combine: metadata + header row + dataRows
    const headerRow = {};
    headers.forEach((key) => { headerRow[key] = key; });
    const finalRows = [...metadataRows, headerRow, ...dataRows];
    return finalRows;
  };

  // ---------- Range download (CSV & Excel) ----------
  const downloadRange = async (format) => {
    if (!rangeFromDate || !rangeToDate) {
      alert("Please select both From and To dates.");
      return;
    }
    if (rangeFromDate > rangeToDate) {
      alert("'From' date must be before or equal to 'To' date.");
      return;
    }

    // Use the already fetched data (filtered by search)
    let dataToExport = filteredData;
    let singleEmployee = null;
    if (filteredData.length === 1) {
      singleEmployee = filteredData[0];
    }

    if (dataToExport.length === 0 || rangeMonthDays.length === 0) {
      alert("No data found for the selected date range and search criteria.");
      return;
    }

    setRangeLoading(true);
    try {
      const exportRows = buildExportRows(
        dataToExport,
        rangeMonthDays,
        rangeFromDate,
        rangeToDate,
        singleEmployee
      );

      // Get headers
      let headerRowIndex = 0;
      for (let i = 0; i < exportRows.length; i++) {
        const row = exportRows[i];
        const values = Object.values(row);
        if (values.some(v => v === "S No" || v === "Emp Id")) {
          headerRowIndex = i;
          break;
        }
      }
      const headers = Object.keys(exportRows[headerRowIndex] || {});

      // Convert to array of arrays
      const rowsArray = exportRows.map(row => {
        return headers.map(key => row[key] || "");
      });

      const dateRangeStr = `${rangeFromDate}_to_${rangeToDate}`;
      const baseName = getBaseFileName(dataToExport);

      if (format === 'csv') {
        const csvRows = rowsArray.map(row => 
          row.map(cell => {
            const str = String(cell);
            return str.includes(',') ? `"${str}"` : str;
          }).join(',')
        );
        const csvData = csvRows.join('\n');
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${baseName}_${dateRangeStr}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(rowsArray);
        const colWidths = headers.map((key) => ({
          wch: Math.max(
            key.length,
            ...rowsArray.map(row => String(row[headers.indexOf(key)] || "").length)
          ) + 2
        }));
        ws['!cols'] = colWidths;
        XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array', bookSST: false });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${baseName}_${dateRangeStr}.xlsx`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Error downloading range:", err);
      alert("Failed to download range report. Please try again.");
    } finally {
      setRangeLoading(false);
    }
  };

  const downloadCSV = () => downloadRange('csv');
  const downloadExcel = () => downloadRange('xlsx');

  // Count filtered employees for display
  const filteredCount = filteredData.length;

  const isLoading = hookLoading || rangeLoading;
  const displayError = hookError || rangeError;

  return (
    <>
      {isLoading && <Loading message="Fetching Attendance Report..." />}
      {displayError ? (
        <GettingError error={displayError} />
      ) : (
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl py-6 shadow-xl">
          {/* Header */}
          <div className="flex justify-between items-center px-6 mb-4">
            <h3 className="text-white/80 font-semibold text-lg">
              Attendance Report
              {rangeReportData.length > 0 && (
                <span className="text-sm text-gray-400 ml-2">
                  ({filteredCount} employees)
                </span>
              )}
            </h3>
            <div className="flex items-center gap-3">
              {/* ---------- FIXED DROPDOWN ---------- */}
              <div className="relative group">
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff6b35]/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!rangeReportData || rangeReportData.length === 0 || rangeLoading}
                >
                  {rangeLoading ? (
                    <span className="inline-block animate-spin mr-2">⏳</span>
                  ) : (
                    <Download size={18} />
                  )}
                  <span>{rangeLoading ? 'Processing...' : 'Download'}</span>
                </button>
                {/* Dropdown wrapper with transparent hover bridge */}
                <div className="absolute right-0 pt-2 top-full hidden group-hover:block z-50">
                  <div className="w-48 bg-[#032446] border border-white/20 rounded-lg shadow-xl">
                    <button
                      onClick={downloadCSV}
                      disabled={rangeLoading}
                      className="flex items-center gap-3 w-full px-4 py-3 text-white hover:bg-white/10 rounded-t-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <FileText size={18} className="text-green-400" />
                      <span>Download as CSV</span>
                    </button>
                    <button
                      onClick={downloadExcel}
                      disabled={rangeLoading}
                      className="flex items-center gap-3 w-full px-4 py-3 text-white hover:bg-white/10 rounded-b-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <FileSpreadsheet size={18} className="text-green-500" />
                      <span>Download as Excel</span>
                    </button>
                  </div>
                </div>
              </div>
              {/* ------------------------------------ */}
            </div>
          </div>

          {/* ---------- Filters: Search (left) + Range (right, single row) ---------- */}
          <div className="flex justify-between items-center px-6 flex-wrap gap-4">
            {/* Left: Search */}
            <div className="w-64">
              <input
                type="text"
                placeholder="Search by Emp Id or Name"
                value={searchEmpId}
                onChange={(e) => setSearchEmpId(e.target.value)}
                className="w-full px-4 py-2 text-white border border-gray-300 rounded-lg outline-none bg-transparent"
              />
            </div>

            {/* Right: From/To date pickers */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-gray-400 text-sm">From:</span>
              <input
                type="date"
                value={rangeFromDate}
                onChange={(e) => setRangeFromDate(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white/5 text-white border border-white/20 outline-none focus:ring-2 focus:ring-[#ff6b35]"
              />
              <span className="text-gray-400 text-sm">To:</span>
              <input
                type="date"
                value={rangeToDate}
                onChange={(e) => setRangeToDate(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white/5 text-white border border-white/20 outline-none focus:ring-2 focus:ring-[#ff6b35]"
              />
            </div>
          </div>

          {/* Info Bar */}
          {rangeReportData.length > 0 && (
            <div className="px-6 mt-3 flex items-center justify-between">
              <span className="text-gray-400 text-sm">
                Showing {filteredCount} employees
              </span>
              <span className="text-gray-400 text-sm">
                {rangeMonthDays.length} days in selected range
                <span className="ml-2 text-gray-500">
                  ({rangeFromDate} – {rangeToDate})
                </span>
              </span>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-6 px-6 mt-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400 w-8 text-center">P</span>
              <span className="text-gray-300 text-sm">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400 w-8 text-center">A</span>
              <span className="text-gray-300 text-sm">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400 w-8 text-center">L</span>
              <span className="text-gray-300 text-sm">Leave</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-400 w-8 text-center">H</span>
              <span className="text-gray-300 text-sm">Holiday</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-400 w-8 text-center">W</span>
              <span className="text-gray-300 text-sm">Week Off</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded text-xs font-medium bg-orange-500/20 text-orange-400 w-8 text-center">HD</span>
              <span className="text-gray-300 text-sm">Half Day</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded text-xs font-medium bg-cyan-500/20 text-cyan-400 w-8 text-center">SL</span>
              <span className="text-gray-300 text-sm">Short Leave</span>
            </div>
             <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded text-xs font-medium bg-orange-500/20 text-orange-400 w-8 text-center">NA</span>
              <span className="text-gray-300 text-sm">Not Punched Out</span>
            </div>
          </div>

          {/* Table */}
          <div className="px-6 mt-4">
            <Table
              columns={columns}
              data={filteredData}
              loading={rangeLoading}
              emptyMessage="No attendance records found for the selected date range."
            />
          </div>
        </div>
      )}
    </>
  );
};

export default AttendanceReport;