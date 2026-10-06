// Tracker.jsx
import { ChevronDown, RefreshCw, User, Calendar, Activity, LayoutDashboard } from 'lucide-react';
import { useTracker } from '../hook/useTracker';
import ApplicationUsedByEmp from '../../../components/tracker/application/ApplicationUsedByEmp';
import WindowsUsedByEmp from '../../../components/tracker/windows/WindowsUsedByEmp';
import Loading from '../../../components/common/Loading';
import ActivityStats from './ActivityStatus';
import AppDetailsViewer from '../../../components/tracker/AppDetailsViewer';
import GettingError from '../../../components/common/GettingError';
import { memo, useCallback } from 'react';
import { TONE, getEmployeeInitials, getEmployeeTone } from '../../../utils/appDisplay';

function Tracker() {
  const {
    selectedDate,
    setSelectedDate,
    employees,
    loading,
    error,
    selectedEmp,
    setSelectedEmp,
    isInitialized,
    hasEmployees,
    selectedEmployeeData,
    refetchEmployees
  } = useTracker();

  const handleEmployeeChange = useCallback((e) => {
    setSelectedEmp(e.target.value);
  }, [setSelectedEmp]);

  const handleDateChange = useCallback((e) => {
    setSelectedDate(e.target.value);
  }, [setSelectedDate]);

  const handleRefresh = useCallback(() => {
    refetchEmployees();
  }, [refetchEmployees]);

  const rootShell = "min-h-screen w-full bg-gradient-to-br from-[#032446] via-[#04305C] to-[#062F52]";

  if (loading && !isInitialized) {
    return (
      <div className={`${rootShell} flex items-center justify-center p-6`}>
        <Loading message="Initializing Dashboard..." />
      </div>
    );
  }

  if (error && !isInitialized) {
    return (
      <div className={`${rootShell} flex items-center justify-center p-6`}>
        <GettingError error={error} onRetry={handleRefresh} />
      </div>
    );
  }

  const avatarTone = selectedEmployeeData ? TONE[getEmployeeTone(selectedEmployeeData._id)] : TONE.primary;

  return (
    <div className={`${rootShell} px-4 sm:px-6 lg:px-8 xl:px-10 py-4 md:py-6`}>
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.07]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, #4EA1FF 1px, transparent 1px),
                           radial-gradient(circle at 80% 20%, #22D3EE 1px, transparent 1px),
                           radial-gradient(circle at 50% 80%, #FBBF24 1px, transparent 1px)`,
          backgroundSize: '60px 60px, 80px 80px, 70px 70px'
        }} />
      </div>

      <div className="relative w-full space-y-5">
        {/* Header */}
        <header className="flex flex-col 2xl:flex-row 2xl:items-center gap-4 2xl:gap-6 bg-[#0B3260]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-5 shadow-xl shadow-[#4EA1FF]/8">
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="relative p-2.5 bg-gradient-to-br from-[#4EA1FF]/20 to-[#22D3EE]/20 ring-1 ring-[#4EA1FF]/20 rounded-2xl">
              <LayoutDashboard className="h-6 w-6 text-[#4EA1FF]" />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#34D399] animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white whitespace-nowrap">
                  Activity Tracker
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#34D399] bg-[#34D399]/10 ring-1 ring-[#34D399]/20 px-2 py-0.5 rounded-full flex-shrink-0">
                  <Activity className="h-3 w-3" /> Live
                </span>
              </div>
              <p className="text-[#8FB3DA] text-xs md:text-sm mt-0.5 whitespace-nowrap hidden lg:block">
                Monitoring console for employee productivity &amp; application usage
              </p>
            </div>
          </div>

          <div className="hidden 2xl:block w-px h-10 bg-white/10 flex-shrink-0" />

          <div className="flex flex-1 flex-col sm:flex-row flex-wrap sm:flex-nowrap items-stretch sm:items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <select
                className="w-full appearance-none bg-[#0E3A6E]/80 text-white border border-white/15 rounded-xl pl-10 pr-9 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4EA1FF]/40 focus:border-[#4EA1FF]/40 transition-colors duration-200 hover:bg-[#123B6E] disabled:opacity-50 text-sm font-medium"
                value={selectedEmp}
                onChange={handleEmployeeChange}
                aria-label="Select employee"
                disabled={!hasEmployees}
              >
                <option value="" className="text-[#8FB3DA] bg-[#0B3260]">
                  {hasEmployees ? 'Select an employee' : 'No employees available'}
                </option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id} className="text-white bg-[#0B3260]">
                    {emp.fullName} {emp.email ? `(${emp.email})` : ''}
                  </option>
                ))}
              </select>
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4EA1FF] pointer-events-none" />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8FB3DA] pointer-events-none" />
            </div>

            <div className="relative min-w-[170px] sm:w-[190px]">
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full bg-[#0E3A6E]/80 text-white border border-white/15 rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#4EA1FF]/40 focus:border-[#4EA1FF]/40 transition-colors duration-200 hover:bg-[#123B6E] text-sm font-medium"
                aria-label="Select date"
                max={new Date().toISOString().split('T')[0]}
              />
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4EA1FF] pointer-events-none" />
            </div>

            <button
              onClick={handleRefresh}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#4EA1FF] to-[#22D3EE] hover:shadow-xl hover:shadow-[#4EA1FF]/25 rounded-xl text-white text-sm font-semibold transition-all duration-200 border border-transparent disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              disabled={loading}
              aria-label="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {selectedEmployeeData && (
            <div className="flex items-center gap-2.5 flex-shrink-0 2xl:pl-1 bg-white/5 border border-white/10 rounded-xl pl-1.5 pr-3 py-1.5">
              <span className={`flex-shrink-0 w-7 h-7 rounded-lg ${avatarTone.soft} ${avatarTone.text} flex items-center justify-center text-[11px] font-bold ring-1 ${avatarTone.ring}`}>
                {getEmployeeInitials(selectedEmployeeData.fullName)}
              </span>
              <p className="text-xs text-white font-semibold truncate max-w-[160px]">
                {selectedEmployeeData.fullName}
              </p>
            </div>
          )}
        </header>

        <ActivityStats />

        <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2">
            <AppDetailsViewer
              selectedEmp={selectedEmp}
              selectedDate={selectedDate}
            />
          </div>
          <div className="xl:col-span-1 space-y-5">
            <ApplicationUsedByEmp
              selectedEmp={selectedEmp}
              selectedDate={selectedDate}
            />
            <WindowsUsedByEmp
              selectedEmp={selectedEmp}
              selectedDate={selectedDate}
            />
          </div>
        </section>

        <footer className="text-center text-xs text-[#8FB3DA]/70 py-4 border-t border-white/10 font-mono">
          <p className="font-medium">© {new Date().getFullYear()} Activity Tracker — data is tracked securely.</p>
        </footer>
      </div>
    </div>
  );
}

export default memo(Tracker);