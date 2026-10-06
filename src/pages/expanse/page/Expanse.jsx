// File: src\pages\expanse\page\Expanse.jsx

import { useMemo, useState } from 'react';
import { Search, ChevronDown, Receipt, Eye, CheckCircle, XCircle, FileText } from 'lucide-react';
import Loading from '../../../components/common/Loading';
import GettingError from '../../../components/common/GettingError';
import { useRequestedExpanseList } from '../hook/useRequestedExpanseList';
import { captalizeWords } from '../../../utils/captalizeWords';
import ReceiptModal from '../ReceiptModal';
import { generateExpensePDF } from '../ExpensePDF';
import ExpanseDetailModal from '../ExpanseDetailModal';
import { formatedDate } from '../../../utils/formateddateAndTime';

function RequestedExpanseList() {
  const {
    requestedExpanseList,
    filteredExpanseList,
    status,
    statusFilter,
    setStatusFilter,
    loading,
    error,
    handleExpanseApproval,
    handleExpanseRejection,
    viewReceipt,
    showReceiptModal,
    selectedReceipt,
    closeReceiptModal,
  } = useRequestedExpanseList();

  // ---- Local state ----
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // ---- Client-side search on top of the hook's filtered list ----
  const finalList = useMemo(() => {
    const list = filteredExpanseList || [];
    const search = searchTerm.toLowerCase().trim();
    if (!search) return list;

    return list.filter((item) => {
      const code = (
        item?.employeeCode ||
        item?.employeeId?.employeeCode ||
        item?.employee?.employeeCode ||
        ''
      ).toLowerCase();

      const name = (
        item?.employeeName ||
        item?.employeeId?.fullName ||
        item?.employee?.fullName ||
        ''
      ).toLowerCase();

      const email = (item?.employee?.email || '').toLowerCase();

      return code.includes(search) || name.includes(search) || email.includes(search);
    });
  }, [filteredExpanseList, searchTerm]);

  // ---- Calculate total amount from expenses ----
  const calculateTotal = (expenses) => {
    if (!expenses || typeof expenses !== 'object') return 0;
    return Object.values(expenses).reduce(
      (sum, expense) => sum + (Number(expense?.amount) || 0),
      0
    );
  };

  // ---- Download individual PDF ----
  const downloadPDF = async (row) => {
    try {
      await generateExpensePDF(row);
    } catch (error) {
      console.error('PDF download error:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // ---- Open detail modal on eye click ----
  const handleViewDetails = (row) => {
    setSelectedExpense(row);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedExpense(null);
  };

  // ---- Helpers for row display ----
  const getEmployeeName = (row) => {
    if (!row.employee) return 'Unknown';
    return (
      row.employee.fullName ||
      row.employee.name ||
      row.employee.email?.split('@')[0] ||
      'Unknown'
    );
  };

  const getEmployeeCode = (row) => {
    if (!row.employee) return '';
    return row.employee.employeeCode || row.employee.empCode || row.employee.code || '';
  };

  const getDepartment = (row) => {
    if (!row.employee) return '-';
    if (row.employee.department) {
      if (typeof row.employee.department === 'object') {
        return row.employee.department.name || row.employee.department.departmentName || '-';
      }
      if (typeof row.employee.department === 'string') return row.employee.department;
    }
    return row.employee.departmentName || row.employee.dept || '-';
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
          <CheckCircle size={12} />
          {captalizeWords(status)}
        </span>
      );
    }
    if (s === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
          <XCircle size={12} />
          {captalizeWords(status)}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
        {captalizeWords(status)}
      </span>
    );
  };

  return (
    <>
      {loading && <Loading message="Fetching Expense Requests..." />}
      {error ? (
        <GettingError error={error} />
      ) : (
        <div className="w-full">
          {/* ---------------- Filters Bar ---------------- */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            {/* Search bar */}
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by Emp ID or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 text-white placeholder-white/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#4EA1FF]/50 focus:bg-white/10 transition-colors duration-200 text-sm"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Status filter */}
              <div className="relative min-w-[160px]">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full appearance-none bg-white/5 text-white border border-white/10 rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:border-[#4EA1FF]/50 focus:bg-white/10 transition-colors duration-200 text-sm cursor-pointer"
                >
                  <option value="" className="text-black">All Status</option>
                  {status.map((st) => (
                    <option key={st} value={st} className="text-black">
                      {captalizeWords(st)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 pointer-events-none" />
              </div>

              {/* Records count */}
              <div className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl">
                <span className="text-white/60 text-sm font-medium">
                  {finalList.length} {finalList.length === 1 ? 'record' : 'records'}
                </span>
              </div>
            </div>
          </div>

          {/* ---------------- Table Container ---------------- */}
          {/* ✅ Background now matches Attendance.jsx */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="text-left px-4 py-4 text-xs font-semibold text-white/60 uppercase tracking-wider">S No</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Employee</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Department</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Purpose</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Travel Type</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-white/60 uppercase tracking-wider">From → To</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Requested At</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Amount</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Status</th>
                    <th className="text-center px-4 py-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {finalList.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-16 text-gray-400">
                        <Receipt className="h-12 w-12 mx-auto mb-3 text-gray-500" />
                        <p className="text-lg">No expense requests found.</p>
                        <p className="text-sm text-gray-500 mt-1">
                          There are no expense requests to display.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    finalList.map((row, index) => {
                      const totalAmount = calculateTotal(row.expenses);
                      const hasReceipt = !!(
                        row.receipt ||
                        row.receiptUrl ||
                        row.imageUrl ||
                        row.url ||
                        row.receiptImage ||
                        (Array.isArray(row.receipts) && row.receipts.length > 0)
                      );
                      const isPending = row.status === 'PENDING';
                      const employeeName = getEmployeeName(row);
                      const employeeCode = getEmployeeCode(row);
                      const department = getDepartment(row);

                      return (
                        <tr
                          key={row._id}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors duration-150"
                        >
                          {/* S No */}
                          <td className="px-4 py-4 text-sm text-white/70">
                            {String(index + 1).padStart(2, '0')}
                          </td>

                          {/* Employee */}
                          <td className="px-4 py-4">
                            <div className="flex flex-col">
                              <span className="text-xs font-mono text-[#4EA1FF]">
                                {employeeCode || '-'}
                              </span>
                              <span className="text-sm text-white font-medium">
                                {employeeName}
                              </span>
                            </div>
                          </td>

                          {/* Department */}
                          <td className="px-4 py-4 text-sm text-white/80">
                            {department}
                          </td>

                          {/* Purpose */}
                          <td className="px-4 py-4 text-sm text-white/80 max-w-[180px]">
                            <span className="truncate block" title={row.businessPurpose || '-'}>
                              {row.businessPurpose || '-'}
                            </span>
                          </td>

                          {/* Travel Type */}
                          <td className="px-4 py-4 text-sm text-white/80">
                            {row.travelType ? captalizeWords(row.travelType) : '-'}
                          </td>

                          {/* From → To */}
                          <td className="px-4 py-4 text-sm text-white/80 max-w-[200px]">
                            <div className="flex flex-col">
                              <span className="truncate" title={row.fromLocation}>
                                {row.fromLocation || '-'}
                              </span>
                              <span className="truncate text-white/50" title={row.toLocation}>
                                → {row.toLocation || '-'}
                              </span>
                            </div>
                          </td>

                          {/* Requested At */}
                          <td className="px-4 py-4 text-sm text-white/70">
                            {row.createdAt
                              ? formatedDate(row.createdAt.split('T')[0])
                              : '-'}
                          </td>

                          {/* Amount */}
                          <td className="px-4 py-4 text-sm font-semibold text-white">
                            ₹{totalAmount}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-4">
                            {getStatusBadge(row.status)}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-2">
                              {/* Approve */}
                              <button
                                title={isPending ? 'Approve' : 'Already processed'}
                                disabled={!isPending}
                                onClick={() => handleExpanseApproval(row._id)}
                                className={`p-1.5 rounded-lg transition-all ${
                                  isPending
                                    ? 'text-green-400 hover:bg-green-500/20 hover:scale-110 cursor-pointer'
                                    : 'text-green-400/20 cursor-not-allowed'
                                }`}
                              >
                                <CheckCircle size={18} />
                              </button>

                              {/* Reject */}
                              <button
                                title={isPending ? 'Reject' : 'Already processed'}
                                disabled={!isPending}
                                onClick={() => handleExpanseRejection(row._id)}
                                className={`p-1.5 rounded-lg transition-all ${
                                  isPending
                                    ? 'text-red-400 hover:bg-red-500/20 hover:scale-110 cursor-pointer'
                                    : 'text-red-400/20 cursor-not-allowed'
                                }`}
                              >
                                <XCircle size={18} />
                              </button>

                              {/* Download PDF */}
                              <button
                                title="Download PDF"
                                onClick={() => downloadPDF(row)}
                                className="p-1.5 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-all hover:scale-110 cursor-pointer"
                              >
                                <FileText size={18} />
                              </button>

                              {/* View Details (Eye) */}
                              <button
                                title="View Details"
                                onClick={() => handleViewDetails(row)}
                                className="p-1.5 text-[#4EA1FF] hover:bg-[#4EA1FF]/20 rounded-lg transition-all hover:scale-110 cursor-pointer"
                              >
                                <Eye size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer - showing entries */}
            {finalList.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                <span className="text-sm text-white/50">
                  Showing 1–{finalList.length} of {finalList.length} entries
                </span>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 text-sm text-white/40 bg-white/5 border border-white/10 rounded-lg cursor-not-allowed">
                    ‹
                  </button>
                  <button className="px-3 py-1.5 text-sm text-white bg-[#4EA1FF]/20 border border-[#4EA1FF]/30 rounded-lg">
                    1
                  </button>
                  <button className="px-3 py-1.5 text-sm text-white/40 bg-white/5 border border-white/10 rounded-lg cursor-not-allowed">
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------- Receipt Modal -------------- */}
      {showReceiptModal && (
        <ReceiptModal receipt={selectedReceipt} onClose={closeReceiptModal} />
      )}

      {/* -------------- Expense Detail Modal (Eye click) -------------- */}
      {showDetailModal && selectedExpense && (
        <ExpanseDetailModal
          expense={selectedExpense}
          onClose={closeDetailModal}
          onViewReceipt={viewReceipt}
          onDownloadPDF={downloadPDF}
          onApprove={handleExpanseApproval}
          onReject={handleExpanseRejection}
        />
      )}
    </>
  );
}

export default RequestedExpanseList;