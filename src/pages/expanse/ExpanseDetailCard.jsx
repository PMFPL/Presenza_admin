// File: src\components\expanse\ExpanseDetailCard.jsx

import React, { useState } from 'react';
import { CheckCircle, XCircle, Eye, FileText, User, UserCheck } from 'lucide-react';
import { captalizeWords } from '../../utils/captalizeWords';
import { formatedDate } from '../../utils/formateddateAndTime';

const ExpanseDetailCard = ({ list, onViewReceipt, onDownloadPDF, onApprove, onReject }) => {
  const [loading, setLoading] = useState(false);

  // Get logged-in user from localStorage
  const getLoggedInUser = () => {
    try {
      const userData = localStorage.getItem('user') || localStorage.getItem('adminUser');
      if (userData) {
        const user = JSON.parse(userData);
        return user.fullName || user.name || user.email || 'Admin';
      }
      return 'Admin';
    } catch (error) {
      return 'Admin';
    }
  };

  // Calculate total amount from expenses
  const calculateTotal = (expenses) => {
    if (!expenses || typeof expenses !== 'object') return 0;
    return Object.values(expenses).reduce(
      (sum, expense) => sum + (expense?.amount || 0),
      0
    );
  };

  const totalAmount = calculateTotal(list.expenses);
  const hasReceipt = !!(list.receipt || list.receiptUrl || list.imageUrl || list.url || list.receiptImage);

  // Get expense items as array
  const getExpenseItems = () => {
    if (!list.expenses || typeof list.expenses !== 'object') return [];
    return Object.entries(list.expenses).map(([key, value]) => ({
      type: key,
      ...value
    }));
  };

  const expenseItems = getExpenseItems();

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'APPROVED': return 'text-green-400';
      case 'REJECTED': return 'text-red-400';
      default: return 'text-orange-400';
    }
  };

  // Get employee details
  const getEmployeeName = () => {
    if (!list.employee) return 'Unknown';
    return list.employee.fullName || list.employee.name || list.employee.email?.split('@')[0] || 'Unknown';
  };

  // Get approver name from approvedBy object
  const getApproverName = () => {
    if (list.approvedBy) {
      if (typeof list.approvedBy === 'object') {
        return list.approvedBy.fullName || list.approvedBy.name || list.approvedBy.email || 'Not Assigned';
      }
      return list.approvedBy;
    }
    if (list.status === 'PENDING') {
      return 'Pending Approval';
    }
    return 'Not Assigned';
  };

  // Get employee code
  const getEmployeeCode = () => {
    if (!list.employee) return '';
    return list.employee.employeeCode || list.employee.empCode || list.employee.code || '';
  };

  // Get employee email
  const getEmployeeEmail = () => {
    if (!list.employee) return '';
    return list.employee.email || list.employee.emailId || '';
  };

  // Get department
  const getDepartment = () => {
    if (!list.employee) return '';
    
    if (list.employee.department) {
      if (typeof list.employee.department === 'object') {
        return list.employee.department.name || list.employee.department.departmentName || '';
      }
      if (typeof list.employee.department === 'string') {
        return list.employee.department;
      }
    }
    
    if (list.employee.departmentName) return list.employee.departmentName;
    if (list.employee.dept) return list.employee.dept;
    
    return '';
  };

  // Get travel type
  const getTravelType = () => {
    return list.travelType || list.travel_type || '';
  };

  const employeeName = getEmployeeName();
  const employeeCode = getEmployeeCode();
  const employeeEmail = getEmployeeEmail();
  const department = getDepartment();
  const travelType = getTravelType();
  const approverName = getApproverName();
  const loggedInUser = getLoggedInUser();

  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-xl mb-4">
      {/* Header - Employee Name at top */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-white font-semibold text-xl">
            {employeeName}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-400">
              {employeeCode} {department ? `• ${department}` : ''}
            </span>
          </div>
          <div className="text-sm text-gray-400">
            {employeeEmail}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">₹{totalAmount}</div>
          <div className={`text-sm font-medium ${getStatusColor(list.status)}`}>
            {captalizeWords(list.status)}
          </div>
        </div>
      </div>

      {/* Trip Details */}
      <div className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-400">Trip Purpose</p>
            <p className="text-sm text-white">{captalizeWords(list.businessPurpose) || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Trip Distance</p>
            <p className="text-sm text-white">{list.distanceKm || list.tripDistance || '0'} km</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">From / To</p>
            <p className="text-sm text-white">
              {list.fromDate ? formatedDate(list.fromDate) : '-'} / {list.toDate ? formatedDate(list.toDate) : '-'}
            </p>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xs text-gray-400">From Location / To Location</p>
          <p className="text-sm text-white">{list.fromLocation || '-'} → {list.toLocation || '-'}</p>
        </div>
        <div className="mt-2">
          <p className="text-xs text-gray-400">Travel Type</p>
          <p className="text-sm text-white">{captalizeWords(travelType) || '-'}</p>
        </div>
        <div className="mt-2">
          <p className="text-xs text-gray-400">Submitted</p>
          <p className="text-sm text-white">{list.createdAt ? formatedDate(list.createdAt.split('T')[0]) : '-'}</p>
        </div>
      </div>

      {/* Expense Breakdown */}
      {expenseItems.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <h4 className="text-sm font-semibold text-white/80 mb-3">Expense Breakdown</h4>
          <div className="space-y-2">
            {expenseItems.map((item, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{captalizeWords(item.type)}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-400 mt-1">
                      {item.paymentMethod && <span>Payment: {captalizeWords(item.paymentMethod)}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">₹{item.amount || 0}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
        {/* Left side - View and Download buttons */}
        <div className="flex items-center gap-3">
          {hasReceipt && onViewReceipt && (
            <button
              onClick={() => onViewReceipt(list)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors cursor-pointer"
            >
              <Eye size={16} />
              View Receipt
            </button>
          )}

          {onDownloadPDF && (
            <button
              onClick={() => onDownloadPDF(list)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors cursor-pointer disabled:opacity-50"
            >
              <FileText size={16} />
              Download PDF
            </button>
          )}
        </div>

        {/* Right side - Approve/Reject buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onApprove(list._id)}
            disabled={list.status !== 'PENDING'}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-white font-medium transition-colors ${
              list.status === 'PENDING'
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 cursor-pointer'
                : 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle size={16} />
            {list.status === 'PENDING' ? 'Approve & Process Payment' : 'Approved'}
          </button>

          <button
            onClick={() => onReject(list._id)}
            disabled={list.status !== 'PENDING'}
            className={`p-2 rounded-lg transition-colors ${
              list.status === 'PENDING'
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 cursor-pointer'
                : 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
            }`}
          >
            <XCircle size={20} />
          </button>
        </div>
      </div>

      {/* Bottom Section - Employee Name (Left) and Approver Name (Right) */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
        {/* Left: Employee Name */}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-400">Employee:</span>
          <span className="text-sm text-white font-medium">{employeeName}</span>
        </div>

        {/* Right: Approver Name */}
        <div className="flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-green-400" />
          <span className="text-sm text-gray-400">Approved By:</span>
          <span className="text-sm text-white font-medium">{approverName}</span>
        </div>
      </div>
    </div>
  );
};

export default ExpanseDetailCard;