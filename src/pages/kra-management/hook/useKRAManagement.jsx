import React, { useEffect, useState } from 'react';
import { deleteRequest, getRequest, postRequest, patchRequst } from '../../../services/api/APIMethodCaller';
import { Award, CheckSquare, GraduationCap, Shield, TrendingUp, UserX } from 'lucide-react';

export const useKRAManagement = () => {

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingKRA, setDeletingKRA] = useState(false);
  const [updatingKRA, setUpdatingKRA] = useState(false);
  const [error, setError] = useState(null);
  const [kraList, setKraList] = useState([]);
  const [editingKRA, setEditingKRA] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [employeesList, setEmployeesList] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState([]);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  
  // Edit mode specific states
  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState(null);
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
  const [employeeMetrics, setEmployeeMetrics] = useState([]);
  const [originalKraId, setOriginalKraId] = useState(null);
  const [batchEmployeesList, setBatchEmployeesList] = useState([]);

  // Metrics with employee assignments (for create mode)
  const [metrics, setMetrics] = useState([
    {
      id: Date.now(),
      category: '',
      name: '',
      target: 0,
      weightage: 0,
      assignedEmployees: []
    }
  ]);

  const [isCreatingKRA, setIsCreatingKRA] = useState(false);
  const [currentMetricIndex, setCurrentMetricIndex] = useState(null);
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // -------------------- 🆕 KRA Category API --------------------
  const [kraCategories, setKraCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newCategoryDisplayOrder, setNewCategoryDisplayOrder] = useState(1);
  const [addingCategory, setAddingCategory] = useState(false);

  // Fetch categories from API
  const fetchKRACategories = async () => {
    try {
      const response = await getRequest('/kra-category');
      if (response.success) {
        setKraCategories(response.data.data || []);
      } else {
        console.error('Failed to fetch KRA categories:', response.message);
      }
    } catch (err) {
      console.error('Error fetching KRA categories:', err);
    }
  };

  // Add new category via API
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Category name is required');
      return;
    }

    setAddingCategory(true);
    try {
      const payload = {
        categoryName: newCategoryName.trim(),
        description: newCategoryDescription.trim() || '',
        displayOrder: parseInt(newCategoryDisplayOrder) || 1,
      };

      const response = await postRequest('/kra-category', payload);
      if (response.success) {
        alert('Category added successfully!');
        // Refresh the list
        await fetchKRACategories();
        // Close modal and reset form
        closeCategoryModal();
        // Optionally, auto-select the new category? User can pick from dropdown.
      } else {
        alert(response.message || 'Failed to add category');
      }
    } catch (err) {
      console.error('Error adding category:', err);
      alert('Something went wrong while adding category.');
    } finally {
      setAddingCategory(false);
    }
  };

  const openCategoryModal = () => {
    setNewCategoryName('');
    setNewCategoryDescription('');
    setNewCategoryDisplayOrder(1);
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setNewCategoryName('');
    setNewCategoryDescription('');
    setNewCategoryDisplayOrder(1);
  };
  // -------------------------------------------------------------

  const handleOpenCreateForm = () => {
    setShowCreateForm(true);
    setEditingKRA(null);
    setShowEditForm(false);
    setMetrics([
      {
        id: Date.now(),
        category: '',
        name: '',
        target: 0,
        weightage: 0,
        assignedEmployees: []
      }
    ]);
    setValidationErrors({});
    setSelectedEmployee([]);
    setSelectedDepartment('');
    setSelectedPeriod('');
    setEditTitle('');
    setEditDescription('');
    setSelectedEmployeeForEdit(null);
    setSelectedEmployeeData(null);
    setEmployeeMetrics([]);
  };

  const normalizeName = (str) => (str || '').trim().toLowerCase();

  const handleOpenEditForm = async (kraData) => {
    try {
      setLoading(true);
      setShowEditForm(true);
      setShowCreateForm(false);
      setEditingKRA(kraData);
      
      // Store the batch employee list for the dropdown
      setBatchEmployeesList(kraData.employees || []);
      
      // Set department and period
      const dept = departments.find(
        d => normalizeName(d.name) === normalizeName(kraData.department)
      );
      const deptId = dept?._id || '';
      setSelectedDepartment(deptId);
      setSelectedPeriod(kraData.period || 'quarterly');
      setEditTitle(kraData.title || '');
      setEditDescription(kraData.description || '');

      // Fetch employees for this department
      let currentEmployeesList = [];
      if (deptId) {
        currentEmployeesList = await fetchEmployeesList(deptId) || [];
      }
      setEmployeesList(currentEmployeesList);

      // Fetch the actual KRA data to get employee-specific metrics
      const response = await getRequest(`/kra/batch/${kraData.batchId}`);
      console.log('Batch KRA Data:', response);

      if (response.success && response.data) {
        const batchData = response.data.data;
        
        // Store the batch employees data for selection
        setBatchEmployeesList(batchData.employees.map(emp => emp.name));
        
        // If there's only one employee, auto-select them
        if (batchData.employees.length === 1) {
          const emp = batchData.employees[0];
          setSelectedEmployeeForEdit(emp.name);
          setSelectedEmployeeData(emp);
          setEmployeeMetrics(emp.metrics || []);
          setOriginalKraId(emp.kraId || emp.id);
        } else {
          // Reset selection for multiple employees
          setSelectedEmployeeForEdit(null);
          setSelectedEmployeeData(null);
          setEmployeeMetrics([]);
          setOriginalKraId(null);
        }
      }

      setValidationErrors({});
    } catch (err) {
      console.error('Error loading KRA for edit:', err);
      alert('Failed to load KRA data for editing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle employee selection in edit mode
  const handleEmployeeSelect = (employeeName) => {
    setSelectedEmployeeForEdit(employeeName);
    
    // Find the employee data from the batch
    const fetchEmployeeData = async () => {
      try {
        const response = await getRequest(`/kra/batch/${editingKRA.batchId}`);
        if (response.success && response.data) {
          const batchData = response.data.data;
          const emp = batchData.employees.find(e => e.name === employeeName);
          if (emp) {
            setSelectedEmployeeData(emp);
            setEmployeeMetrics(emp.metrics || []);
            setOriginalKraId(emp.kraId || emp.id);
            
            // Clear validation errors
            setValidationErrors({});
          }
        }
      } catch (err) {
        console.error('Error fetching employee data:', err);
      }
    };
    
    fetchEmployeeData();
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setEditingKRA(null);
    setMetrics([
      {
        id: Date.now(),
        category: '',
        name: '',
        target: 0,
        weightage: 0,
        assignedEmployees: []
      }
    ]);
    setSelectedDepartment('');
    setSelectedPeriod('');
    setSelectedEmployee([]);
    setEditTitle('');
    setEditDescription('');
    setCurrentMetricIndex(null);
    setShowEmployeeSelector(false);
    setValidationErrors({});
    setSelectedEmployeeForEdit(null);
    setSelectedEmployeeData(null);
    setEmployeeMetrics([]);
    setOriginalKraId(null);
    setBatchEmployeesList([]);
  };

  useEffect(() => {
    fetchDepartmentList();
    fetchkraList();
    fetchKRACategories(); // 🆕 fetch categories on mount
  }, []);

  const fetchkraList = async () => {
    setLoading(true);
    try {
      const res = await getRequest('/kra');
      console.log('KRA List API Response:', res);
      
      if (res.success) {
        console.log('KRA List Response:', res);
        const kraData = res.data.data || [];
        
        console.log('Fetched KRA List:', kraData);
        
        const processedData = kraData.map((kra) => {
          if (kra.employeeMetrics && Object.keys(kra.employeeMetrics).length > 0) {
            const processedMetrics = {};
            Object.entries(kra.employeeMetrics).forEach(([empName, empData]) => {
              processedMetrics[empName] = {
                employeeId: empData.employeeId,
                metrics: empData.metrics.map(m => ({
                  ...m,
                  score: m.score || 0,
                  status: m.status || 'pending',
                  progress: m.target > 0 ? Math.min((m.achieved || 0) / m.target * 100, 100) : 0
                }))
              };
            });
            return {
              ...kra,
              employeeMetrics: processedMetrics
            };
          }
          return kra;
        });
        
        setKraList(processedData);
      } else {
        console.log("API Fetch Failed");
        setError("Failed to fetch");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentList = async () => {
    try {
      const response = await getRequest('/department');
      if (response.success) {
        console.log("Department list:", response);
        setDepartments(response.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const periodOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  useEffect(() => {
    if (selectedDepartment) {
      fetchEmployeesList(selectedDepartment);
    }
  }, [selectedDepartment]);

  const fetchEmployeesList = async (department) => {
    try {
      const response = await getRequest(`/employee?departmentId=${department}`);
      if (response.success) {
        console.log("Employee list:", response);
        const employees = response.data.data || [];
        setEmployeesList(employees);
        return employees;
      }
      return [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  // CREATE MODE FUNCTIONS
  const handleAddMetric = () => {
    setMetrics([
      ...metrics,
      {
        id: Date.now() + Math.random(),
        category: '',
        name: '',
        target: 0,
        weightage: 0,
        assignedEmployees: []
      }
    ]);
  };

  const handleRemoveMetric = (index) => {
    const updatedMetrics = [...metrics];
    updatedMetrics.splice(index, 1);
    setMetrics(updatedMetrics);

    const newErrors = { ...validationErrors };
    Object.keys(newErrors).forEach(key => {
      if (key.includes(`metric_${index}`)) {
        delete newErrors[key];
      }
    });
    setValidationErrors(newErrors);
  };

  const handleMetricChange = (index, field, value) => {
    const updatedMetrics = [...metrics];
    updatedMetrics[index][field] = value;
    setMetrics(updatedMetrics);

    const newErrors = { ...validationErrors };
    const errorKey = `metric_${index}_${field}`;
    if (newErrors[errorKey]) {
      delete newErrors[errorKey];
      setValidationErrors(newErrors);
    }
  };

  // EDIT MODE FUNCTIONS - Employee-specific metrics
  const handleAddEmployeeMetric = () => {
    setEmployeeMetrics([
      ...employeeMetrics,
      {
        id: Date.now() + Math.random(),
        category: '',
        name: '',
        target: 0,
        weightage: 0,
      }
    ]);
  };

  const handleRemoveEmployeeMetric = (index) => {
    if (employeeMetrics.length > 1) {
      const updatedMetrics = [...employeeMetrics];
      updatedMetrics.splice(index, 1);
      setEmployeeMetrics(updatedMetrics);

      const newErrors = { ...validationErrors };
      Object.keys(newErrors).forEach(key => {
        if (key.includes(`employee_metric_${index}`)) {
          delete newErrors[key];
        }
      });
      setValidationErrors(newErrors);
    }
  };

  const handleEmployeeMetricChange = (index, field, value) => {
    const updatedMetrics = [...employeeMetrics];
    updatedMetrics[index][field] = value;
    setEmployeeMetrics(updatedMetrics);

    const newErrors = { ...validationErrors };
    const errorKey = `employee_metric_${index}_${field}`;
    if (newErrors[errorKey]) {
      delete newErrors[errorKey];
      setValidationErrors(newErrors);
    }
  };

  const toggleEmployeeAssignment = (metricIndex, employeeId) => {
    const updatedMetrics = [...metrics];
    const currentAssigned = updatedMetrics[metricIndex].assignedEmployees || [];

    if (currentAssigned.includes(employeeId)) {
      updatedMetrics[metricIndex].assignedEmployees = currentAssigned.filter(id => id !== employeeId);
    } else {
      updatedMetrics[metricIndex].assignedEmployees = [...currentAssigned, employeeId];
    }

    setMetrics(updatedMetrics);

    const newErrors = { ...validationErrors };
    const errorKey = `metric_${metricIndex}_assignedEmployees`;
    if (newErrors[errorKey]) {
      delete newErrors[errorKey];
      setValidationErrors(newErrors);
    }
  };

  const openEmployeeSelector = (index) => {
    setCurrentMetricIndex(index);
    setShowEmployeeSelector(true);
  };

  const closeEmployeeSelector = () => {
    setCurrentMetricIndex(null);
    setShowEmployeeSelector(false);
  };

  const getEmployeeName = (id) => {
    const emp = employeesList.find(e => e._id === id);
    return emp?.fullName || 'Unknown';
  };

  const getEmployeeWeightage = (employeeId) => {
    let total = 0;
    metrics.forEach(metric => {
      if (metric.assignedEmployees && metric.assignedEmployees.includes(employeeId)) {
        total += parseInt(metric.weightage) || 0;
      }
    });
    return total;
  };

  const getEmployeeWeightageForEdit = () => {
    let total = 0;
    employeeMetrics.forEach(metric => {
      total += parseInt(metric.weightage) || 0;
    });
    return total;
  };

  const autoDistributeWeightage = () => {
    if (metrics.length === 0) return;

    const updatedMetrics = metrics.map(metric => {
      const assigned = metric.assignedEmployees || [];

      if (assigned.length === 0) {
        return { ...metric, weightage: Math.floor(100 / metrics.length) };
      }

      const idealValues = assigned.map(empId => {
        const metricsForEmployee = metrics.filter(
          m => m.assignedEmployees && m.assignedEmployees.includes(empId)
        );
        return 100 / (metricsForEmployee.length || 1);
      });

      const avgIdeal = idealValues.reduce((a, b) => a + b, 0) / idealValues.length;
      return { ...metric, weightage: Math.round(avgIdeal) };
    });

    setMetrics(updatedMetrics);
  };

  const getWeightageSuggestion = () => {
    const suggestions = [];

    selectedEmployee.forEach(empId => {
      const empWeightage = getEmployeeWeightage(empId);
      if (empWeightage !== 100) {
        const diff = 100 - empWeightage;
        suggestions.push(`${getEmployeeName(empId)} needs ${diff}% more weightage.`);
      }
    });

    return suggestions;
  };

  // VALIDATION
  const validateAll = () => {
    const errors = {};

    // Validate create mode metrics
    if (!showEditForm) {
      metrics.forEach((metric, index) => {
        if (!metric.category) {
          errors[`metric_${index}_category`] = 'Category is required';
        }
        if (!metric.name) {
          errors[`metric_${index}_name`] = 'Metric name is required';
        }
        if (!metric.target || isNaN(metric.target) || metric.target <= 0) {
          errors[`metric_${index}_target`] = 'Valid target is required';
        }
        if (!metric.weightage || isNaN(metric.weightage) || metric.weightage <= 0) {
          errors[`metric_${index}_weightage`] = 'Valid weightage is required';
        }
        if (!metric.assignedEmployees || metric.assignedEmployees.length === 0) {
          errors[`metric_${index}_assignedEmployees`] = 'At least one employee must be assigned';
        }
      });

      selectedEmployee.forEach(empId => {
        const empWeightage = getEmployeeWeightage(empId);
        if (empWeightage !== 100) {
          errors[`employee_${empId}_weightage`] =
            `${getEmployeeName(empId)} has ${empWeightage}% weightage (must be 100%)`;
        }
      });

      const assignedEmployees = new Set();
      metrics.forEach(metric => {
        if (metric.assignedEmployees) {
          metric.assignedEmployees.forEach(empId => assignedEmployees.add(empId));
        }
      });

      selectedEmployee.forEach(empId => {
        if (!assignedEmployees.has(empId)) {
          errors[`employee_${empId}_no_metrics`] =
            `${getEmployeeName(empId)} has no metrics assigned`;
        }
      });
    } else {
      // Validate edit mode - employee-specific metrics
      employeeMetrics.forEach((metric, index) => {
        if (!metric.category) {
          errors[`employee_metric_${index}_category`] = 'Category is required';
        }
        if (!metric.name) {
          errors[`employee_metric_${index}_name`] = 'Metric name is required';
        }
        if (!metric.target || isNaN(metric.target) || metric.target <= 0) {
          errors[`employee_metric_${index}_target`] = 'Valid target is required';
        }
        if (!metric.weightage || isNaN(metric.weightage) || metric.weightage <= 0) {
          errors[`employee_metric_${index}_weightage`] = 'Valid weightage is required';
        }
      });

      // Check total weightage for the selected employee
      const totalWeight = employeeMetrics.reduce((sum, m) => sum + (parseFloat(m.weightage) || 0), 0);
      if (totalWeight !== 100) {
        errors[`employee_total_weightage`] = `Total weightage must be 100% (currently ${totalWeight}%)`;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // SAVE FUNCTIONS
  const handleSaveKRA = async () => {
    if (!selectedDepartment) {
      alert('Please select a department.');
      return;
    }
    if (!selectedPeriod) {
      alert('Please select a period.');
      return;
    }
    if (selectedEmployee.length === 0) {
      alert('Please select at least one employee.');
      return;
    }

    if (!validateAll()) {
      const errorMessages = Object.values(validationErrors);
      alert(`Please fix the following issues:\n\n${errorMessages.join('\n')}`);
      return;
    }

    const batchId = `BATCH_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const payload = {
      batchId: batchId,
      title: editTitle || `KRA - ${new Date().getFullYear()}`,
      description: editDescription || '',
      departmentId: selectedDepartment,
      period: selectedPeriod,
      employees: selectedEmployee.map(empId => ({
        employeeId: empId,
        metrics: metrics
          .filter(m => m.assignedEmployees && m.assignedEmployees.includes(empId))
          .map(m => ({
            category: m.category,
            name: m.name,
            target: parseFloat(m.target),
            weightage: parseFloat(m.weightage)
          }))
      }))
    };

    console.log('Create KRA Payload:', JSON.stringify(payload, null, 2));

    try {
      setIsCreatingKRA(true);
      const response = await postRequest('/kra/batch', payload);
      console.log('Create Response:', response);

      if (response.success) {
        alert(`Successfully created KRA for ${selectedEmployee.length} employee(s)!`);
        handleCancelForm();
        fetchkraList();
      } else {
        alert(response.message || 'Failed to create KRAs. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong while creating KRAs.');
    } finally {
      setIsCreatingKRA(false);
    }
  };

  const handleUpdateKRA = async () => {
    if (!editingKRA) {
      alert('No KRA selected for editing.');
      return;
    }

    if (!selectedEmployeeForEdit) {
      alert('Please select an employee to update.');
      return;
    }

    if (!originalKraId) {
      alert('No KRA ID found for the selected employee.');
      return;
    }

    if (!validateAll()) {
      const errorMessages = Object.values(validationErrors);
      alert(`Please fix the following issues:\n\n${errorMessages.join('\n')}`);
      return;
    }

    try {
      setUpdatingKRA(true);

      const payload = {
        title: editTitle || `KRA - ${new Date().getFullYear()}`,
        description: editDescription || '',
        departmentId: selectedDepartment,
        period: selectedPeriod,
        metrics: employeeMetrics.map(m => ({
          category: m.category,
          name: m.name,
          target: parseFloat(m.target),
          weightage: parseFloat(m.weightage)
        }))
      };

      console.log('Update Individual Payload:', JSON.stringify(payload, null, 2));

      const response = await patchRequst(`/kra/${originalKraId}`, payload);

      if (response.success) {
        alert(`Successfully updated KRA for ${selectedEmployeeForEdit}!`);
        handleCancelForm();
        fetchkraList();
      } else {
        alert(response.message || 'Failed to update KRA. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong while updating KRA.');
    } finally {
      setUpdatingKRA(false);
    }
  };

  const handleDeleteKRA = async (kraData) => {
    const confirm = window.confirm(
      `Are you sure you want to delete this KRA for ${kraData.employees?.join(', ') || 'employee'}?`
    );
    if (!confirm) return;

    if (kraData.employees && kraData.employees.length > 1) {
      const deleteAll = window.confirm(
        `This KRA is for ${kraData.employees.length} employees. Do you want to delete all employees from this batch?`
      );

      if (deleteAll) {
        try {
          setDeletingKRA(true);
          const response = await deleteRequest(`/kra/${kraData.batchId}`);
          if (response.success) {
            alert(response.message || 'Batch deleted successfully!');
            fetchkraList();
          } else {
            alert('Failed to delete batch.');
          }
        } catch (err) {
          console.error(err);
          alert('Something went wrong while deleting batch.');
        } finally {
          setDeletingKRA(false);
        }
        return;
      }
    }

    try {
      setDeletingKRA(true);
      const response = await deleteRequest(`/kra/individual/${kraData.id}`);
      if (response.success) {
        alert(response.message || 'KRA deleted successfully!');
        fetchkraList();
      } else {
        alert('Failed to delete KRA.');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong while deleting KRA.');
    } finally {
      setDeletingKRA(false);
    }
  };

  return {
    showCreateForm,
    showEditForm,
    editingKRA,
    kraList,
    handleOpenCreateForm,
    handleOpenEditForm,
    handleCancelForm,
    departments,
    selectedDepartment,
    setSelectedDepartment,
    periodOptions,
    selectedPeriod,
    setSelectedPeriod,
    employeesList,
    selectedEmployee,
    setSelectedEmployee,
    loading,
    error,
    kraCategories,                    // 🆕 dynamic list from API
    metrics,
    handleAddMetric,
    handleRemoveMetric,
    handleMetricChange,
    isCreatingKRA,
    updatingKRA,
    handleSaveKRA,
    handleUpdateKRA,
    deletingKRA,
    handleDeleteKRA,
    editTitle,
    setEditTitle,
    editDescription,
    setEditDescription,
    toggleEmployeeAssignment,
    openEmployeeSelector,
    closeEmployeeSelector,
    currentMetricIndex,
    showEmployeeSelector,
    getEmployeeName,
    getEmployeeWeightage,
    validationErrors,
    validateAll,
    autoDistributeWeightage,
    getWeightageSuggestion,
    // Edit mode specific
    selectedEmployeeForEdit,
    setSelectedEmployeeForEdit,
    selectedEmployeeData,
    employeeMetrics,
    setEmployeeMetrics,
    originalKraId,
    batchEmployeesList,
    handleEmployeeSelect,
    handleAddEmployeeMetric,
    handleRemoveEmployeeMetric,
    handleEmployeeMetricChange,
    getEmployeeWeightageForEdit,
    // 🆕 Category modal props
    showCategoryModal,
    openCategoryModal,
    closeCategoryModal,
    newCategoryName,
    setNewCategoryName,
    newCategoryDescription,
    setNewCategoryDescription,
    newCategoryDisplayOrder,
    setNewCategoryDisplayOrder,
    handleAddCategory,
    addingCategory,
  };
};