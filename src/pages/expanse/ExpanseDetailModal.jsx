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
import html2pdf from 'html2pdf.js'; 

const ExpanseDetailModal = ({
    expense,
    onClose,
    onViewReceipt,
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

    // ✅ Compute SELF-paid sum directly from items
    const computedSelfPaid = (() => {
        let sum = 0;
        if (expense.expenses && typeof expense.expenses === 'object') {
            Object.values(expense.expenses).forEach((e) => {
                if ((e?.paymentMethod || '').toUpperCase() === 'SELF') {
                    sum += Number(e?.amount) || 0;
                }
            });
        }
        if (Array.isArray(expense.miscItems)) {
            expense.miscItems.forEach((m) => {
                if ((m?.paymentMethod || '').toUpperCase() === 'SELF') {
                    sum += Number(m?.amount) || 0;
                }
            });
        }
        return sum;
    })();

    // ✅ Compute COMPANY-paid sum directly from items
    const computedCompanyPaid = (() => {
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

    const totalAmount =
        typeof expense.totalAmount === 'number' && expense.totalAmount > 0
            ? expense.totalAmount
            : computedTotal;

    const companyPaidAmount =
        typeof expense.companyPaidAmount === 'number' && expense.companyPaidAmount > 0
            ? expense.companyPaidAmount
            : computedCompanyPaid;

    const reimbursableAmount =
        typeof expense.selfPaidAmount === 'number' && expense.selfPaidAmount > 0
            ? expense.selfPaidAmount
            : computedSelfPaid > 0
                ? computedSelfPaid
                : totalAmount - companyPaidAmount;

    // -------- Expense items --------
    const getExpenseItems = () => {
        if (!expense.expenses || typeof expense.expenses !== 'object') return [];
        return Object.entries(expense.expenses).map(([key, value]) => ({
            type: key,
            amount: Number(value?.amount) || 0,
            paymentMethod: value?.paymentMethod || '-',
        }));
    };

    // -------- Misc items --------
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

    // ✅ Pull a display name out of any actor value
    const extractActorName = (actor) => {
        if (!actor) return null;
        if (typeof actor === 'string') {
            if (/^[a-f0-9]{24}$/i.test(actor)) return null;
            return actor.trim() || null;
        }
        if (typeof actor === 'object') {
            return (
                actor.fullName ||
                actor.name ||
                actor.email ||
                actor.user?.fullName ||
                actor.user?.name ||
                actor.user?.email ||
                actor.employee?.fullName ||
                actor.employee?.name ||
                actor.employee?.email ||
                null
            );
        }
        return null;
    };

    // ✅ Status-aware approver resolution
    const getApproverName = () => {
        const status = (expense.status || '').toUpperCase();

        if (status === 'REJECTED') {
            return (
                extractActorName(expense.rejectedBy) ||
                extractActorName(expense.rejectedByUser) ||
                extractActorName(expense.approvedBy) ||
                'Not Assigned'
            );
        }

        if (status !== 'PENDING') {
            return (
                extractActorName(expense.approvedBy) ||
                extractActorName(expense.approvedByUser) ||
                'Not Assigned'
            );
        }

        return 'Pending Approval';
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

    // ✅ Handlers
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

    // ✅ Handle PDF Download (Full inline HTML version)
    const handleDownloadPDF = () => {
        let travelAmount = 0, roomAmount = 0, foodAmount = 0, otherAmount = 0;

        expenseItems.forEach(item => {
            const type = item.type.toLowerCase();
            if (type.includes('travel')) travelAmount += item.amount;
            else if (type.includes('hotel') || type.includes('room')) roomAmount += item.amount;
            else if (type.includes('food')) foodAmount += item.amount;
            else otherAmount += item.amount;
        });

        miscItems.forEach(item => {
            otherAmount += item.amount;
        });

        const claimMonth = expense.createdAt
            ? new Date(expense.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' })
            : '-';

        // 1. Create the HTML string that mimics the screenshot
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; font-size: 11px; max-width: 800px; margin: 0 auto; border: 1px solid #000; background: #fff; color: #000;">
                <!-- Top Yellow Header -->
                <div style="background-color: #FFD700; padding: 4px 8px; font-weight: bold; border-bottom: 1px solid #000; font-size: 12px; text-align: center;">
                    Paul Merchants
                </div>

                <!-- Main Title -->
                <div style="text-align: center; border-bottom: 1px solid #000; padding: 8px 0;">
                    <div style="font-size: 16px; font-weight: bold; margin-bottom: 4px;">PAUL MERCHANTS FINANCE PRIVATE LIMITED</div>
                    <div style="font-size: 12px; font-weight: bold;">Travelling Expenses Claim Bill</div>
                </div>

                <!-- Employee Info Table -->
                <table style="width: 100%; border-collapse: collapse; border-bottom: 1px solid #000;">
                    <tr>
                        <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; width: 33%;">Employee Name: ${employeeName}</td>
                        <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; width: 33%;">Reporting To: ${approverName}</td>
                        <td style="border-bottom: 1px solid #000; padding: 4px; width: 33%;">Vehicle Type: ${captalizeWords(expense.travelType) || '-'}</td>
                    </tr>
                    <tr>
                        <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px;">Department: ${expense.employee?.departmentName || expense.employee?.department?.name || expense.employee?.department?.departmentName || '-'}</td>
                        <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px;">Claim month: ${claimMonth}</td>
                        <td style="border-bottom: 1px solid #000; padding: 4px;">Fuel Type: -</td>
                    </tr>
                    <tr>
                        <td style="border-right: 1px solid #000; padding: 4px;">Employee Code: ${employeeCode}</td>
                        <td style="border-right: 1px solid #000; padding: 4px;">Employee Grade: ${expense.grade || '-'}</td>
                        <td style="padding: 4px;">State/Zone: -</td>
                    </tr>
                </table>

                <!-- Travelling Expense Details Header -->
                <div style="padding: 4px; font-weight: bold; border-bottom: 1px solid #000;">Travelling Expense Details:</div>

                <!-- Expense Table -->
                <table style="width: 100%; border-collapse: collapse; border-bottom: 1px solid #000;">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; font-size: 10px;">Date</th>
                            <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; font-size: 10px;">From</th>
                            <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; font-size: 10px;">To</th>
                            <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; font-size: 10px;">Purpose</th>
                            <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; font-size: 10px;">Travel</th>
                            <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; font-size: 10px;">Room</th>
                            <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; font-size: 10px;">Food</th>
                            <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; font-size: 10px;">Other</th>
                            <th style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; font-size: 10px;">Total</th>
                            <th style="border-bottom: 1px solid #000; padding: 4px; font-size: 10px;">Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; text-align: center;">${expense.fromDate ? formatedDate(expense.fromDate) : '-'}</td>
                            <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px;">${expense.fromLocation || '-'}</td>
                            <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px;">${expense.toLocation || '-'}</td>
                            <!-- ✅ FIXED: Purpose now falls back to expense.purpose if businessPurpose is missing -->
                            <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px;">${expense.businessPurpose || expense.purpose || '-'}</td>
                            <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; text-align: right;">${travelAmount || ''}</td>
                            <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; text-align: right;">${roomAmount || ''}</td>
                            <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; text-align: right;">${foodAmount || ''}</td>
                            <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; text-align: right;">${otherAmount || ''}</td>
                            <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; text-align: right;">${totalAmount}</td>
                            <!-- ✅ FIXED: Remarks now shown in table -->
                            <td style="border-bottom: 1px solid #000; padding: 4px;">${expense.remarks || '-'}</td>
                        </tr>
                        <tr>
                            <td colspan="8" style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; text-align: right; font-weight: bold;">Total</td>
                            <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px; text-align: right; font-weight: bold;">${totalAmount}</td>
                            <td style="border-bottom: 1px solid #000; padding: 4px;"></td>
                        </tr>
                    </tbody>
                </table>

                <!-- ✅ ADDED: Dedicated Remarks Section below the table for better visibility -->
                <div style="padding: 4px; font-weight: bold; border-bottom: 1px solid #000; background-color: #f2f2f2;">Remarks:</div>
                <div style="padding: 4px; border-bottom: 1px solid #000; min-height: 20px;">
                    ${expense.remarks || 'No remarks provided.'}
                </div>

                <!-- Summary Section -->
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="border-bottom: 1px solid #000; border-right: 1px solid #000; padding: 4px; width: 50%;">Grand Total:</td>
                        <td style="border-bottom: 1px solid #000; padding: 4px; width: 50%; text-align: right;">₹${totalAmount}</td>
                    </tr>
                    <tr>
                        <td style="border-bottom: 1px solid #000; border-right: 1px solid #000; padding: 4px;">Local Conveyance Expenses :</td>
                        <td style="border-bottom: 1px solid #000; padding: 4px; text-align: right;">-</td>
                    </tr>
                    <tr>
                        <td style="border-bottom: 1px solid #000; border-right: 1px solid #000; padding: 4px;">Total Expenses Incurred:</td>
                        <td style="border-bottom: 1px solid #000; padding: 4px; text-align: right;">₹${totalAmount}</td>
                    </tr>
                    <tr>
                        <td style="border-bottom: 1px solid #000; border-right: 1px solid #000; padding: 4px;">Spent by Company:</td>
                        <td style="border-bottom: 1px solid #000; padding: 4px; text-align: right;">₹${companyPaidAmount}</td>
                    </tr>
                    <tr>
                        <td style="border-bottom: 1px solid #000; border-right: 1px solid #000; padding: 4px;">Balance to Receive:</td>
                        <td style="border-bottom: 1px solid #000; padding: 4px; text-align: right;">₹${reimbursableAmount}</td>
                    </tr>
                    <tr>
                        <td style="border-bottom: 1px solid #000; border-right: 1px solid #000; padding: 4px;">Amount Approved:</td>
                        <td style="border-bottom: 1px solid #000; padding: 4px; text-align: right;">₹${expense.status === 'APPROVED' ? totalAmount : 0}</td>
                    </tr>
                    <tr>
                        <td style="border-bottom: 1px solid #000; border-right: 1px solid #000; padding: 4px;">Approval Status:</td>
                        <td style="border-bottom: 1px solid #000; padding: 4px;">${captalizeWords(expense.status)}</td>
                    </tr>
                    <tr>
                        <td style="border-right: 1px solid #000; padding: 4px; height: 60px; vertical-align: top; font-weight: bold; width: 50%;">Employee Signature</td>
                        <td style="padding: 4px; text-align: right; vertical-align: bottom;">Authorized Signature</td>
                    </tr>
                </table>
            </div>
        `;

        const opt = {
            margin: 0.5,
            filename: `Expense_Claim_${employeeName.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        const element = document.createElement('div');
        element.innerHTML = htmlContent;
        html2pdf().set(opt).from(element).save();
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
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                <p className="text-xs text-gray-400 mb-1">Trip Purpose</p>
                                <p className="text-sm text-white">
                                    {captalizeWords(expense.purpose || expense.businessPurpose) || '-'}
                                </p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                <p className="text-xs text-gray-400 mb-1">Travel Type</p>
                                <p className="text-sm text-white">
                                    {captalizeWords(expense.travelType) || '-'}
                                </p>
                            </div>

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

                    {/* ✅ Remarks Section on UI */}
                    <div>
                        <h4 className="text-sm font-semibold text-white/80 mb-3">
                            Remarks
                        </h4>
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <p className="text-sm text-white">
                                {expense.remarks || 'No remarks provided.'}
                            </p>
                        </div>
                    </div>

                    {/* ---------- Expense Breakdown ---------- */}
                    <div>
                        <h4 className="text-sm font-semibold text-white/80 mb-3">
                            Expense Breakdown
                        </h4>

                        {(expenseItems.length > 0 || miscItems.length > 0) ? (
                            <div className="space-y-2">
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

                    {/* ---------- Payment Summary ---------- */}
                    {(expenseItems.length > 0 || miscItems.length > 0) && (
                        <div>
                            <h4 className="text-sm font-semibold text-white/80 mb-3">
                                Payment Summary
                            </h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                                    <span className="text-sm font-semibold text-white">
                                        Total Amount
                                    </span>
                                    <span className="text-base font-bold text-white">
                                        ₹{totalAmount}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3">
                                    <span className="text-sm font-semibold text-yellow-200">
                                        Company Paid (−)
                                    </span>
                                    <span className="text-base font-bold text-yellow-200">
                                        ₹{companyPaidAmount}
                                    </span>
                                </div>

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
                                    : expense.status === 'REJECTED'
                                        ? 'Rejected By:'
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

                        <button
                            onClick={handleDownloadPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors cursor-pointer text-sm"
                        >
                            <FileText size={16} />
                            Download PDF
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
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