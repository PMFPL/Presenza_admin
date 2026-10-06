import TrucatedValue from "../../../components/common/TrucatedValue";
import { formatedDate } from "../../../utils/formateddateAndTime";
import { FaRegEdit } from "react-icons/fa";
import { Eye, UserCheck, UserX } from "lucide-react";

const Role = localStorage.getItem('Role');

// Status Badge Component
const StatusBadge = ({ isActive }) => {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
      isActive 
        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
        : 'bg-red-500/20 text-red-400 border-red-500/30'
    }`}>
      {isActive ? (
        <>
          <UserCheck size={12} />
          Active
        </>
      ) : (
        <>
          <UserX size={12} />
          Inactive
        </>
      )}
    </span>
  );
};

export const getEmployeesListColumns = ({ handleSelectedEmp }) => [
  {
    header: "#",
    render: (_, i) => (
      <span className="text-white/40 font-mono text-sm">{String(i + 1).padStart(2, '0')}</span>
    ),
  },
  {
    header: "Employee",
    render: (row) => (
      <div className="flex flex-col">
        <span className="text-white/90 font-medium">{row.employeeCode || '—'}</span>
        <span className="text-white/40 text-xs">{row.fullName || '—'}</span>
      </div>
    ),
  },
  {
    header: "Email",
    render: (row) => (
      <TrucatedValue title={row.email} className="text-white/60 text-sm" />
    ),
  },
  {
    header: "Department",
    render: (row) => (
      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400/80 text-xs font-medium">
        {row.department || '—'}
      </span>
    ),
  },
  {
    header: "Designation",
    render: (row) => (
      <span className="text-white/70 text-sm">{row.designation || '—'}</span>
    ),
  },
  {
    header: "R.M Name",
    render: (row) => (
      <span className="text-white/60 text-sm">{row.reportingTo?.name || '—'}</span>
    ),
  },
  {
    header: "R.M Email",
    render: (row) => (
      <TrucatedValue title={row.reportingTo?.email} className="text-white/40 text-xs" />
    ),
  },
  {
    header: "Joining Date",
    render: (row) => (
      <span className="text-white/60 text-sm font-mono">
        {formatedDate(row.joiningDate) || '—'}
      </span>
    ),
  },
  {
    header: "Status",
    render: (row) => <StatusBadge isActive={row.isActive ?? true} />,
  },
  ...(Role !== 'MANAGER'
    ? [
        {
          header: "Action",
          render: (row) => (
            <button
              className="group flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-200 hover:scale-110"
              onClick={() => {
                handleSelectedEmp(row);
              }}
              title="Edit Employee"
            >
              <FaRegEdit size={16} className="text-white/40 group-hover:text-white/80 transition-colors" />
            </button>
          ),
        },
      ]
    : []),
];