// ActivityStatus.jsx
import {
  AlertCircle, Clock, Monitor, Brain, Zap, Coffee,
  Activity, Gauge, Award, Flame, Radio, LayoutDashboard
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectEfficiency, selectStatsLoading, selectStatsError } from '../../../components/tracker/application/slice/applicationUsedByEmpSlice';
import { useMemo, memo } from 'react';
import Loading from '../../../components/common/Loading';
import { TONE, getDisplayAppName, getAppIcon, getAppTone } from '../../../utils/appDisplay';

const getProductivityStatus = (score) => {
  if (score >= 80) return { label: 'Excellent', tone: 'emerald', icon: '🟢' };
  if (score >= 60) return { label: 'Good', tone: 'primary', icon: '🔵' };
  if (score >= 40) return { label: 'Average', tone: 'amber', icon: '🟡' };
  return { label: 'Needs Focus', tone: 'rose', icon: '🔴' };
};

const SignalMeter = memo(({ percentage = 0, tone = 'primary', segments = 24, height = 'h-2.5' }) => {
  const pct = Number.isFinite(percentage) ? Math.min(Math.max(percentage, 0), 100) : 0;
  const filled = Math.round((pct / 100) * segments);
  const t = TONE[tone] || TONE.primary;
  return (
    <div className={`flex items-center gap-[3px] ${height}`} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 rounded-full transition-all duration-700 ease-out ${i < filled ? t.bg : 'bg-white/10'}`}
          style={{ height: i < filled ? '100%' : '45%', transitionDelay: `${i * 12}ms` }}
        />
      ))}
    </div>
  );
});
SignalMeter.displayName = 'SignalMeter';

const Eyebrow = ({ children, tone = 'primary' }) => (
  <span className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${TONE[tone]?.text || 'text-[#8FB3DA]'}`}>
    {children}
  </span>
);

const GaugeTile = memo(({ icon: Icon, label, value, subtitle, percentage, tone = 'primary' }) => {
  const t = TONE[tone] || TONE.primary;
  return (
    <div className="group relative bg-[#0E3A6E]/80 backdrop-blur-sm border border-white/15 rounded-2xl p-5 overflow-hidden hover:border-[#4EA1FF]/40 hover:shadow-xl hover:shadow-[#4EA1FF]/10 transition-all duration-300">
      <div className={`pointer-events-none absolute -top-10 -right-10 w-28 h-28 rounded-full ${t.soft} blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="relative flex items-start justify-between mb-4">
        <Eyebrow tone={tone}>{label}</Eyebrow>
        <div className={`p-2 rounded-xl ${t.soft} ring-1 ${t.ring}`}>
          <Icon className={`h-3.5 w-3.5 ${t.text}`} />
        </div>
      </div>
      <div className="relative">
        <h3 className="text-[26px] leading-none font-mono font-bold text-white tracking-tight truncate" title={typeof value === 'string' ? value : undefined}>
          {value}
        </h3>
        {subtitle && <p className="text-xs text-[#8FB3DA] mt-2 font-medium">{subtitle}</p>}
      </div>
      {percentage !== undefined && (
        <div className="relative mt-4">
          <SignalMeter percentage={percentage} tone={tone} />
        </div>
      )}
    </div>
  );
});
GaugeTile.displayName = 'GaugeTile';

const MetricChip = memo(({ icon: Icon, label, value, sub, tone = 'primary' }) => {
  const t = TONE[tone] || TONE.primary;
  return (
    <div className="bg-[#0B3260]/70 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-3 hover:bg-[#123B6E] hover:border-[#4EA1FF]/30 transition-all duration-300">
      <div className="flex items-center gap-2 text-[#8FB3DA] mb-1.5">
        <Icon className={`h-3.5 w-3.5 ${t.text}`} />
        <span className="text-[10px] uppercase tracking-[0.14em] font-semibold">{label}</span>
      </div>
      <p className="text-lg font-mono font-bold text-white leading-none">{value}</p>
      {sub && <p className="text-[11px] text-[#8FB3DA] mt-1 font-medium">{sub}</p>}
    </div>
  );
});
MetricChip.displayName = 'MetricChip';

function ActivityStats() {
  const efficiencyData = useSelector(selectEfficiency);
  const loading = useSelector(selectStatsLoading);
  const error = useSelector(selectStatsError);

  const {
    totalActiveTime = 0,
    activeFormatted = '0m',
    activePercentage = 0,
    totalIdleTime = 0,
    idleFormatted = '0m',
    idlePercentage = 0,
    totalFormatted = '0m',
    mostUsedAppName = 'N/A',
    mostUsedFormatted = '0m',
    mostUsedAppPercentage = 0,
    productivity = { level: 'No Data', emoji: '📭', score: 0 },
    efficiency = { score: 'N/A', level: 'No Data' },
    appBreakdown = [],
    totalActivities = 0,
    totalTrackedTime = 0,
  } = efficiencyData || {};

  const hasData = totalTrackedTime > 0;
  const productivityStatus = getProductivityStatus(productivity.score || 0);

  const activeIdleRatio = useMemo(() => {
    if (!totalIdleTime) return totalActiveTime > 0 ? '∞' : '—';
    return (totalActiveTime / totalIdleTime).toFixed(1) + ':1';
  }, [totalActiveTime, totalIdleTime]);

  const efficiencyTone = useMemo(() => {
    const score = typeof efficiency.score === 'string' ? efficiency.score : 'N/A';
    if (score === 'High') return 'emerald';
    if (score === 'Medium') return 'amber';
    if (score === 'Low') return 'rose';
    return 'primary';
  }, [efficiency.score]);

  if (loading) {
    return (
      <div className="bg-[#0B3260]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl shadow-[#4EA1FF]/8">
        <Loading message="Analyzing activity data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#0B3260]/70 backdrop-blur-xl border border-[#FB7185]/20 rounded-2xl p-8 shadow-xl shadow-[#4EA1FF]/8">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 mx-auto mb-3 text-[#FB7185]/60" />
          <p className="font-semibold text-white">Unable to load statistics</p>
          <p className="text-sm text-[#8FB3DA] mt-1 font-mono">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-1">
        <div className="p-1.5 bg-gradient-to-br from-[#4EA1FF]/20 to-[#22D3EE]/20 rounded-lg">
          <LayoutDashboard className="h-4 w-4 text-[#4EA1FF]" />
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8FB3DA]">Live Session Metrics</span>
        {hasData && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34D399]" />
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <GaugeTile
          icon={Zap}
          label="Active Time"
          value={activeFormatted}
          subtitle={`${activePercentage}% of tracked time`}
          percentage={activePercentage}
          tone="emerald"
        />
        <GaugeTile
          icon={Monitor}
          label="Top Application"
          value={mostUsedAppName ? getDisplayAppName(mostUsedAppName) : 'No Data'}
          subtitle={`${mostUsedFormatted} · ${mostUsedAppPercentage}% share`}
          percentage={mostUsedAppPercentage}
          tone="primary"
        />
        <GaugeTile
          icon={Coffee}
          label="Idle Time"
          value={idleFormatted}
          subtitle={`${idlePercentage}% of tracked time`}
          percentage={idlePercentage}
          tone="rose"
        />
        <GaugeTile
          icon={Brain}
          label="Productivity"
          value={`${productivity.score}%`}
          subtitle={`${productivityStatus.icon} ${productivityStatus.label}`}
          percentage={productivity.score}
          tone={productivityStatus.tone}
        />
      </div>

      {hasData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricChip icon={Award} label="Efficiency" value={efficiency.score || 'N/A'} sub={efficiency.level} tone={efficiencyTone} />
          <MetricChip icon={Clock} label="Total Tracked" value={totalFormatted} sub="Active + Idle" tone="primary" />
          <MetricChip icon={Gauge} label="Active / Idle" value={activeIdleRatio} sub="Work vs break" tone="emerald" />
          <MetricChip icon={Flame} label="Activities" value={totalActivities} sub="Total actions logged" tone="amber" />
        </div>
      )}

      {hasData && (
        <div className="bg-[#0B3260]/70 backdrop-blur-sm border border-white/15 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-[#8FB3DA]">
              <Radio className="h-3.5 w-3.5" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">Time Distribution</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono font-medium">
              <span className="flex items-center gap-1.5 text-[#34D399]"><span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />Active {activePercentage}%</span>
              <span className="flex items-center gap-1.5 text-[#FB7185]"><span className="w-1.5 h-1.5 rounded-full bg-[#FB7185]" />Idle {idlePercentage}%</span>
            </div>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden flex bg-white/10 gap-[2px]">
            <div className="h-full bg-gradient-to-r from-[#4EA1FF] to-[#34D399] rounded-l-full transition-all duration-1000" style={{ width: `${activePercentage}%` }} />
            <div className="h-full bg-gradient-to-r from-[#FB7185] to-[#FBBF24] rounded-r-full transition-all duration-1000" style={{ width: `${idlePercentage}%` }} />
          </div>
        </div>
      )}

      {hasData && appBreakdown.length > 0 && (
        <div className="bg-[#0B3260]/70 backdrop-blur-sm border border-white/15 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[#8FB3DA]">
              <Activity className="h-3.5 w-3.5" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">Application Breakdown</span>
            </div>
            <span className="text-[11px] font-mono font-medium text-[#8FB3DA]">{appBreakdown.length} apps</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {appBreakdown.slice(0, 8).map((app, index) => {
              const percentage = totalActiveTime > 0
                ? Math.round((app.totalDuration / 1000 / totalActiveTime) * 100)
                : 0;
              const tone = getAppTone(app._id);
              return (
                <div
                  key={app._id || index}
                  className="bg-[#0E3A6E]/80 backdrop-blur-sm border border-white/15 rounded-xl p-3 hover:bg-[#123B6E] hover:border-[#4EA1FF]/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base leading-none">{getAppIcon(app._id)}</span>
                    <p className="text-xs font-semibold text-white truncate flex-1" title={app._id}>{getDisplayAppName(app._id)}</p>
                    <span className="text-[11px] font-mono font-medium text-[#8FB3DA]">{percentage}%</span>
                  </div>
                  <SignalMeter percentage={percentage} tone={tone} segments={16} height="h-1.5" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!hasData && (
        <div className="bg-[#0B3260]/70 backdrop-blur-sm border border-white/15 rounded-2xl p-10 text-center">
          <LayoutDashboard className="h-10 w-10 mx-auto mb-3 text-[#8FB3DA]/30" />
          <p className="font-semibold text-white">No activity recorded yet</p>
          <p className="text-sm text-[#8FB3DA] mt-1">Select an employee and date to see live session metrics</p>
        </div>
      )}
    </div>
  );
}

export default memo(ActivityStats);