import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ChevronDown, ChevronUp, RefreshCw, Search, X, Clock,
  Calendar, Filter, ArrowUpDown, ChevronLeft, ChevronRight,
  Activity, Monitor, FileText, AlertCircle, Sparkles,
  Layers, Grid3x3, Users
} from 'lucide-react';
import {
  fetchAppsList,
  fetchAppHistory,
  searchActivities,
  fetchActivitiesByDateRange,
  selectAppsList,
  selectAppsListLoading,
  selectAppsListError,
  selectAppHistory,
  selectAppHistoryLoading,
  selectAppHistoryError,
  selectSearchResults,
  selectSearchLoading,
  selectSearchError,
  selectDateRangeResults,
  selectDateRangeLoading,
  selectDateRangeError,
  clearAppHistory,
  clearSearchResults,
  clearDateRangeResults,
  clearAppsList
} from './application/slice/applicationUsedByEmpSlice';
import Loading from '../../components/common/Loading';
import { TONE, getDisplayAppName, getAppIcon, getAppTone } from '../../utils/appDisplay';

// Formats a duration for display
const formatDuration = (durationSeconds, fallbackFormatted) => {
  const num = Number(durationSeconds);
  if (durationSeconds !== undefined && durationSeconds !== null && !Number.isNaN(num)) {
    const totalSeconds = Math.max(0, Math.round(num));
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
    return parts.join(' ');
  }
  if (fallbackFormatted) {
    return String(fallbackFormatted).replace(/(\d+)\.\d+(s\b)/g, '$1$2');
  }
  return '0s';
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const SignalMeter = memo(({ percentage = 0, tone = 'primary', segments = 20 }) => {
  const pct = Number.isFinite(percentage) ? Math.min(Math.max(percentage, 0), 100) : 0;
  const filled = Math.round((pct / 100) * segments);
  const t = TONE[tone] || TONE.primary;
  return (
    <div className="flex items-center gap-[3px] h-1.5 flex-1">
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 rounded-full transition-all duration-700 ${i < filled ? t.bg : 'bg-white/10'}`}
          style={{ transitionDelay: `${i * 10}ms`, height: i < filled ? '100%' : '60%' }}
        />
      ))}
    </div>
  );
});
SignalMeter.displayName = 'SignalMeter';

const ActivityRow = memo(({ item }) => {
  const tone = getAppTone(item.app);
  const t = TONE[tone];
  return (
    <div className="group bg-[#0E3A6E]/80 hover:bg-[#123B6E] backdrop-blur-sm border border-white/15 hover:border-[#4EA1FF]/30 rounded-xl p-3.5 transition-all duration-200 hover:shadow-md hover:shadow-[#4EA1FF]/5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className={`flex-shrink-0 mt-0.5 w-8 h-8 ${t.soft} rounded-lg flex items-center justify-center text-sm`}>
            {getAppIcon(item.app)}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate" title={item.title}>
              {item.title || 'Untitled'}
            </p>
            <div className="flex items-center gap-2 mt-1 text-xs text-[#8FB3DA]">
              <span className={`${t.text} font-semibold`}>{getDisplayAppName(item.app)}</span>
              <span className="text-white/20">•</span>
              <span className="font-mono">{formatDate(item.timestamp)}</span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 bg-white/10 px-3 py-1.5 rounded-xl">
          <span className="text-sm font-mono font-semibold text-white">
            {formatDuration(item.duration, item.formattedDuration)}
          </span>
        </div>
      </div>
    </div>
  );
});
ActivityRow.displayName = 'ActivityRow';

function AppDetailsViewer({ selectedEmp, selectedDate }) {
  const dispatch = useDispatch();

  const [viewMode, setViewMode] = useState('apps'); // 'apps' | 'history'
  const [selectedApp, setSelectedApp] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const pageSize = 20;

  const appsList = useSelector(selectAppsList);
  const appsListLoading = useSelector(selectAppsListLoading);
  const appsListError = useSelector(selectAppsListError);

  const appHistory = useSelector(selectAppHistory);
  const appHistoryLoading = useSelector(selectAppHistoryLoading);
  const appHistoryError = useSelector(selectAppHistoryError);

  // Tracks the employee/date pair for reset detection
  const contextRef = useRef({ emp: selectedEmp, date: selectedDate });

  // Fetch apps list - with date range if provided
  const fetchApps = useCallback(() => {
    if (selectedEmp) {
      const params = {
        employeeId: selectedEmp
      };
      // Use custom date range if set, otherwise use selectedDate from props
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      // Fallback to selectedDate if no custom range
      if (!startDate && !endDate && selectedDate) {
        params.startDate = selectedDate;
        params.endDate = selectedDate;
      }
      dispatch(fetchAppsList(params));
    }
  }, [selectedEmp, selectedDate, startDate, endDate, dispatch]);

  // Fetch history for a specific app
  const fetchHistory = useCallback((appName, pageOverride) => {
    if (selectedEmp && appName) {
      const params = {
        employeeId: selectedEmp,
        app: appName,
        page: pageOverride ?? currentPage,
        limit: pageSize
      };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (selectedDate && !startDate && !endDate) {
        params.startDate = selectedDate;
        params.endDate = selectedDate;
      }
      dispatch(fetchAppHistory(params));
    }
  }, [selectedEmp, selectedDate, startDate, endDate, currentPage, dispatch]);

  const handleAppClick = useCallback((app) => {
    setSelectedApp(app);
    setViewMode('history');
    setCurrentPage(1);
    fetchHistory(app.app, 1);
  }, [fetchHistory]);

  // Apply date range filter
  const handleDateRangeSubmit = useCallback((e) => {
    e.preventDefault();
    if (startDate && endDate) {
      setViewMode('apps');
      setSelectedApp(null);
      setCurrentPage(1);
      dispatch(clearAppHistory());
      dispatch(clearSearchResults());
      dispatch(clearDateRangeResults());
      fetchApps();
    }
  }, [startDate, endDate, fetchApps, dispatch]);

  // Clear date range filter
  const clearDateRange = useCallback(() => {
    setStartDate('');
    setEndDate('');
    setViewMode('apps');
    setSelectedApp(null);
    setCurrentPage(1);
    dispatch(clearAppHistory());
    dispatch(clearSearchResults());
    dispatch(clearDateRangeResults());
    fetchApps();
  }, [fetchApps, dispatch]);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    if (viewMode === 'history' && selectedApp) {
      fetchHistory(selectedApp.app, newPage);
    }
  }, [viewMode, selectedApp, fetchHistory]);

  const backToApps = useCallback(() => {
    setViewMode('apps');
    setSelectedApp(null);
    setCurrentPage(1);
    dispatch(clearAppHistory());
    dispatch(clearSearchResults());
    dispatch(clearDateRangeResults());
  }, [dispatch]);

  // Reset when employee changes
  useEffect(() => {
    const prev = contextRef.current;
    const changed = prev.emp !== selectedEmp || prev.date !== selectedDate;
    contextRef.current = { emp: selectedEmp, date: selectedDate };

    if (!selectedEmp) {
      dispatch(clearAppsList());
      dispatch(clearAppHistory());
      dispatch(clearSearchResults());
      dispatch(clearDateRangeResults());
      setViewMode('apps');
      setSelectedApp(null);
      setCurrentPage(1);
      setStartDate('');
      setEndDate('');
      return;
    }

    if (changed) {
      setViewMode('apps');
      setSelectedApp(null);
      setCurrentPage(1);
      setStartDate('');
      setEndDate('');
      dispatch(clearAppHistory());
      dispatch(clearSearchResults());
      dispatch(clearDateRangeResults());
    }

    fetchApps();
  }, [selectedEmp, selectedDate, fetchApps, dispatch]);

  const renderAppsList = () => {
    if (!selectedEmp) {
      return (
        <div className="text-center py-16">
          <Users className="h-12 w-12 mx-auto mb-3 text-[#8FB3DA]/40" />
          <p className="text-[#9FC3EA] font-medium">No employee selected</p>
          <p className="text-sm text-[#8FB3DA] mt-1">Choose an employee above to explore their application usage</p>
        </div>
      );
    }
    if (appsListLoading) return <div className="py-12"><Loading message="Loading applications..." /></div>;
    if (appsListError) {
      return (
        <div className="py-8 text-center">
          <div className="bg-[#FB7185]/10 border border-[#FB7185]/20 rounded-2xl p-6">
            <AlertCircle className="h-10 w-10 mx-auto mb-3 text-[#FB7185]/60" />
            <p className="font-semibold text-white">{appsListError}</p>
          </div>
        </div>
      );
    }
    if (!appsList || appsList.length === 0) {
      return (
        <div className="text-center py-16">
          <Monitor className="h-12 w-12 mx-auto mb-3 text-[#8FB3DA]/40" />
          <p className="text-[#9FC3EA] font-medium">No applications found</p>
          <p className="text-sm text-[#8FB3DA] mt-1">
            {startDate && endDate 
              ? `No activity found for the selected date range (${startDate} to ${endDate})`
              : 'Try selecting a different employee or date'}
          </p>
        </div>
      );
    }

    const topDuration = appsList[0]?.totalDuration || 1;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {appsList.map((app) => {
          const tone = getAppTone(app.app);
          const t = TONE[tone];
          return (
            <button
              key={app.app}
              onClick={() => handleAppClick(app)}
              className="group bg-[#0E3A6E]/80 hover:bg-[#123B6E] backdrop-blur-sm border border-white/15 hover:border-[#4EA1FF]/40 rounded-2xl p-4 text-left transition-all duration-300 hover:shadow-xl hover:shadow-[#4EA1FF]/10 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${t.soft} rounded-xl flex items-center justify-center text-xl flex-shrink-0`}>
                  {getAppIcon(app.app)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {getDisplayAppName(app.app)}
                  </p>
                  <p className="text-xs text-[#8FB3DA]">
                    {app.usageCount} uses · {app.uniqueTitleCount} titles
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-mono font-semibold text-white">
                    {formatDuration(app.totalDuration)}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <SignalMeter percentage={(app.totalDuration / topDuration) * 100} tone={tone} segments={12} />
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  const renderPagination = (pagination) => {
    if (!pagination || pagination.totalPages <= 1) return null;
    const { page, totalPages } = pagination;
    return (
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-[#8FB3DA] font-medium">Page {page} of {totalPages}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="p-2 bg-[#0B3260]/70 hover:bg-white/10 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-white/10"
          >
            <ChevronLeft className="h-4 w-4 text-[#A9C6EA]" />
          </button>
          <span className="text-sm font-mono font-medium text-[#A9C6EA]">{page}/{totalPages}</span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-2 bg-[#0B3260]/70 hover:bg-white/10 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-white/10"
          >
            <ChevronRight className="h-4 w-4 text-[#A9C6EA]" />
          </button>
        </div>
      </div>
    );
  };

  const renderAppHistory = () => {
    if (appHistoryLoading) return <div className="py-12"><Loading message="Loading history..." /></div>;
    if (appHistoryError) {
      return (
        <div className="py-8 text-center">
          <div className="bg-[#FB7185]/10 border border-[#FB7185]/20 rounded-2xl p-6">
            <AlertCircle className="h-10 w-10 mx-auto mb-3 text-[#FB7185]/60" />
            <p className="font-semibold text-white">{appHistoryError}</p>
          </div>
        </div>
      );
    }
    if (!appHistory.data || appHistory.data.length === 0) {
      return (
        <div className="text-center py-16">
          <FileText className="h-12 w-12 mx-auto mb-3 text-[#8FB3DA]/40" />
          <p className="text-[#9FC3EA] font-medium">No history found</p>
          <p className="text-sm text-[#8FB3DA] mt-1">No activity recorded for this application in the selected range</p>
        </div>
      );
    }
    return (
      <>
        <div className="space-y-2">
          {appHistory.data.map((item, index) => <ActivityRow key={item._id || index} item={item} />)}
        </div>
        {renderPagination(appHistory.pagination)}
      </>
    );
  };

  // Subtitle based on current view and filters
  const getSubtitle = () => {
    if (viewMode === 'history' && selectedApp) {
      let subtitle = `History for ${getDisplayAppName(selectedApp.app)}`;
      if (startDate && endDate) {
        subtitle += ` (${startDate} to ${endDate})`;
      } else if (selectedDate) {
        subtitle += ` (${selectedDate})`;
      }
      return subtitle;
    }
    if (viewMode === 'apps') {
      if (startDate && endDate) {
        return `Applications used from ${startDate} to ${endDate}`;
      }
      if (selectedDate) {
        return `Applications used on ${selectedDate}`;
      }
      return 'Browse all applications used';
    }
    return '';
  };

  return (
    <div className="bg-[#0B3260]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl shadow-[#4EA1FF]/8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-[#4EA1FF]/20 to-[#22D3EE]/20 rounded-xl">
            <Layers className="h-4.5 w-4.5 text-[#4EA1FF]" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-white tracking-tight">Application Explorer</h3>
            <p className="text-xs text-[#8FB3DA] font-medium">{getSubtitle()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {viewMode !== 'apps' && (
            <button
              onClick={backToApps}
              className="px-3 py-1.5 bg-[#0B3260]/70 hover:bg-white/10 rounded-xl text-xs text-[#A9C6EA] hover:text-white font-medium transition-colors border border-white/10"
            >
              ← Back to Apps
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            disabled={!selectedEmp}
            className={`p-2 rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${showFilters ? 'bg-[#4EA1FF]/10 text-[#4EA1FF] ring-1 ring-[#4EA1FF]/30' : 'bg-[#0B3260]/70 hover:bg-white/10 text-[#A9C6EA]'} border border-white/10`}
            aria-label="Toggle filters"
          >
            <Calendar className="h-4 w-4" />
          </button>
          <button
            onClick={() => { clearDateRange(); }}
            disabled={!selectedEmp || appsListLoading}
            className="p-2 bg-[#0B3260]/70 hover:bg-white/10 rounded-xl transition-colors border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Refresh"
          >
            <RefreshCw className={`h-4 w-4 text-[#A9C6EA] ${appsListLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Date Range Filter Panel */}
      {showFilters && selectedEmp && (
        <div className="mb-4 p-4 bg-[#0B3260]/70 backdrop-blur-sm border border-white/15 rounded-xl">
          <form onSubmit={handleDateRangeSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-[#A9C6EA] block mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#0E3A6E]/80 text-white border border-white/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA1FF]/40 focus:border-[#4EA1FF]/40"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-[#A9C6EA] block mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#0E3A6E]/80 text-white border border-white/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4EA1FF]/40 focus:border-[#4EA1FF]/40"
              />
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                type="submit"
                disabled={!startDate || !endDate}
                className="px-4 py-2 bg-gradient-to-r from-[#4EA1FF] to-[#22D3EE] hover:shadow-xl hover:shadow-[#4EA1FF]/25 rounded-xl text-sm text-white font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Apply Date Range
              </button>
              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={clearDateRange}
                  className="px-4 py-2 bg-[#FB7185]/20 hover:bg-[#FB7185]/30 rounded-xl text-sm text-[#FB7185] font-medium transition-all duration-200 border border-[#FB7185]/20"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Content */}
      <div className="min-h-[300px]">
        {viewMode === 'apps' && renderAppsList()}
        {viewMode === 'history' && renderAppHistory()}
      </div>
    </div>
  );
}

export default memo(AppDetailsViewer);