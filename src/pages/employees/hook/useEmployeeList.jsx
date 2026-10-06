import { useEffect, useMemo, useState, useCallback } from "react";
import { getEmployeesListColumns } from "../data/EmployeeListColumn";
import { useDispatch, useSelector } from "react-redux";
import {
  empError,
  empList,
  empLoading,
  fetchEmployeeList
} from "../slice/employeeList";

export const useEmployeeList = () => {
  const dispatch = useDispatch();

  const employees = useSelector(empList);
  const loading = useSelector(empLoading);
  const error = useSelector(empError);

  const [searchEmpId, setSearchEmpId] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [selectedEmp, setSelectedEmp] = useState(null);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchEmployeeList());
  }, [dispatch]);

  // Open Add Employee Form
  const handleAddEmployee = () => {
    setSelectedEmp(null);
    setIsEmployeeModalOpen(true);
  };

  // Open Edit Employee Form
  const handleEditEmployee = useCallback((emp) => {
    console.log("✏️ Editing employee:", emp);
    setSelectedEmp(emp);
    setIsEmployeeModalOpen(true);
  }, []);

  // Close Modal
  const closeEmployeeModal = () => {
    setIsEmployeeModalOpen(false);
    setSelectedEmp(null);
  };

  // Departments
  const departments = useMemo(() => {
    return [...new Set(
      employees
        .map((e) => e?.department)
        .filter(Boolean)
    )].sort();
  }, [employees]);

  // Status options
  const statusOptions = useMemo(() => {
    return ['Active', 'Inactive'];
  }, []);

  // Filtered Employee List
  const filteredEmpList = useMemo(() => {
    return employees.filter((emp) => {
      const searchTerm = searchEmpId.toLowerCase().trim();
      
      // Search filter
      if (searchTerm) {
        const matchesSearch = 
          emp?.employeeCode?.toLowerCase().includes(searchTerm) ||
          emp?.fullName?.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
      }

      // Department filter
      if (departmentFilter) {
        if (emp?.department !== departmentFilter) return false;
      }

      // Status filter
      if (statusFilter) {
        const isActive = emp?.isActive ?? true;
        if (statusFilter === 'Active' && !isActive) return false;
        if (statusFilter === 'Inactive' && isActive) return false;
      }

      return true;
    });
  }, [employees, searchEmpId, departmentFilter, statusFilter]);

  // Columns
  const columns = useMemo(
    () =>
      getEmployeesListColumns({
        handleSelectedEmp: handleEditEmployee,
      }),
    [handleEditEmployee]
  );

  return {
    searchEmpId,
    setSearchEmpId,
    departmentFilter,
    setDepartmentFilter,
    statusFilter,
    setStatusFilter,
    statusOptions,
    loading,
    error,
    departments,
    filteredEmpList,
    columns,
    selectedEmp,
    isEmployeeModalOpen,
    handleAddEmployee,
    closeEmployeeModal,
  };
};