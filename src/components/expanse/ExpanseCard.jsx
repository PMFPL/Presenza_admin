// File: src\pages\expanse\page\Expanse.jsx

import Table from '../common/Table';
import Loading from '../common/Loading';
import GettingError from '../common/GettingError';
import { useRequestedExpanseList } from '../../pages/expanse/hook/useRequestedExpanseList';
import { useMemo } from 'react';
import { Plus, Receipt, Download } from 'lucide-react';
import ExpanseCard from '../expanse/ExpanseCard';
import ReceiptModal from '../../pages/expanse/ReceiptModal';
import { captalizeWords } from '../../utils/captalizeWords';

function RequestedExpanseList() {
  const { 
    requestedExpanseList,
    filteredExpanseList,
    status,
    statusFilter,
    setStatusFilter,
    loading,
    error,
    fetchRequestedExpanseList,
    handleExpanseApproval,
    handleExpanseRejection,
    downloadExpenseReport,  // Keep for bulk download
    viewReceipt,
    showReceiptModal,
    selectedReceipt,
    closeReceiptModal
  } = useRequestedExpanseList();

  const calculatePendingList = useMemo(() => {
    return requestedExpanseList?.filter((list) => list.status === 'PENDING').length || 0;
  }, [requestedExpanseList]);

  return (
    <>
      {loading && <Loading message="Fetching Requested Leave List..." />}
      {error ? <GettingError error={error} /> :
      <>
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-xl mb-4">
          {/* -------------- Header -------------- */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-400/20 rounded-lg">
                <Receipt className="h-8 w-8 text-purple-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Expense Approvals</h2>
                <p className="text-sm text-gray-300">Review and approve employee expense claims</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Bulk Download Button (optional) */}
              <button
                onClick={downloadExpenseReport}
                className="flex items-center gap-2 px-4 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff6b35]/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!requestedExpanseList || requestedExpanseList.length === 0}
              >
                <Download size={18} />
                <span>Download All</span>
              </button>
              
              <button className="flex items-center gap-0 rounded-md px-4 py-2 cursor-pointer bg-gradient-to-r from-[#ff6b35] to-[#ff8555] text-white hover:shadow-lg">
                {calculatePendingList} Pending
              </button>
            </div>
          </div>
        </div>

        <div className='flex justify-end py-4'>
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
        </div>

        {/* ------------- List ------------ */}
        {filteredExpanseList?.length === 0 ? (
          <div className="text-center py-4 text-gray-400">
            No expanse requests found.
          </div>
        ) : (
          filteredExpanseList?.map((list) => {
            return (
              <ExpanseCard 
                key={list._id} 
                list={list} 
                onViewReceipt={viewReceipt}
              />
            );
          })
        )}

        {/* Receipt Modal */}
        {showReceiptModal && (
          <ReceiptModal
            receipt={selectedReceipt}
            onClose={closeReceiptModal}
          />
        )}
      </>
      }
    </>
  );
}

export default RequestedExpanseList;