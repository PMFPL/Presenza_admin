// ApplicationUsedByEmp.jsx
import {
  ChevronDown, Monitor, Clock, Activity, Award,
  ChevronUp, Zap, RefreshCw, LayoutGrid
} from 'lucide-react';
import React, { memo, useMemo, useCallback, useRef } from 'react';
import { useApplicationUsedByEmp } from './useApplicationUsedByEmp';
import { formatDurationFromSeconds } from '../../../utils/formattedDurationFromSeconds';
import Loading from '../../common/Loading';
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

function ApplicationUsedByEmp({ selectedEmp, selectedDate }) {
  const {
    showAll,
    toggleShow,
    loading,
    error,
    displayedApps,
    hasMoreRecords,
    hasData,
    totalCount,
    efficiency,
    refetch
  } = useApplicationUsedByEmp({ selectedEmp, selectedDate });

  const totalTime = useMemo(() => {
    if (!displayedApps || displayedApps.length === 0) return 1;
    return displayedApps.reduce((sum, app) => sum + (app.totalDuration || 0), 0);
  }, [displayedApps]);

  const handleRefresh = useCallback(() => {
    if (selectedEmp && typeof refetch === 'function') refetch();
  }, [selectedEmp, refetch]);

  const panelRef = useRef(null);
  const listEndRef = useRef(null);

  const handleToggleShow = useCallback(() => {
    const wasExpanded = showAll;
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
  }, [showAll, toggleShow]);

  const appItems = useMemo(() => {
    if (!displayedApps || displayedApps.length === 0) return null;

    return displayedApps.map((application, index) => {
      const percentage = Math.min(((application.totalDuration || 0) / totalTime) * 100, 100);
      const tone = getAppTone(application.app);
      const t = TONE[tone];
      const rank = index + 1;

      return (
        <div
          key={`${application.app}-${index}`}
          className="group bg-[#0E3A6E]/80 hover:bg-[#123B6E] backdrop-blur-sm rounded-xl p-3.5 transition-all duration-300 border border-white/15 hover:border-[#4EA1FF]/40 hover:shadow-xl hover:shadow-[#4EA1FF]/10"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`flex-shrink-0 w-10 h-10 ${t.soft} rounded-xl flex items-center justify-center text-lg`}>
                {getAppIcon(application.app)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate" title={application.title || getDisplayAppName(application.app)}>
                  {application.title || getDisplayAppName(application.app)}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Activity className={`h-3 w-3 ${t.text} flex-shrink-0`} />
                  <p className="text-xs text-[#8FB3DA] font-medium truncate" title={application.app}>{getDisplayAppName(application.app)}</p>
                  {rank <= 3 && (
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${RANK_STYLE[rank]}`}>
                      #{rank}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl flex-shrink-0">
              <Clock className="h-3 w-3 text-[#8FB3DA]" />
              <span className="text-sm font-mono font-semibold text-white">
                {formatDurationFromSeconds(application.totalDuration)}
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <SignalMeter percentage={percentage} tone={tone} />
            <span className="text-[11px] font-mono text-[#8FB3DA] w-9 text-right flex-shrink-0">
              {Math.round(percentage)}%
            </span>
          </div>
        </div>
      );
    });
  }, [displayedApps, totalTime]);

  const emptyState = useMemo(() => (
    <div className="py-12 text-center">
      <div className="text-[#8FB3DA] bg-[#0B3260]/70 backdrop-blur-sm border border-white/15 rounded-2xl p-8">
        <Monitor className="h-14 w-14 mx-auto mb-4 text-[#8FB3DA]/30" />
        <p className="font-semibold text-white">No applications found</p>
        <p className="text-sm text-[#8FB3DA] mt-1">
          {selectedEmp ? 'This employee hasn\'t used any applications yet' : 'Select an employee to view application data'}
        </p>
      </div>
    </div>
  ), [selectedEmp]);

  const errorState = useMemo(() => (
    <div className="py-8 text-center">
      <div className="bg-[#FB7185]/10 border border-[#FB7185]/20 rounded-2xl p-6">
        <RefreshCw className="h-10 w-10 mx-auto mb-3 text-[#FB7185]/60" />
        <p className="font-semibold text-white">{error}</p>
        <p className="text-sm text-[#8FB3DA] mt-1">Try refreshing or selecting a different employee</p>
      </div>
    </div>
  ), [error]);

  return (
    <div ref={panelRef} className="bg-[#0B3260]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl shadow-[#4EA1FF]/8 scroll-mt-4">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-[#4EA1FF]/20 to-[#22D3EE]/20 rounded-xl">
            <LayoutGrid className="h-4.5 w-4.5 text-[#4EA1FF]" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-white flex items-center gap-2 tracking-tight">
              Top Applications
              {hasData && (
                <span className="text-[10px] font-mono font-semibold text-[#4EA1FF] bg-[#4EA1FF]/10 px-2 py-0.5 rounded-full">
                  {totalCount}
                </span>
              )}
            </h3>
            <p className="text-xs text-[#8FB3DA] font-medium">Most used applications by employee</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {efficiency?.score && efficiency.score !== 'N/A' && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#FBBF24]/10 rounded-full">
              <Zap className="h-3 w-3 text-[#FBBF24]" />
              <span className="text-[11px] font-mono font-semibold text-[#FBBF24]">{efficiency.score}</span>
            </div>
          )}
          {selectedEmp && (
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 bg-[#0B3260]/70 hover:bg-white/10 rounded-xl transition-colors duration-200 disabled:opacity-50 border border-white/10"
              aria-label="Refresh applications data"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-[#A9C6EA] ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full">
            <Award className="h-3 w-3 text-[#4EA1FF]" />
            <span className="text-[11px] font-mono font-medium text-[#A9C6EA]">{hasData ? `${displayedApps.length}` : '0'}</span>
          </div>
        </div>
      </div>

      <div className={`space-y-2.5 ${!showAll ? 'max-h-[480px] overflow-y-auto custom-scrollbar' : 'overflow-visible'}`}>
        {loading ? (
          <div className="py-12"><Loading message="Fetching application data..." /></div>
        ) : error ? (
          errorState
        ) : hasData ? (
          appItems
        ) : (
          emptyState
        )}
        <div ref={listEndRef} />
      </div>

      {!loading && !error && hasMoreRecords && (
        <button
          onClick={handleToggleShow}
          className="mt-4 w-full text-sm text-[#4EA1FF] hover:text-[#7DB8FF] hover:bg-[#4EA1FF]/10 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 font-semibold border border-[#4EA1FF]/20 hover:border-[#4EA1FF]/40 group"
          aria-label={showAll ? 'Show less applications' : 'Show more applications'}
        >
          <span>{showAll ? 'Show less' : `Show more (${displayedApps.length} of ${totalCount})`}</span>
          {showAll ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4 group-hover:translate-y-0.5 transition-transform duration-200" />
          )}
        </button>
      )}
    </div>
  );
}

export default memo(ApplicationUsedByEmp);