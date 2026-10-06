import React from 'react';

function Table({ columns = [], data = [], loading = false, emptyMessage = "No records found" }) {
  return (
    <div className='w-full overflow-x-auto'>
      <table className="min-w-max w-full whitespace-nowrap table-auto">
        {/* ---------- HEADER ---------- */}
        <thead>
          <tr className="border-b border-white/10 text-[14px] font-medium text-gray-300">
            {columns?.map((col, index) => (
              <th key={index} className="p-2 text-center whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        {/* ---------- BODY ---------- */}
        <tbody className="text-sm font-small text-gray-300 ">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="py-6 text-center">
                Loading...
              </td>
            </tr>
          ) : data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr
                key={row._id || rowIndex}
                className="text-center border-b border-white/10 last:border-none hover:bg-white/5 transition-all duration-300"
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="p-2 text-center whitespace-nowrap">
                    {col.render
                      ? col.render(row, rowIndex)
                      : "-"
                    }
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="py-4 text-center text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
