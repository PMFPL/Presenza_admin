import { MapPin, Clock, Calendar, User, Building, Info } from "lucide-react";
import { formatedTime } from "../../../utils/formateddateAndTime";
import { formatDuration } from "../../../utils/formatedDuration";
import React, { useRef, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';


// Image Cell Component
const ImageCell = ({ imageUrl, onShowImage, alt = "Image" }) => {
  if (!imageUrl) return <span className="text-white/20">—</span>;
  
  return (
    <div className="flex items-center justify-center">
      <div 
        className="h-14 w-14 rounded-full overflow-hidden cursor-pointer border-2 border-white/10 hover:border-white/30 transition-all duration-200 hover:scale-105"
        onClick={() => onShowImage(imageUrl)}
      >
        <img 
          className="object-cover w-full h-full" 
          src={imageUrl} 
          alt={alt}
          loading="lazy"
        />
      </div>
    </div>
  );
};

// Location Cell Component

const LocationCell = ({ location }) => {
  const [tip, setTip] = useState({ show: false, x: 0, y: 0, text: '' });
  const textRef = useRef(null);

  // Supports BOTH: a plain address string OR a { address, latitude, longitude } object
  const address =
    typeof location === 'string'
      ? location
      : location?.address || null;

  const coords =
    typeof location === 'object' && location?.latitude != null && location?.longitude != null
      ? `${Number(location.latitude).toFixed(6)}, ${Number(location.longitude).toFixed(6)}`
      : null;

  const handleEnter = () => {
    const el = textRef.current;
    if (!el) return;
    // Only show tooltip if text is actually truncated
    const isClamped = el.scrollHeight > el.clientHeight + 1;
    if (!isClamped) return;
    const rect = el.getBoundingClientRect();
    setTip({
      show: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
      text: address,
    });
  };

  const handleLeave = () => setTip((t) => ({ ...t, show: false }));

  // No address, but we have coordinates
  if (!address && coords) {
    return <span className="text-white/40 text-xs font-mono">{coords}</span>;
  }

  // Nothing at all
  if (!address || address === 'Address unavailable') {
    return <span className="text-white/20">—</span>;
  }

  return (
    <>
      <div className="flex items-start justify-center gap-1.5 w-full">
        <MapPin size={12} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <span
          ref={textRef}
          className="text-white/80 text-left text-[12.5px] leading-snug cursor-help"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
        >
          {address}
        </span>
      </div>

      {tip.show &&
        createPortal(
          <div
            className="pointer-events-none"
            style={{
              position: 'fixed',
              left: tip.x,
              top: tip.y,
              transform: 'translate(-50%, calc(-100% - 8px))',
              zIndex: 99999,
              maxWidth: 340,
            }}
          >
            <div className="bg-[#0B3260] border border-white/15 text-white/90 text-xs leading-snug rounded-lg px-3 py-2 shadow-2xl shadow-black/60 whitespace-normal break-words">
              {tip.text}
            </div>
            <div className="w-2 h-2 bg-[#0B3260] border-r border-b border-white/15 rotate-45 mx-auto -mt-1" />
          </div>,
          document.body
        )}
    </>
  );
};

export default LocationCell;

// ------ Attendance Details Sessions Table -----------------
export const getAttendanceDetailsColumn = ({ showImage }) => [
  {
    header: "Punch In",
    render: (row) => (
      <div className="flex flex-col">
        <span className="text-white/80 text-sm">{formatedTime(row.punchIn) || '—'}</span>
        {row.autoPunchedOut && (
          <span className="text-yellow-400/50 text-[10px]">Auto</span>
        )}
      </div>
    ),
  },
  {
    header: "In Location",
    render: (row) => <LocationCell location={row.punchInLocation} />,
  },
  {
    header: "In Image",
    render: (row) => (
      <ImageCell 
        imageUrl={row.punchInLocation?.imageUrl} 
        onShowImage={showImage}
        alt="Punch In"
      />
    ),
  },
  {
    header: "Punch Out",
    render: (row) => {
      const location = row.punchOutLocation;
      if (!location || location.address?.includes('Auto')) {
        return <span className="text-white/30">—</span>;
      }
      return <span className="text-white/80 text-sm">{formatedTime(row.punchOut) || '—'}</span>;
    },
  },
  {
    header: "Out Location",
    render: (row) => {
      const location = row.punchOutLocation;
      if (!location || location.address?.includes('Auto')) {
        return <span className="text-white/30">—</span>;
      }
      return <LocationCell location={location} />;
    },
  },
  {
    header: "Out Image",
    render: (row) => {
      const location = row.punchOutLocation;
      if (!location || location.address?.includes('Auto')) {
        return <span className="text-white/20">—</span>;
      }
      return (
        <ImageCell 
          imageUrl={location?.imageUrl} 
          onShowImage={showImage}
          alt="Punch Out"
        />
      );
    },
  },
  {
    header: "Duration",
    render: (row) => (
      <span className="text-white/70 text-sm font-mono">
        {row.durationMinutes ? formatDuration(row.durationMinutes) : '—'}
      </span>
    ),
  },
];

// -------- Attendance Details Breaks Table --------------
export const getAttendanceSessionBreakColumn = () => [
  {
    header: "Break In",
    render: (row) => <span className="text-white/80 text-sm">{formatedTime(row.breakIn) || '—'}</span>,
  },
  {
    header: "Break Out",
    render: (row) => <span className="text-white/80 text-sm">{formatedTime(row.breakOut) || '—'}</span>,
  },
  {
    header: "Duration",
    render: (row) => <span className="text-white/70 text-sm font-mono">{formatDuration(row.durationMinutes) || '—'}</span>,
  },
  {
    header: "Type",
    render: (row) => (
      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400/80 text-xs">
        {row.breakType || '—'}
      </span>
    ),
  },
  {
    header: "Remarks",
    render: (row) => <span className="text-white/50 text-sm">{row.remarks || '—'}</span>,
  },
];

// -------- Attendance Details Visits Table --------------
export const getAttendanceSessionVisitColumn = ({ showImage }) => [
  {
    header: "Visit In",
    render: (row) => <span className="text-white/80 text-sm">{formatedTime(row.visitIn) || '—'}</span>,
  },
  {
    header: "Visit Out",
    render: (row) => <span className="text-white/80 text-sm">{formatedTime(row.visitOut) || '—'}</span>,
  },
  {
    header: "Duration",
    render: (row) => <span className="text-white/70 text-sm font-mono">{formatDuration(row.durationMinutes) || '—'}</span>,
  },
  {
    header: "Type",
    render: (row) => (
      <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400/80 text-xs">
        {row.visitType || '—'}
      </span>
    ),
  },
  {
    header: "Customer",
    render: (row) => <span className="text-white/70 text-sm">{row.customerName || '—'}</span>,
  },
  {
    header: "Purpose",
    render: (row) => <span className="text-white/60 text-sm max-w-[150px] truncate">{row.purpose || '—'}</span>,
  },
  {
    header: "Status",
    render: (row) => {
      const statusColors = {
        'COMPLETED': 'bg-green-500/20 text-green-400 border-green-500/30',
        'IN_PROGRESS': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'CANCELLED': 'bg-red-500/20 text-red-400 border-red-500/30',
        'PENDING': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      };
      const color = statusColors[row.status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${color}`}>
          {row.status || '—'}
        </span>
      );
    },
  },
  {
    header: "In Location",
    render: (row) => <LocationCell location={row.punchInLocation} />,
  },
  {
    header: "Out Location",
    render: (row) => <LocationCell location={row.punchOutLocation} />,
  },
  {
    header: "In Image",
    render: (row) => (
      <ImageCell 
        imageUrl={row.punchInLocation?.imageUrl} 
        onShowImage={showImage}
        alt="Visit In"
      />
    ),
  },
  {
    header: "Out Image",
    render: (row) => (
      <ImageCell 
        imageUrl={row.punchOutLocation?.imageUrl} 
        onShowImage={showImage}
        alt="Visit Out"
      />
    ),
  },
  {
    header: "Remarks",
    render: (row) => <span className="text-white/50 text-sm">{row.remarks || '—'}</span>,
  },
];

// -------- Short Leave Summary Component --------
export const ShortLeaveSummary = ({ morningShortLeave, eveningShortLeave, className = "" }) => {
  const hasMorning = morningShortLeave?.isShortLeave && morningShortLeave?.minutes > 0;
  const hasEvening = eveningShortLeave?.isShortLeave && eveningShortLeave?.minutes > 0;

  if (!hasMorning && !hasEvening) return null;

  return (
    <div className={`bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-yellow-500/20 rounded-lg">
          <Clock size={16} className="text-yellow-400" />
        </div>
        <h5 className="text-yellow-400/90 font-medium text-sm">Short Leave Summary</h5>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {hasMorning && (
          <div className="bg-white/5 rounded-lg p-3 border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-white/40 text-xs">Morning Short Leave</span>
              <span className="text-yellow-400 font-semibold text-sm">
                {formatDuration(morningShortLeave.minutes)}
              </span>
            </div>
          </div>
        )}
        {hasEvening && (
          <div className="bg-white/5 rounded-lg p-3 border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-white/40 text-xs">Evening Short Leave</span>
              <span className="text-yellow-400 font-semibold text-sm">
                {formatDuration(eveningShortLeave.minutes)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};