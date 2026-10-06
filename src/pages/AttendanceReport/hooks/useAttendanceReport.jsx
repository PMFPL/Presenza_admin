// File: src\pages\AttendanceReport\hooks\useAttendanceReport.jsx

import { useEffect, useMemo, useState } from "react";
import { getRequest } from "../../../services/api/APIMethodCaller";

export const useAttendanceReport = () => {
  const [searchEmpId, setSearchEmpId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generate month days with day names
  const monthDays = useMemo(() => {
    if (!selectedMonth || !selectedYear) return [];
    
    const month = parseInt(selectedMonth);
    const year = parseInt(selectedYear);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateObj = new Date(year, month - 1, day);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      
      return {
        day: day,
        date: dateStr,
        dayName: dayName,
        fullDate: dateObj.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      };
    });
  }, [selectedMonth, selectedYear]);

  // Set default month to current month
  useEffect(() => {
    const now = new Date();
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
    const currentYear = String(now.getFullYear());
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
  }, []);

  // Fetch attendance report data when month or year changes
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      fetchAttendanceReport();
    }
  }, [selectedMonth, selectedYear]);

  const fetchAttendanceReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = `/attendance/report?month=${selectedMonth}&year=${selectedYear}`;
      
      console.log("Fetching URL:", url);
      
      const response = await getRequest(url);
      
      console.log("Full API Response:", response);
      
      if (response.success) {
        // Access the report data from response.data.data.report
        if (response.data && response.data.data && response.data.data.report) {
          const report = response.data.data.report;
          console.log("Report found in response.data.data.report:", report.length);
          setReportData(report);
        } else if (response.data && response.data.report) {
          // Fallback: check if report is directly in response.data
          const report = response.data.report;
          console.log("Report found in response.data.report:", report.length);
          setReportData(report);
        } else if (response.report) {
          // Fallback: check if report is directly in response
          const report = response.report;
          console.log("Report found in response.report:", report.length);
          setReportData(report);
        } else {
          console.warn("Unexpected response format:", response);
          setReportData([]);
        }
      } else {
        setError(response.error || "Failed to fetch attendance report");
        setReportData([]);
      }
    } catch (err) {
      setError("Failed to fetch attendance report");
      console.error("Error fetching report:", err);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Filter report data by employee ID OR Name (case-insensitive, partial match)
  const filteredReportData = useMemo(() => {
    if (!searchEmpId || !searchEmpId.trim()) return reportData;
    const search = searchEmpId.trim().toLowerCase();
    return reportData.filter((emp) => {
      const code = emp.employeeCode?.toLowerCase() || '';
      const name = emp.fullName?.toLowerCase() || '';
      return code.includes(search) || name.includes(search);
    });
  }, [reportData, searchEmpId]);

  // Get available months and years for filter
  const months = Array.from({ length: 12 }, (_, i) => {
    const num = i + 1;
    return { value: String(num).padStart(2, "0"), label: new Date(2000, i, 1).toLocaleString('default', { month: 'long' }) };
  });

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => String(currentYear - i));
  }, []);

  return {
    searchEmpId,
    setSearchEmpId,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    reportData: filteredReportData,
    loading,
    error,
    monthDays,
    months,
    years,
    fetchAttendanceReport,
  };
};