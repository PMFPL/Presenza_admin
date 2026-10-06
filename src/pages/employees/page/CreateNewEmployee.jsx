import { Loader, X, Plus, User, Mail, Calendar, Building, Briefcase, Monitor, Info } from 'lucide-react';
import { useCreateEmployee } from '../hook/useCreateEmployee';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

function CreateNewEmployee({ close, selectedEmp }) {
  const {
    departmentList, department, setDepartment,
    designationList, empDesignation, setEmpDesignation,
    officeList, office, setOffice,
    shiftList, selectedShift, setSelectedShift,
    weekOffList, selectedWeekOff, setSelectedWeekOff,
    rmList, rm, setRm,
    empId, setEmpId,
    empName, setEmpName,
    empEmail, setEmpEmail,
    joiningDate, setJoiningDate,
    isSystemProvided, setIsSystemProvided,
    systemType, setSystemType,
    operatingSystem, setOperatingSystem,
    deviceName, setDeviceName,
    serialNumber, setSerialNumber,
    brandName, setBrandName,
    isActive, setIsActive,
    showAddDeptModal, setShowAddDeptModal,
    newDeptName, setNewDeptName,
    newDeptCode, setNewDeptCode,
    createDepartment,
    showAddDesignationModal, setShowAddDesignationModal,
    newDesignationTitle, setNewDesignationTitle,
    createDesignation,
    handleCreateNewEmployee,
    loading,
  } = useCreateEmployee(close, selectedEmp);

  const statusValue = isActive ? 'Active' : 'Inactive';
  const handleStatusChange = (value) => {
    setIsActive(value === 'Active');
  };

  // Create department options with "Add New" option
  const getDepartmentOptions = () => {
    const options = [];
    if (departmentList && departmentList.length > 0) {
      departmentList.forEach(dept => {
        options.push({ ...dept, isAddNew: false });
      });
    }
    options.push({ 
      _id: 'add-new-dept', 
      name: '+ Add New Department', 
      isAddNew: true 
    });
    return options;
  };

  // Create designation options with "Add New" option
  const getDesignationOptions = () => {
    const options = [];
    if (designationList && designationList.length > 0) {
      designationList.forEach(desig => {
        options.push({ ...desig, isAddNew: false });
      });
    }
    options.push({ 
      _id: 'add-new-designation', 
      title: '+ Add New Designation',
      name: '+ Add New Designation',
      isAddNew: true 
    });
    return options;
  };

  const handleDepartmentChange = (value) => {
    if (value === 'add-new-dept') {
      setShowAddDeptModal(true);
      return;
    }
    setDepartment(value);
    // Reset designation when department changes
    setEmpDesignation('');
  };

  const handleDesignationChange = (value) => {
    if (value === 'add-new-designation') {
      if (!department) {
        alert('Please select a department first before adding a designation.');
        return;
      }
      setShowAddDesignationModal(true);
      return;
    }
    setEmpDesignation(value);
  };

  const handleCreateDepartment = async () => {
    await createDepartment();
  };

  const handleCreateDesignation = async () => {
    if (!department) {
      alert('Please select a department first.');
      return;
    }
    await createDesignation(department);
  };

  // Check if editing
  const isEditing = !!selectedEmp;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-start z-50 pt-8 pb-8 overflow-y-auto">
      <div className="bg-gradient-to-br from-[#032446] to-[#1a2d4a] rounded-2xl max-w-5xl w-full mx-4 border border-white/10 shadow-2xl max-h-[95vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10 sticky top-0 bg-[#032446]/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-xl">
              <User size={20} className="text-white/60" />
            </div>
            <div>
              <h4 className="text-white/90 font-semibold text-lg">
                {isEditing ? 'Edit Employee' : 'Create New Employee'}
              </h4>
              {isEditing && (
                <p className="text-white/40 text-sm">
                  Editing: {selectedEmp?.fullName} ({selectedEmp?.employeeCode})
                </p>
              )}
            </div>
          </div>
          <button
            onClick={close}
            className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 text-white/50 hover:text-white/80"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-6 py-6">
          
          {/* Section: Office & Policies */}
          <div className="mb-6">
            <h5 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-4 flex items-center gap-2">
              <Building size={14} />
              Office & Policies
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                value={office}
                onChange={setOffice}
                options={officeList}
                placeholder="Select Office"
                valueKey="_id"
                labelKey="name"
                required
              />
              <Select
                value={selectedShift}
                onChange={setSelectedShift}
                options={shiftList}
                placeholder="Select Shift Policy"
                valueKey="_id"
                labelKey="name"
                required
              />
              <Select
                value={selectedWeekOff}
                onChange={setSelectedWeekOff}
                options={weekOffList}
                placeholder="Select Week-Off Policy"
                valueKey="_id"
                labelKey="name"
                required
              />
            </div>
          </div>

          {/* Section: Department & Designation */}
          <div className="mb-6">
            <h5 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-4 flex items-center gap-2">
              <Briefcase size={14} />
              Department & Designation
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                value={department}
                onChange={handleDepartmentChange}
                options={getDepartmentOptions()}
                placeholder="Select Department"
                valueKey="_id"
                labelKey="name"
                required
                customOption={({ option }) => {
                  if (option.isAddNew) {
                    return (
                      <div className="text-[#ff6b35] font-medium flex items-center gap-2">
                        <Plus size={16} />
                        {option.name}
                      </div>
                    );
                  }
                  return option.name;
                }}
              />
              <Select
                value={empDesignation}
                onChange={handleDesignationChange}
                options={getDesignationOptions()}
                placeholder={department ? "Select Designation" : "Select Department first"}
                valueKey="_id"
                labelKey="title"
                disabled={!department}
                required
                customOption={({ option }) => {
                  if (option.isAddNew) {
                    return (
                      <div className="text-[#ff6b35] font-medium flex items-center gap-2">
                        <Plus size={16} />
                        {option.title || option.name}
                      </div>
                    );
                  }
                  return option.title || option.name;
                }}
              />
            </div>
          </div>

          {/* Section: Reporting Manager */}
          <div className="mb-6">
            <h5 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-4 flex items-center gap-2">
              <User size={14} />
              Reporting Manager
            </h5>
            <Select
              value={rm}
              onChange={setRm}
              options={rmList}
              placeholder="Select Reporting Manager"
              valueKey="_id"
              labelKey="fullName"
            />
          </div>

          {/* Section: Employee Details */}
          <div className="mb-6">
            <h5 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-4 flex items-center gap-2">
              <User size={14} />
              Employee Details
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                maxLength={10}
                placeholder="Employee ID"
                value={empId.toUpperCase()}
                onChange={(value) => setEmpId(value.toUpperCase())}
                required
                label="Employee ID"
              />
              <Input
                type="text"
                maxLength={30}
                placeholder="Full Name"
                value={empName}
                onChange={(value) => {
                  const cleanedValue = value.replace(/\s{2,}/g, ' ');
                  if (/^[A-Za-z\s]*$/.test(cleanedValue) || cleanedValue === '') {
                    setEmpName(cleanedValue);
                  }
                }}
                required
                label="Full Name"
              />
              <Input
                type="email"
                placeholder="Email Address"
                value={empEmail}
                onChange={setEmpEmail}
                required
                label="Email"
                className="col-span-1 md:col-span-2"
              />
              <Input
                type="date"
                readOnly={isEditing}
                required
                max={new Date().toISOString().split("T")[0]}
                value={joiningDate}
                onChange={(value) => setJoiningDate(value)}
                placeholder="Joining Date"
                label="Joining Date"
              />
            </div>
          </div>

          {/* Section: Status */}
          <div className="mb-6">
            <h5 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-4 flex items-center gap-2">
              <Info size={14} />
              Employee Status
            </h5>
            <Select
              value={statusValue}
              onChange={handleStatusChange}
              options={[
                { _id: 'Active', name: 'Active' },
                { _id: 'Inactive', name: 'Inactive' }
              ]}
              placeholder="Select Status"
              valueKey="_id"
              labelKey="name"
            />
          </div>

          {/* Section: System Information */}
          <div className="mb-6">
            <h5 className="text-white/50 text-xs font-medium uppercase tracking-wider mb-4 flex items-center gap-2">
              <Monitor size={14} />
              System Information
            </h5>
            <div className="space-y-4">
              <Select
                value={isSystemProvided}
                onChange={setIsSystemProvided}
                options={[{ _id: "YES", name: "YES" }, { _id: "NO", name: "NO" }]}
                placeholder="Is System Provided?"
                valueKey="_id"
                labelKey="name"
              />
              
              {isSystemProvided === 'YES' && (
                <div className="space-y-4 bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      value={systemType}
                      onChange={setSystemType}
                      options={[
                        { _id: "LAPTOP", name: "Laptop" },
                        { _id: "DESKTOP", name: "Desktop" }
                      ]}
                      placeholder="Select System Type"
                      valueKey="_id"
                      labelKey="name"
                    />
                    <Select
                      value={operatingSystem}
                      onChange={setOperatingSystem}
                      options={[
                        { _id: "WINDOWS", name: "Windows" },
                        { _id: "MAC_OS", name: "macOS" },
                        { _id: "LINUX", name: "Linux" }
                      ]}
                      placeholder="Select Operating System"
                      valueKey="_id"
                      labelKey="name"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      type="text"
                      placeholder="Device Name"
                      value={deviceName}
                      onChange={setDeviceName}
                    />
                    <Input
                      type="text"
                      placeholder="Serial Number"
                      value={serialNumber}
                      onChange={setSerialNumber}
                    />
                    <Input
                      type="text"
                      placeholder="Brand Name"
                      value={brandName}
                      onChange={setBrandName}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 sticky bottom-0 bg-[#032446]/95 backdrop-blur-sm flex gap-3 justify-end">
          <button
            onClick={close}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateNewEmployee}
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-[#ff6b35] to-[#e55a2a] hover:from-[#e55a2a] hover:to-[#cc4a1a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>{isEditing ? 'Update Employee' : 'Create Employee'}</>
            )}
          </button>
        </div>
      </div>

      {/* Add Department Modal */}
      {showAddDeptModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-[#032446] rounded-2xl p-6 max-w-md w-full mx-4 border border-white/10 shadow-2xl">
            <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Building size={20} className="text-[#ff6b35]" />
              Add New Department
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-white/60 text-sm block mb-1.5">
                  Department Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Insurance"
                  value={newDeptName}
                  onChange={setNewDeptName}
                />
              </div>
              <div>
                <label className="text-white/60 text-sm block mb-1.5">
                  Department Code <span className="text-white/30 text-xs">(Optional)</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g., INS-456"
                  value={newDeptCode}
                  onChange={setNewDeptCode}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddDeptModal(false);
                    setNewDeptName('');
                    setNewDeptCode('');
                  }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDepartment}
                  className="px-4 py-2 bg-[#ff6b35] hover:bg-[#e55a2b] text-white rounded-xl transition-all duration-200"
                >
                  Create Department
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Designation Modal */}
      {showAddDesignationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-[#032446] rounded-2xl p-6 max-w-md w-full mx-4 border border-white/10 shadow-2xl">
            <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <Briefcase size={20} className="text-[#ff6b35]" />
              Add New Designation
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-white/60 text-sm block mb-1.5">
                  Designation Title <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Insurance Officer"
                  value={newDesignationTitle}
                  onChange={setNewDesignationTitle}
                />
              </div>
              <div>
                <label className="text-white/60 text-sm block mb-1.5">
                  Department
                </label>
                <div className="text-white/70 text-sm px-4 py-2.5 bg-white/5 rounded-xl border border-white/10">
                  {departmentList.find(d => d._id === department)?.name || 'Selected Department'}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddDesignationModal(false);
                    setNewDesignationTitle('');
                  }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDesignation}
                  className="px-4 py-2 bg-[#ff6b35] hover:bg-[#e55a2b] text-white rounded-xl transition-all duration-200"
                >
                  Create Designation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateNewEmployee;