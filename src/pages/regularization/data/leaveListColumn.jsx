import { CheckCircle, XCircle } from "lucide-react";
import { captalizeWords } from "../../../utils/captalizeWords";
import { formatedDate } from "../../../utils/formateddateAndTime";
import TrucatedValue from "../../../components/common/TrucatedValue";

export const getRequestedLeaveColumn = ({
  handleLeaveApproval,
  handleLeaveRejection, // now expects (row) => opens modal
}) => [
  {
    header: "S No",
    render: (_, i) => i + 1,
  },
  {
    header: "Emp Id",
    render: (row) => row.employeeCode,
  },
  {
    header: "Name",
    render: (row) => <TrucatedValue title={row.employeeName} />,
  },
  {
    header: "Leave Type",
    render: (row) => captalizeWords(row.leaveType),
  },
  {
    header: "Reason",
    render: (row) => <TrucatedValue title={row.reason} />,
  },
  {
    header: "From (DD/MM/YYYY)",
    render: (row) => formatedDate(row.startDate?.split("T")[0] || ''),
  },
  {
    header: "To (DD/MM/YYYY)",
    render: (row) => formatedDate(row.endDate?.split("T")[0] || ''),
  },
  {
    header: "Status",
    render: (row) => (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          row.status === 'APPROVED'
            ? 'bg-green-400/20 text-green-300'
            : row.status === 'REJECTED'
            ? 'bg-red-400/20 text-red-300'
            : 'bg-orange-400/20 text-orange-300'
        }`}
      >
        {captalizeWords(row.status)}
      </span>
    ),
  },
  // NEW: Remark column – shows rejectionReason if available
  {
    header: "Remark",
    render: (row) =>
      row.status === 'REJECTED' && row.rejectionReason ? (
        <span className="text-sm text-gray-300" title={row.rejectionReason}>
          {row.rejectionReason.length > 25
            ? row.rejectionReason.slice(0, 25) + '…'
            : row.rejectionReason}
        </span>
      ) : (
        <span className="text-gray-500">—</span>
      ),
  },
  {
    header: "Action",
    render: (row) => (
      <div className="flex gap-4 justify-center">
        <button
          title="Approve"
          disabled={row.status !== 'PENDING'}
          onClick={() => handleLeaveApproval(row._id, row.status)}
          className={row.status !== 'PENDING' ? 'cursor-not-allowed' : 'cursor-pointer'}
        >
          <CheckCircle
            className={`text-green-500 transition-transform duration-300 hover:scale-115 ${
              row.status !== 'PENDING' ? 'opacity-20' : ''
            }`}
          />
        </button>
        <button
          title="Reject"
          disabled={row.status !== 'PENDING'}
          onClick={() => handleLeaveRejection(row)} // pass the whole row
          className={row.status !== 'PENDING' ? 'cursor-not-allowed' : 'cursor-pointer'}
        >
          <XCircle
            className={`border-red-500 text-red-500 transition-transform duration-300 hover:scale-115 ${
              row.status !== 'PENDING' ? 'opacity-20' : ''
            }`}
          />
        </button>
      </div>
    ),
  },
];