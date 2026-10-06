import { useEffect, useState, useCallback } from "react";
import { getRequest, postRequest } from "../../../services/api/APIMethodCaller";
import { useDispatch, useSelector } from "react-redux";
import { createNewEmployee, resetCreateEmployeeState } from "../slice/createEmployee";
import { fetchEmployeeList } from "../slice/employeeList";

export const useCreateEmployee = (close, selectedEmp) => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector(
    (state) => state.createEmployee
  );

  // Form State
  const [officeList, setOfficeList] = useState([]);
  const [office, setOffice] = useState('');
  const [shiftList, setShiftList] = useState([]);
  const [selectedShift, setSelectedShift] = useState('');
  const [weekOffList, setWeekOffList] = useState([]);
  const [selectedWeekOff, setSelectedWeekOff] = useState('');
  const [departmentList, setDepartmentList] = useState([]);
  const [department, setDepartment] = useState('');
  const [rmList, setRmList] = useState([]);
  const [rm, setRm] = useState('');
  const [empId, setEmpId] = useState('');
  const [empName, setEmpName] = useState('');
  const [designationList, setDesignationList] = useState([]);
  const [empDesignation, setEmpDesignation] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [isSystemProvided, setIsSystemProvided] = useState('');
  const [systemType, setSystemType] = useState('');
  const [operatingSystem, setOperatingSystem] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [brandName, setBrandName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isLoadingDesignations, setIsLoadingDesignations] = useState(false);

  // ---- Add Department Modal State ----
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');

  // ---- Add Designation Modal State ----
  const [showAddDesignationModal, setShowAddDesignationModal] = useState(false);
  const [newDesignationTitle, setNewDesignationTitle] = useState('');

  // ---- Populate form when editing ----
  useEffect(() => {
    if (selectedEmp) {
      console.log("📝 Editing employee:", selectedEmp);
      console.log("📝 Designation ID from employee:", selectedEmp.designationId);
      console.log("📝 Designation Name from employee:", selectedEmp.designation);

      // Basic Info
      setOffice(selectedEmp?.office || '');
      setSelectedShift(selectedEmp?.shiftPolicy || '');
      setSelectedWeekOff(selectedEmp?.weeklyOffPolicy || '');
      setDepartment(selectedEmp?.departmentId || '');
      setRm(selectedEmp?.reportingTo?._id || '');
      setEmpId(selectedEmp?.employeeCode || '');
      setEmpEmail(selectedEmp?.email || '');

      // FIX: Set designation with proper fallback
      const designationId = selectedEmp?.designationId ||
                           selectedEmp?.designation?._id ||
                           selectedEmp?.designation_id ||
                           '';
      setEmpDesignation(designationId);
      console.log("📝 Set designation to:", designationId);

      setEmpName(selectedEmp?.fullName || '');
      setJoiningDate(selectedEmp?.joiningDate?.split("T")[0] || '');
      setIsActive(selectedEmp?.isActive ?? true);

      // System Info
      const systemInfo = selectedEmp?.systemInfo || {};
      setIsSystemProvided(systemInfo?.isSystemProvided ? 'YES' : 'NO');
      setSystemType(systemInfo?.systemType || '');
      setOperatingSystem(systemInfo?.operatingSystem || '');
      setDeviceName(systemInfo?.deviceName || '');
      setSerialNumber(systemInfo?.serialNumber || '');
      setBrandName(systemInfo?.brand || '');

      // FIX: Fetch designations for the department and then set the designation
      if (selectedEmp?.departmentId) {
        console.log("📝 Fetching designations for department:", selectedEmp.departmentId);
        setIsLoadingDesignations(true);
        fetchDesignationList(selectedEmp.departmentId).then((designations) => {
          console.log("📝 Fetched designations:", designations);
          if (designationId) {
            const exists = designations.some(d => d._id === designationId);
            if (exists) {
              setEmpDesignation(designationId);
              console.log("📝 Designation found and set:", designationId);
            } else {
              const byTitle = designations.find(d => d.title === selectedEmp?.designation);
              if (byTitle) {
                setEmpDesignation(byTitle._id);
                console.log("📝 Designation found by title:", byTitle._id);
              } else if (designations.length > 0) {
                setEmpDesignation(designations[0]._id);
                console.log("📝 Fallback to first designation:", designations[0]._id);
              }
            }
          }
          setIsLoadingDesignations(false);
        });
      }
    }
  }, [selectedEmp]);

  // ---- Reset form when modal closes ----
  useEffect(() => {
    if (!selectedEmp) {
      setOffice('');
      setSelectedShift('');
      setSelectedWeekOff('');
      setDepartment('');
      setRm('');
      setEmpId('');
      setEmpEmail('');
      setEmpDesignation('');
      setEmpName('');
      setJoiningDate('');
      setIsActive(true);
      setIsSystemProvided('');
      setSystemType('');
      setOperatingSystem('');
      setDeviceName('');
      setSerialNumber('');
      setBrandName('');
    }
  }, [selectedEmp]);

  // ---- Success/Error handling ----
  useEffect(() => {
    if (error) {
      alert(error);
      return;
    }
    if (success) {
      alert(`Employee ${selectedEmp ? 'updated' : 'created'} successfully!`);
      dispatch(resetCreateEmployeeState());
      dispatch(fetchEmployeeList());
      close();
    }
  }, [success, error, dispatch, selectedEmp, close]);

  // ---- Fetch initial data (including RM list ONCE) ----
  useEffect(() => {
    fetchDepartmentList();
    fetchShiftList();
    fetchWeekOfftList();
    fetchOfficeLocationList();
    fetchRMList(); // 👈 no department → /employee?departmentId (key only)
  }, []);

  // ---- Fetch Designation when department changes ----
  useEffect(() => {
    if (department) {
      fetchDesignationList(department);
    } else {
      setDesignationList([]);
      setEmpDesignation('');
    }
  }, [department]);

  // ----------- Fetch Office Location ----------
  const fetchOfficeLocationList = async () => {
    try {
      const response = await getRequest('/office');
      if (response.success) {
        setOfficeList(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching offices:', err);
    }
  };

  // ----------- Fetch Department ----------
  const fetchDepartmentList = async () => {
    try {
      const response = await getRequest('/department');
      if (response.success) {
        console.log("📋 Department list:", response.data.data);
        setDepartmentList(response.data.data);
        return response.data.data;
      }
      return [];
    } catch (err) {
      console.error('Error fetching departments:', err);
      return [];
    }
  };

  // ----------- Create Department ----------
  const createDepartment = async () => {
    if (!newDeptName.trim()) {
      alert('Please enter department name.');
      return;
    }
    try {
      const response = await postRequest('/department', {
        name: newDeptName.trim(),
        code: newDeptCode.trim() || undefined,
      });

      if (response.success) {
        alert('Department created successfully!');
        const updatedList = await fetchDepartmentList();
        const newDept = updatedList.find(d => d.name === newDeptName.trim());

        if (newDept) {
          setDepartment(newDept._id);
        } else if (updatedList.length > 0) {
          setDepartment(updatedList[0]._id);
        }

        setNewDeptName('');
        setNewDeptCode('');
        setShowAddDeptModal(false);
      } else {
        alert(response.error || 'Failed to create department');
      }
    } catch (err) {
      console.error('Error creating department:', err);
      alert('Error creating department');
    }
  };

  // ----------- Fetch Designation ----------
  const fetchDesignationList = async (departmentId) => {
    if (!departmentId) {
      setDesignationList([]);
      return [];
    }

    try {
      console.log("📋 Fetching designations for department:", departmentId);
      const response = await getRequest(`/designation?departmentId=${departmentId}`);
      console.log("📋 Designation response:", response);

      if (response.success) {
        const data = response.data.data || [];
        setDesignationList(data);
        console.log("📋 Designation list set:", data);
        return data;
      }
      setDesignationList([]);
      return [];
    } catch (err) {
      console.error('Error fetching designations:', err);
      setDesignationList([]);
      return [];
    }
  };

  // ----------- Create Designation ----------
  const createDesignation = async (departmentId) => {
    if (!newDesignationTitle.trim()) {
      alert('Please enter designation title.');
      return;
    }

    if (!departmentId) {
      alert('Please select a department first.');
      return;
    }

    try {
      console.log("📋 Creating designation with:", {
        title: newDesignationTitle.trim(),
        department: departmentId
      });

      const response = await postRequest('/designation', {
        title: newDesignationTitle.trim(),
        department: departmentId,
      });

      console.log("📋 Create designation response:", response);

      if (response.success) {
        alert('Designation created successfully!');
        const updatedList = await fetchDesignationList(departmentId);

        const newDesignation = updatedList.find(d => d.title === newDesignationTitle.trim());

        if (newDesignation) {
          setEmpDesignation(newDesignation._id);
        } else if (updatedList.length > 0) {
          setEmpDesignation(updatedList[0]._id);
        }

        setNewDesignationTitle('');
        setShowAddDesignationModal(false);
      } else {
        alert(response.error || 'Failed to create designation');
      }
    } catch (err) {
      console.error('Error creating designation:', err);
      alert('Error creating designation');
    }
  };

  // ------------ Fetch Reporting Manager ----------
  // Always called WITHOUT department → sends `/employee?departmentId` (key only, no value)
  const fetchRMList = async () => {
    try {
      const url = `/employee?departmentId`; // 👈 key only, no value → backend skips department filter but key exists

      const response = await getRequest(url);
      if (response.success) {
        setRmList(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching RM list:', err);
    }
  };

  // ------------ Shift Policy ---------
  const fetchShiftList = async () => {
    try {
      const response = await getRequest('/shift-policies');
      if (response.success) {
        setShiftList(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching shifts:', err);
    }
  };

  // ------------ Week Off Policy ---------
  const fetchWeekOfftList = async () => {
    try {
      const response = await getRequest('/week-off');
      if (response.success) {
        setWeekOffList(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching week off policies:', err);
    }
  };

  // ------------ Submit Handler ----------
  const handleCreateNewEmployee = () => {
    if (!office || !selectedShift || !selectedWeekOff || !department || !empId || !empName ||
      !empEmail || !empDesignation || !joiningDate) {
      alert('Please fill all required fields.');
      return;
    }

    const payload = {
      employeeCode: empId.toUpperCase().trim(),
      fullName: empName.trim(),
      email: empEmail.trim(),
      designation: empDesignation,
      department: department,
      reportingTo: rm || undefined,
      office: office,
      shiftPolicy: selectedShift,
      weeklyOffPolicy: selectedWeekOff,
      joiningDate: joiningDate,
      isActive: isActive,
      ...(isSystemProvided === 'YES' && {
        systemInfo: {
          isSystemProvided: true,
          systemType: systemType || undefined,
          operatingSystem: operatingSystem || undefined,
          deviceName: deviceName || undefined,
          brand: brandName || undefined,
          serialNumber: serialNumber || undefined
        }
      }),
      ...(isSystemProvided !== 'YES' && {
        systemInfo: {
          isSystemProvided: false
        }
      })
    };

    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined || payload[key] === '') {
        delete payload[key];
      }
    });

    console.log("📦 Payload being sent:", payload);
    dispatch(createNewEmployee({ selectedEmp, payload }));
  };

  return {
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
    isLoadingDesignations,

    showAddDeptModal, setShowAddDeptModal,
    newDeptName, setNewDeptName,
    newDeptCode, setNewDeptCode,
    createDepartment,

    showAddDesignationModal, setShowAddDesignationModal,
    newDesignationTitle, setNewDesignationTitle,
    createDesignation,

    handleCreateNewEmployee,
    loading, error,
  };
};