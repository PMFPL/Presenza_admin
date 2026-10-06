import {
  ChevronDown, Clock, Activity, FolderOpen,
  RefreshCw, ChevronUp, Sparkles
} from 'lucide-react';
import { memo, useMemo, useCallback, useRef } from 'react';
import { useWindowsUsedByEmp } from './useWindowsUsedByEmp';
import Loading from '../../common/Loading';
import { formatDurationFromSeconds } from '../../../utils/formattedDurationFromSeconds';
import { TONE, RANK_STYLE, getDisplayAppName, getAppIcon, getAppTone } from '../../../utils/appDisplay';

const SignalMeter = memo(({ percentage = 0, tone = 'primary', segments = 20 }) => {
  const pct = Number.isFinite(percentage) ? Math.min(Math.max(percentage, 0), 100) : 0;
  const filled = Math.round((pct / 100) * segments);
  const t = TONE[tone] || TONE.primary;
  return (
    <div className="flex items-center gap-[3px] h-1.5 flex-1">
      {Array.from({ length: segments }).map((_, i) => (
        <div key={i} className={`flex-1 rounded-full transition-all duration-700 ${i < filled ? t.bg : 'bg-white/10'}`} style={{ transitionDelay: `${i * 10}ms`, height: i < filled ? '100%' : '60%' }} />
      ))}
    </div>
  );
});
SignalMeter.displayName = 'SignalMeter';

function WindowsUsedByEmp({ selectedEmp = '', selectedDate = '' }) {
  const {
    loading,
    error,
    totalRecords,
    displayedApps,
    isExpanded,
    hasData,
    toggleShow,
    refetch
  } = useWindowsUsedByEmp({ selectedEmp, selectedDate });

  const panelRef = useRef(null);
  const listEndRef = useRef(null);

  const handleToggleShow = useCallback(() => {
    const wasExpanded = isExpanded;
    toggleShow();
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (!wasExpanded) {
          listEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 80);
    });
  }, [isExpanded, toggleShow]);

  const totalTime = useMemo(() => {
    if (!displayedApps || displayedApps.length === 0) return 1;
    return displayedApps.reduce((sum, win) => sum + (win.duration || 0), 0);
  }, [displayedApps]);

  const processedData = useMemo(() => {
    if (!displayedApps || displayedApps.length === 0) return [];
    const sorted = [...displayedApps].sort((a, b) => (b.duration || 0) - (a.duration || 0));
    return sorted.map((item, index) => ({
      ...item,
      percentage: totalTime > 0 ? Math.min(((item.duration || 0) / totalTime) * 100, 100) : 0,
      rank: index + 1
    }));
  }, [displayedApps, totalTime]);

  const handleRefresh = useCallback(() => {
    if (selectedEmp) refetch();
  }, [selectedEmp, refetch]);

  const windowItems = useMemo(() => {
    if (!processedData || processedData.length === 0) return null;

    return processedData.map((window, index) => {
      const tone = getAppTone(window.app);
      const t = TONE[tone];
      return (
        <div
          key={`${window.title}-${index}`}
          className="group bg-[#0B3260]/45 hover:bg-[#123B6E]/90 backdrop-blur-sm rounded-xl p-3.5 transition-all duration-300 border border-white/15 hover:border-[#4EA1FF]/30 hover:shadow-lg hover:shadow-[#4EA1FF]/10"
        >
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 w-10 h-10 ${t.soft} rounded-xl flex items-center justify-center text-lg`}>
              {getAppIcon(window.app)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-white truncate group-hover:text-[#4EA1FF] transition-colors flex-1" title={window.title}>
                  {window.title || 'Untitled Window'}
                </p>
                <span className="text-xs font-mono font-semibold text-white bg-white/10 px-2.5 py-1 rounded-xl flex-shrink-0 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-[#B8C7DA]" />
                  {formatDurationFromSeconds(window.duration)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Activity className={`h-3 w-3 ${t.text} flex-shrink-0`} />
                <span className="text-xs text-[#B8C7DA] font-medium truncate" title={window.app}>{getDisplayAppName(window.app)}</span>
                {window.rank <= 3 && (
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${RANK_STYLE[window.rank]}`}>
                    #{window.rank}
                  </span>
                )}
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <SignalMeter percentage={window.percentage} tone={tone} />
                <span className="text-[11px] font-mono text-[#B8C7DA] w-9 text-right flex-shrink-0">
                  {Math.round(window.percentage)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    });
  }, [processedData]);

  const emptyState = useMemo(() => (
    <div className="py-12 text-center">
      <div className="text-[#B8C7DA] bg-[#0B3260]/45 backdrop-blur-sm border border-white/15 rounded-2xl p-8">
        <FolderOpen className="h-14 w-14 mx-auto mb-4 text-[#B8C7DA]/30" />
        <p className="font-semibold text-white">No windows found</p>
        <p className="text-sm text-[#B8C7DA] mt-1">
          {selectedEmp ? 'This employee hasn\'t opened any windows yet' : 'Select an employee to view window data'}
        </p>
      </div>
    </div>
  ), [selectedEmp]);

  const errorState = useMemo(() => (
    <div className="py-8 text-center">
      <div className="bg-[#FB7185]/10 border border-[#FB7185]/20 rounded-2xl p-6">
        <RefreshCw className="h-10 w-10 mx-auto mb-3 text-[#FB7185]/60" />
        <p className="font-semibold text-white">{error}</p>
        <p className="text-sm text-[#B8C7DA] mt-1">Try refreshing or selecting a different employee</p>
      </div>
    </div>
  ), [error]);

  return (
    <div ref={panelRef} className="bg-[#0B3260]/60 backdrop-blur-xl border border-white/60 rounded-2xl p-5 shadow-xl shadow-[#4EA1FF]/5 scroll-mt-4">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-[#4EA1FF]/20 to-[#22D3EE]/20 rounded-xl">
            <Sparkles className="h-4.5 w-4.5 text-[#4EA1FF]" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-white flex items-center gap-2 tracking-tight">
              Top Window Titles
              {hasData && (
                <span className="text-[10px] font-mono font-semibold text-[#4EA1FF] bg-[#4EA1FF]/10 px-2 py-0.5 rounded-full">
                  {totalRecords}
                </span>
              )}
            </h3>
            <p className="text-xs text-[#B8C7DA] font-medium">Most active windows and tabs</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedEmp && (
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 bg-[#0B3260]/60 hover:bg-white/10 rounded-xl transition-colors duration-200 disabled:opacity-50 border border-white/10"
              aria-label="Refresh windows data"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-[#CBD5E1] ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full">
            <Activity className="h-3 w-3 text-[#4EA1FF]" />
            <span className="text-[11px] font-mono font-medium text-[#CBD5E1]">
              {hasData ? `${processedData.length} active` : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      <div className={`space-y-2.5 ${!isExpanded ? 'max-h-[480px] overflow-y-auto custom-scrollbar' : 'overflow-visible'}`}>
        {loading && <div className="py-12"><Loading message="Fetching window data..." /></div>}
        {!loading && error && errorState}
        {!loading && !error && hasData && processedData.length > 0 && windowItems}
        {!loading && !error && !hasData && emptyState}
        <div ref={listEndRef} />
      </div>

      {!loading && !error && totalRecords > 5 && (
        <button
          onClick={handleToggleShow}
          className="mt-4 w-full text-sm text-[#4EA1FF] hover:text-[#7DB8FF] hover:bg-[#4EA1FF]/10 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 font-semibold border border-[#4EA1FF]/20 hover:border-[#4EA1FF]/40 group"
          aria-label={isExpanded ? 'Show less windows' : 'Show more windows'}
        >
          <span>{isExpanded ? 'Show less' : `Show more (${displayedApps.length} of ${totalRecords})`}</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4 group-hover:translate-y-0.5 transition-transform duration-200" />
          )}
        </button>
      )}
    </div>
  );
}

export default memo(WindowsUsedByEmp);