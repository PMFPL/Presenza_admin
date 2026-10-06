import { Plus, Users, UserCheck, UserX, Search } from 'lucide-react';
import Loading from '../../../components/common/Loading';
import Table from '../../../components/common/Table';
import { useEmployeeList } from '../hook/useEmployeeList';
import CreateNewEmployee from './CreateNewEmployee';
import GettingError from '../../../components/common/GettingError';

function EmployeeList() {
  const { 
    searchEmpId, setSearchEmpId, 
    departmentFilter, setDepartmentFilter,
    statusFilter, setStatusFilter,
    statusOptions,
    loading, error, 
    departments, filteredEmpList, 
    handleAddEmployee, closeEmployeeModal,
    isEmployeeModalOpen, columns, selectedEmp 
  } = useEmployeeList();

  const Role = localStorage.getItem('Role');
  const isManager = Role === 'MANAGER';

  // Summary stats
  const total = filteredEmpList.length;
  const active = filteredEmpList.filter(e => e.isActive !== false).length;
  const inactive = total - active;

  return (
    <>
      {/* Loading state */}
      {loading && <Loading message="Fetching Employee List..." />}
      
      {/* Error state */}
      {error ? (
        <GettingError error={error} />
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Users size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Total Employees</p>
                <p className="text-white/90 text-2xl font-semibold">{total}</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/20">
                <UserCheck size={20} className="text-green-400" />
              </div>
              <div>
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Active</p>
                <p className="text-white/90 text-2xl font-semibold">{active}</p>
                <p className="text-white/30 text-xs">{total > 0 ? Math.round((active/total)*100) : 0}%</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-red-500/20">
                <UserX size={20} className="text-red-400" />
              </div>
              <div>
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Inactive</p>
                <p className="text-white/90 text-2xl font-semibold">{inactive}</p>
                <p className="text-white/30 text-xs">{total > 0 ? Math.round((inactive/total)*100) : 0}%</p>
              </div>
            </div>
          </div>

          {/* Main Table */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl overflow-hidden">
            {/* Filters */}
            <div className="p-6 border-b border-white/10">
              <div className="flex flex-wrap justify-between items-center gap-4">
                {/* Search */}
                <div className="flex-1 min-w-[200px] max-w-md">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      placeholder="Search by Emp ID or Name..."
                      value={searchEmpId}
                      onChange={(e) => setSearchEmpId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-white placeholder-white/30 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 text-white border border-white/10 outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-200 min-w-[150px]"
                  >
                    <option value="" className="text-black">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept} className="text-black">
                        {dept}
                      </option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 text-white border border-white/10 outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-200 min-w-[130px]"
                  >
                    <option value="" className="text-black">All Status</option>
                    {statusOptions.map((st) => (
                      <option key={st} value={st} className="text-black">
                        {st}
                      </option>
                    ))}
                  </select>

                  <span className="text-white/40 text-sm font-mono bg-white/5 px-3 py-2 rounded-xl">
                    {filteredEmpList.length} records
                  </span>

                  {!isManager && (
                    <button
                      onClick={handleAddEmployee}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#ff6b35] to-[#e55a2a] hover:from-[#e55a2a] hover:to-[#cc4a1a] text-white rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40"
                    >
                      <Plus size={18} />
                      <span>Add New</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Table */}
            <div className="p-0">
              <Table
                columns={columns}
                data={filteredEmpList}
                loading={loading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Employee Modal */}
      {isEmployeeModalOpen && (
        <CreateNewEmployee 
          selectedEmp={selectedEmp} 
          close={closeEmployeeModal} 
        />
      )}
    </>
  );
}

export default EmployeeList;