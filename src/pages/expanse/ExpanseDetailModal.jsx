// File: src\pages\expanse\ExpanseDetailModal.jsx

import React from 'react';
import {
    X,
    Eye,
    FileText,
    CheckCircle,
    XCircle,
    User,
    UserCheck,
    MapPin,
    Calendar,
    Briefcase,
    CreditCard,
    Route,
} from 'lucide-react';
import { captalizeWords } from '../../utils/captalizeWords';
import { formatedDate } from '../../utils/formateddateAndTime';

const ExpanseDetailModal = ({
    expense,
    onClose,
    onViewReceipt,
    onDownloadPDF,
    onApprove,
    onReject,
}) => {
    if (!expense) return null;

    // -------- Totals (prefer backend-provided, fallback to computed) --------
    const computedTotal = (() => {
        let sum = 0;
        if (expense.expenses && typeof expense.expenses === 'object') {
            sum += Object.values(expense.expenses).reduce(
                (s, e) => s + (Number(e?.amount) || 0),
                0
            );
        }
        if (Array.isArray(expense.miscItems)) {
            sum += expense.miscItems.reduce(
                (s, m) => s + (Number(m?.amount) || 0),
                0
            );
        }
        return sum;
    })();

    const totalAmount =
        typeof expense.totalAmount === 'number' ? expense.totalAmount : computedTotal;

    const companyPaidAmount =
        typeof expense.companyPaidAmount === 'number'
            ? expense.companyPaidAmount
            : (() => {
                let sum = 0;
                if (expense.expenses && typeof expense.expenses === 'object') {
                    Object.values(expense.expenses).forEach((e) => {
                        if ((e?.paymentMethod || '').toUpperCase() === 'COMPANY') {
                            sum += Number(e?.amount) || 0;
                        }
                    });
                }
                if (Array.isArray(expense.miscItems)) {
                    expense.miscItems.forEach((m) => {
                        if ((m?.paymentMethod || '').toUpperCase() === 'COMPANY') {
                            sum += Number(m?.amount) || 0;
                        }
                    });
                }
                return sum;
            })();

    // ✅ Reimbursable = total − company-paid (what employee should get back)
    const reimbursableAmount =
        typeof expense.selfPaidAmount === 'number'
            ? expense.selfPaidAmount
            : totalAmount - companyPaidAmount;

    // -------- Expense items (expenses object) --------
    const getExpenseItems = () => {
        if (!expense.expenses || typeof expense.expenses !== 'object') return [];
        return Object.entries(expense.expenses).map(([key, value]) => ({
            type: key,
            amount: Number(value?.amount) || 0,
            paymentMethod: value?.paymentMethod || '-',
        }));
    };

    // -------- Misc items (array) --------
    const getMiscItems = () => {
        if (!Array.isArray(expense.miscItems)) return [];
        return expense.miscItems
            .filter((m) => m && typeof m === 'object')
            .map((m) => ({
                type: m.description || 'Miscellaneous',
                amount: Number(m?.amount) || 0,
                paymentMethod: m?.paymentMethod || '-',
            }));
    };

    // -------- Employee helpers --------
    const getEmployeeName = () => {
        if (!expense.employee) return 'Unknown';
        return (
            expense.employee.fullName ||
            expense.employee.name ||
            expense.employee.email?.split('@')[0] ||
            'Unknown'
        );
    };

    const getEmployeeCode = () => {
        if (!expense.employee) return '';
        return (
            expense.employee.employeeCode ||
            expense.employee.empCode ||
            expense.employee.code ||
            ''
        );
    };

    const getEmployeeEmail = () => {
        if (!expense.employee) return '';
        return expense.employee.email || expense.employee.emailId || '';
    };

    const getDepartment = () => {
        if (!expense.employee) return '';
        if (expense.employee.department) {
            if (typeof expense.employee.department === 'object') {
                return (
                    expense.employee.department.name ||
                    expense.employee.department.departmentName ||
                    ''
                );
            }
            if (typeof expense.employee.department === 'string')
                return expense.employee.department;
        }
        return expense.employee.departmentName || expense.employee.dept || '';
    };

    const getApproverName = () => {
        if (expense.approvedBy) {
            if (typeof expense.approvedBy === 'object') {
                return (
                    expense.approvedBy.fullName ||
                    expense.approvedBy.name ||
                    expense.approvedBy.email ||
                    'Not Assigned'
                );
            }
            return expense.approvedBy;
        }
        if (expense.status === 'PENDING') return 'Pending Approval';
        return 'Not Assigned';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED':
                return 'text-green-400 bg-green-500/10 border-green-500/30';
            case 'REJECTED':
                return 'text-red-400 bg-red-500/10 border-red-500/30';
            default:
                return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
        }
    };

    const expenseItems = getExpenseItems();
    const miscItems = getMiscItems();

    const hasReceipt = !!(
        expense.receipt ||
        expense.receiptUrl ||
        expense.imageUrl ||
        expense.url ||
        expense.receiptImage ||
        (Array.isArray(expense.receipts) && expense.receipts.length > 0)
    );

    const employeeName = getEmployeeName();
    const employeeCode = getEmployeeCode();
    const employeeEmail = getEmployeeEmail();
    const department = getDepartment();
    const approverName = getApproverName();
    const isPending = expense.status === 'PENDING';

    // ✅ Handlers that run action and then close the modal
    const handleApproveClick = async () => {
        try {
            await onApprove?.(expense._id);
            onClose?.();
        } catch (err) {
            console.error('Approve failed:', err);
        }
    };

    const handleRejectClick = async () => {
        try {
            await onReject?.(expense._id);
            onClose?.();
        } catch (err) {
            console.error('Reject failed:', err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-stretch z-40 p-0 sm:p-4">
            <div
                className="bg-gradient-to-br from-[#032446] to-[#1e2f4f] rounded-none sm:rounded-xl border-0 sm:border border-white/20 shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden"
                style={{ maxHeight: '100vh' }}
            >
                {/* ---------- Header ---------- */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-white/20 bg-[#032446] flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-[#4EA1FF]/20 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-[#4EA1FF]" />
                        </div>
                        <div>
                            <h2 className="text-white font-semibold text-lg">
                                Expense Details
                            </h2>
                            <p className="text-xs text-white/50">
                                Full breakdown of this request
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-red-400 transition-colors cursor-pointer p-1"
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* ---------- Scrollable Body ---------- */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
                    {/* Employee Summary */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <div className="flex flex-wrap justify-between items-start gap-4">
                            <div>
                                <h3 className="text-white font-semibold text-xl">
                                    {employeeName}
                                </h3>
                                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-400">
                                    {employeeCode && (
                                        <span className="font-mono text-[#4EA1FF]">
                                            {employeeCode}
                                        </span>
                                    )}
                                    {department && <span>• {department}</span>}
                                </div>
                                {employeeEmail && (
                                    <p className="text-sm text-gray-400 mt-1">{employeeEmail}</p>
                                )}
                            </div>
                            <div className="text-right">
                                {/* ✅ Reimbursable amount (self-paid only) */}
                                <div className="text-3xl font-bold text-white">
                                    ₹{reimbursableAmount}
                                </div>
                                <p className="text-xs text-white/50 mt-1">Reimbursable Amount</p>
                                <span
                                    className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                        expense.status
                                    )}`}
                                >
                                    {captalizeWords(expense.status)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Trip Info */}
                    <div>
                        <h4 className="text-sm font-semibold text-white/80 mb-3">
                            Trip Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Row 1: Trip Purpose | Travel Type */}
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                <p className="text-xs text-gray-400 mb-1">Trip Purpose</p>
                                <p className="text-sm text-white">
                                    {captalizeWords(expense.businessPurpose) || '-'}
                                </p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                <p className="text-xs text-gray-400 mb-1">Travel Type</p>
                                <p className="text-sm text-white">
                                    {captalizeWords(expense.travelType) || '-'}
                                </p>
                            </div>

                            {/* Row 2: Trip Distance | Requested At */}
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-start gap-2">
                                <Route className="w-4 h-4 text-[#4EA1FF] mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">Trip Distance</p>
                                    <p className="text-sm text-white">
                                        {expense.distanceKm || expense.tripDistance || '0'} km
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Requested At
                                </p>
                                <p className="text-sm text-white">
                                    {expense.createdAt
                                        ? formatedDate(expense.createdAt.split('T')[0])
                                        : '-'}
                                </p>
                            </div>

                            {/* Row 3: From Location | To Location */}
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> From Location
                                </p>
                                <p className="text-sm text-white">
                                    {expense.fromLocation || '-'}
                                </p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> To Location
                                </p>
                                <p className="text-sm text-white">
                                    {expense.toLocation || '-'}
                                </p>
                            </div>

                            {/* Row 4: From Date | To Date */}
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> From Date
                                </p>
                                <p className="text-sm text-white">
                                    {expense.fromDate ? formatedDate(expense.fromDate) : '-'}
                                </p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> To Date
                                </p>
                                <p className="text-sm text-white">
                                    {expense.toDate ? formatedDate(expense.toDate) : '-'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ---------- Expense Breakdown ---------- */}
                    <div>
                        <h4 className="text-sm font-semibold text-white/80 mb-3">
                            Expense Breakdown
                        </h4>

                        {(expenseItems.length > 0 || miscItems.length > 0) ? (
                            <div className="space-y-2">
                                {/* Regular expense items (travel, hotel, food) */}
                                {expenseItems.map((item, index) => (
                                    <div
                                        key={`exp-${index}`}
                                        className="bg-white/5 border border-white/10 rounded-lg p-4"
                                    >
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-white">
                                                    {captalizeWords(item.type)}
                                                </p>
                                                <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <CreditCard className="w-3 h-3" />
                                                        {captalizeWords(item.paymentMethod)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-white">
                                                    ₹{item.amount}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* ✅ Misc items (from miscItems array) */}
                                {miscItems.map((item, index) => (
                                    <div
                                        key={`misc-${index}`}
                                        className="bg-white/5 border border-white/10 rounded-lg p-4"
                                    >
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-white">
                                                    Other: {captalizeWords(item.type)}
                                                </p>
                                                <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <CreditCard className="w-3 h-3" />
                                                        {captalizeWords(item.paymentMethod)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-white">
                                                    ₹{item.amount}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center text-gray-400 text-sm">
                                No expense breakdown available.
                            </div>
                        )}
                    </div>

                    {/* ---------- Payment Summary (SEPARATE SECTION) ---------- */}
                    {(expenseItems.length > 0 || miscItems.length > 0) && (
                        <div>
                            <h4 className="text-sm font-semibold text-white/80 mb-3">
                                Payment Summary
                            </h4>
                            <div className="space-y-2">
                                {/* Total Amount */}
                                <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                                    <span className="text-sm font-semibold text-white">
                                        Total Amount
                                    </span>
                                    <span className="text-base font-bold text-white">
                                        ₹{totalAmount}
                                    </span>
                                </div>

                                {/* Company Paid */}
                                <div className="flex justify-between items-center bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3">
                                    <span className="text-sm font-semibold text-yellow-200">
                                        Company Paid (−)
                                    </span>
                                    <span className="text-base font-bold text-yellow-200">
                                        ₹{companyPaidAmount}
                                    </span>
                                </div>

                                {/* ✅ Reimbursable Amount */}
                                <div className="flex justify-between items-center bg-[#4EA1FF]/10 border border-[#4EA1FF]/30 rounded-lg px-4 py-3">
                                    <span className="text-sm font-semibold text-[#4EA1FF]">
                                        Reimbursable Amount
                                    </span>
                                    <span className="text-lg font-bold text-[#4EA1FF]">
                                        ₹{reimbursableAmount}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Employee & Approver */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-400">Employee:</span>
                            <span className="text-sm text-white font-medium">
                                {employeeName}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-green-400" />
                            <span className="text-sm text-gray-400">
                                {expense.status === 'PENDING'
                                    ? 'Approval Status:'
                                    : 'Approved By:'}
                            </span>
                            <span className="text-sm text-white font-medium">
                                {approverName}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ---------- Footer ---------- */}
                <div className="flex flex-wrap justify-between items-center gap-3 px-6 py-4 border-t border-white/20 bg-[#032446] flex-shrink-0">
                    <div className="flex items-center gap-3 flex-wrap">
                        {hasReceipt && onViewReceipt && (
                            <button
                                onClick={() => onViewReceipt(expense)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors cursor-pointer text-sm"
                            >
                                <Eye size={16} />
                                View Attachment
                            </button>
                        )}
                        {onDownloadPDF && (
                            <button
                                onClick={() => onDownloadPDF(expense)}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors cursor-pointer text-sm"
                            >
                                <FileText size={16} />
                                Download PDF
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Approve — closes modal after success */}
                        <button
                            onClick={handleApproveClick}
                            disabled={!isPending}
                            className={`flex items-center gap-2 px-8 py-3 rounded-lg text-white font-medium transition-colors text-sm ${isPending
                                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 cursor-pointer'
                                    : 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <CheckCircle size={16} />
                            {isPending ? 'Approve' : 'Approved'}
                        </button>

                        {/* Reject — closes modal after success */}
                        <button
                            onClick={handleRejectClick}
                            disabled={!isPending}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-colors ${isPending
                                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 cursor-pointer'
                                    : 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <XCircle size={16} />
                            Reject
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpanseDetailModal;