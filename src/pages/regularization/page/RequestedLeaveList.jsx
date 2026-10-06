import { useState } from 'react';
import { useRequestedLeaveList } from '../hook/useRequestedLeaveList';
import { getRequestedLeaveColumn } from '../data/leaveListColumn';
import Table from '../../../components/common/Table';
import Loading from '../../../components/common/Loading';
import GettingError from '../../../components/common/GettingError';
import { captalizeWords } from '../../../utils/captalizeWords';

// ⭐️ Max character limit
const MAX_CHARS = 100;

function RequestedLeaveList() {
  const {
    today,
    status,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    filteredLeaveList,
    searchEmpId,
    setSearchEmpId,
    loading,
    error,
    handleLeaveApproval,
    handleLeaveRejection,
  } = useRequestedLeaveList();

  // ---- Local state for remark modal ----
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const charCount = rejectionReason.length;
  const isOverLimit = charCount > MAX_CHARS;

  // ---- Handler to enforce character limit ----
  const handleRejectionChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setRejectionReason(value);
    } else {
      // Truncate to MAX_CHARS characters
      setRejectionReason(value.slice(0, MAX_CHARS));
    }
  };

  // ---- Functions to handle modal ----
  const openRemarkModal = (row) => {
    setSelectedLeave(row);
    setRejectionReason('');
    setShowRemarkModal(true);
  };

  const confirmRejection = async () => {
    if (!selectedLeave) return;
    await handleLeaveRejection(
      selectedLeave._id,
      selectedLeave.status,
      rejectionReason.trim() || 'No reason provided'
    );
    setShowRemarkModal(false);
    setSelectedLeave(null);
    setRejectionReason('');
  };

  const cancelRejection = () => {
    setShowRemarkModal(false);
    setSelectedLeave(null);
    setRejectionReason('');
  };

  // ---- Columns ----
  const columns = getRequestedLeaveColumn({
    handleLeaveApproval,
    handleLeaveRejection: openRemarkModal,
  });

  return (
    <>
      {loading && <Loading message="Fetching Requested Leave List..." />}
      {error ? (
        <GettingError error={error} />
      ) : (
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl py-6 shadow-xl">
          {/* ---- Filters ---- */}
          <div className="flex justify-between items-center flex-wrap gap-4 mb-5 px-6">
            <div className="w-100">
              <input
                type="text"
                placeholder="Search by Emp ID or Name"   // ← changed

                value={searchEmpId}
                onChange={(e) => setSearchEmpId(e.target.value)}
                className="w-full px-4 py-2 text-white border border-gray-300 rounded-lg outline-none bg-transparent"
              />
            </div>
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white/5 text-white border border-white/20 outline-none"
              >
                <option value="" className="text-black">
                  All Status
                </option>
                {status.map((dept) => (
                  <option key={dept} value={dept} className="text-black">
                    {captalizeWords(dept)}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white/5 text-white border border-white/20 outline-none"
              />
            </div>
          </div>

          {/* ---- Table ---- */}
          {filteredLeaveList.length > 0 ? (
            <Table columns={columns} data={filteredLeaveList} loading={loading} />
          ) : (
            <div className="text-center py-4 text-gray-400">No requested leaves found.</div>
          )}
        </div>
      )}

      {/* ---- Remark Modal with 100‑character limit ---- */}
      {showRemarkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-white">Reject Leave Request</h2>
            <p className="text-sm text-gray-300 mb-2">
              Please provide a reason for rejecting this leave (max 100 characters):
            </p>
            <div className="relative">
              <textarea
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-red-500 pr-16"
                rows="4"
                value={rejectionReason}
                onChange={handleRejectionChange}
                placeholder="Reason for rejection..."
                maxLength={MAX_CHARS} // native browser enforcement
              />
              <div className={`absolute bottom-2 right-3 text-xs ${isOverLimit ? 'text-red-400' : 'text-gray-400'}`}>
                {charCount} / {MAX_CHARS}
              </div>
            </div>
            {isOverLimit && (
              <p className="text-red-400 text-xs mt-1">Character limit exceeded – extra characters truncated.</p>
            )}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={cancelRejection}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmRejection}
                disabled={isOverLimit}
                className={`px-4 py-2 rounded text-white transition ${isOverLimit
                    ? 'bg-red-800 cursor-not-allowed opacity-50'
                    : 'bg-red-600 hover:bg-red-500'
                  }`}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RequestedLeaveList;