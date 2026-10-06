// File: src\pages\expanse\data\ExpanseColumn.jsx

import { CheckCircle, XCircle, Eye, FileText } from "lucide-react";
import { captalizeWords } from "../../../utils/captalizeWords";
import { formatedDate } from "../../../utils/formateddateAndTime";

export const getRequestedExpanseColumn = ({
  handleExpanseApproval,
  handleExpanseRejection,
  viewReceipt,
  downloadPDF
}) => [
    {
      header: "S No",
      render: (_, i) => i + 1,
    },
    {
      header: "Email",
      render: (row) => (
        <div className="relative group w-fit flex justify-center">
          <p className="max-w-[100px] truncate cursor-pointer">
            {captalizeWords(row.employee.email)}
          </p>
          <div className="absolute left-0 top-[-15px] z-50 hidden group-hover:block bg-gray-800 text-white text-xs rounded-md px-3 py-2 shadow-lg min-w-[200px] max-w-[300px] break-words">
            <p>{captalizeWords(row.employee.email)}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Grade",
      render: (row) => (
        <div className="relative group w-fit flex justify-center">
          <p className="max-w-[100px] truncate cursor-pointer">
            {row.grade}
          </p>
          <div className="absolute left-0 top-[-15px] z-50 hidden group-hover:block bg-gray-800 text-white text-xs rounded-md px-3 py-2 shadow-lg min-w-[200px] max-w-[300px] break-words">
            <p>{row.grade}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Purpose",
      render: (row) => (
        <div className="relative group w-fit flex justify-center">
          <p className="max-w-[100px] truncate cursor-pointer">
            {captalizeWords(row.businessPurpose)}
          </p>
          <div className="absolute left-0 top-[-15px] z-50 hidden group-hover:block bg-gray-800 text-white text-xs rounded-md px-3 py-2 shadow-lg min-w-[200px] max-w-[300px] break-words">
            <p>{captalizeWords(row.businessPurpose)}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Travel Type",
      render: (row) => captalizeWords(row.travelType),
    },
    {
      header: "From",
      render: (row) => (
        <div className="relative group w-fit flex justify-center">
          <p className="max-w-[100px] truncate cursor-pointer">
            {captalizeWords(row.fromLocation)}
          </p>
          <div className="absolute left-0 top-[-15px] z-50 hidden group-hover:block bg-gray-800 text-white text-xs rounded-md px-3 py-2 shadow-lg min-w-[200px] max-w-[300px] break-words">
            <p>{captalizeWords(row.fromLocation)}</p>
          </div>
        </div>
      )
    },
    {
      header: "To",
      render: (row) => (
        <div className="relative group w-fit flex justify-center">
          <p className="max-w-[100px] truncate cursor-pointer">
            {captalizeWords(row.toLocation)}
          </p>
          <div className="absolute left-0 top-[-15px] z-50 hidden group-hover:block bg-gray-800 text-white text-xs rounded-md px-3 py-2 shadow-lg min-w-[200px] max-w-[300px] break-words">
            <p>{captalizeWords(row.toLocation)}</p>
          </div>
        </div>
      )
    },
    {
      header: "Requested At",
      render: (row) => formatedDate(row.createdAt?.split("T")[0] || ''),
    },
    {
      header: "Amount",
      render: (row) => {
        let totalAmount = 0;
        if (row.expenses && typeof row.expenses === 'object') {
          totalAmount = Object.values(row.expenses).reduce(
            (sum, expense) => sum + (expense?.amount || 0),
            0
          );
        }
        return `₹${totalAmount}`;
      },
    },
    {
      header: "Status",
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          row.status === 'APPROVED'
            ? 'bg-green-400/20 text-green-300'
            : row.status === 'REJECTED'
            ? 'bg-red-400/20 text-red-300'
            : 'bg-orange-400/20 text-orange-300'
        }`}>
          {captalizeWords(row.status)}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (row) => {
        const hasReceipt = !!(row.receipt || row.imageUrl || row.url);
        
        return (
          <div className="flex gap-2 justify-center items-center">
            {/* Download PDF Button */}
            {downloadPDF && (
              <button 
                title="Download PDF"
                onClick={() => downloadPDF(row)}
                className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors cursor-pointer"
              >
                <FileText size={16} />
              </button>
            )}
            
            {/* View Receipt Button */}
            {hasReceipt && viewReceipt && (
              <button 
                title="View Receipt"
                onClick={() => viewReceipt(row)}
                className="p-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors cursor-pointer"
              >
                <Eye size={16} />
              </button>
            )}
            
            {/* Approve Button */}
            <button 
              title="Approve" 
              disabled={row.status !== 'PENDING'}
              onClick={() => handleExpanseApproval(row._id)}
              className={row.status !== 'PENDING' ? 'cursor-not-allowed' : 'cursor-pointer'}
            >
              <CheckCircle className={`text-green-500 transition-transform duration-300 hover:scale-110
                ${row.status !== 'PENDING' ? 'opacity-20' : ''}`} 
              />
            </button>
            
            {/* Reject Button */}
            <button 
              title="Reject"
              disabled={row.status !== 'PENDING'}
              onClick={() => handleExpanseRejection(row._id)}
              className={row.status !== 'PENDING' ? 'cursor-not-allowed' : 'cursor-pointer'}
            >
              <XCircle className={`text-red-500 transition-transform duration-300 hover:scale-110
                ${row.status !== 'PENDING' ? 'opacity-20' : ''}`} 
              />
            </button>
          </div>
        );
      },
    },
  ];