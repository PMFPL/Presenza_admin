import { Plus, Target, X, Edit, User, Users, RefreshCw, CheckCircle } from 'lucide-react';
import { useKRAManagement } from '../hook/useKRAManagement';
import Select from '../../../components/ui/Select';
import MultiSelect from '../../../components/ui/MultiSelect';
import KRAMatrics from '../../../components/KRA-Matrics/KRAMatrics';
import { KRAMatricsContainer } from '../../../components/KRA-Matrics/MatricsContainer';

function KRAManagement() {
  const { 
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
    kraCategories,                    // 🆕 dynamic
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
    autoDistributeWeightage,
    getWeightageSuggestion,
    // Edit mode specific
    selectedEmployeeForEdit,
    setSelectedEmployeeForEdit,
    employeeMetrics,
    setEmployeeMetrics,
    handleEmployeeSelect,
    handleAddEmployeeMetric,
    handleRemoveEmployeeMetric,
    handleEmployeeMetricChange,
    getEmployeeWeightageForEdit,
    batchEmployeesList,
    originalKraId,

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
  } = useKRAManagement();

  return (
    <div>
      {/* ---------- Header ----------- */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-400/20 rounded-lg">
              <Target className="h-8 w-8 text-purple-300" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">KRA Management</h2>
              <p className="text-sm text-gray-300">Create and manage KRAs for employees by department</p>
            </div>
          </div>
          {!showCreateForm && !showEditForm && (
            <button
              onClick={() => handleOpenCreateForm()}
              className="flex items-center gap-0 rounded-md px-4 py-2 cursor-pointer bg-gradient-to-r from-[#ff6b35] to-[#ff8555] text-white hover:shadow-lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create KRA
            </button>
          )}
        </div>
      </div>

      {/* -------------- Create KRA Form -------------- */}
      {showCreateForm && (
        <div className="mt-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">
              Create New KRA
            </h3>
            <button
              onClick={handleCancelForm}
              className="cursor-pointer text-gray-300 p-1 rounded hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className='flex justify-between gap-5'>
            <div className='w-full'>
              <Select
                value={selectedDepartment}
                onChange={setSelectedDepartment}
                options={departments}
                placeholder="Select Department"
                valueKey="_id"
                labelKey="name"
              />
            </div>
            <div className='w-full'>
              <Select
                value={selectedPeriod}
                onChange={setSelectedPeriod}
                options={periodOptions}
                placeholder="Select Period"
                valueKey="value"
                labelKey="label"
              />
            </div>
          </div>
          
          <div className='flex justify-between gap-5 mt-4'>
            <div className='w-full'>
              <MultiSelect
                value={selectedEmployee}
                onChange={setSelectedEmployee}
                options={employeesList}
                placeholder="Select Employees (Multiple)"
                valueKey="_id"
                labelKey="fullName"
              />
              {selectedEmployee.length > 0 && (
                <p className="text-sm text-gray-400 mt-1">
                  <Users className="inline h-4 w-4 mr-1" />
                  Selected {selectedEmployee.length} employee(s). Assign each metric to specific employees below.
                </p>
              )}
            </div>
          </div>

          {/* CREATE MODE */}
          <KRAMatrics
            kraCategories={kraCategories}               // 🆕
            metrics={metrics}
            handleAddMetric={handleAddMetric}
            handleRemoveMetric={handleRemoveMetric}
            handleMetricChange={handleMetricChange}
            isCreatingKRA={isCreatingKRA}
            handleSaveKRA={handleSaveKRA}
            handleCancelForm={handleCancelForm}
            buttonText={`Create KRAs (${selectedEmployee.length} employees)`}
            showTitleDesc={true}
            editTitle={editTitle}
            setEditTitle={setEditTitle}
            editDescription={editDescription}
            setEditDescription={setEditDescription}
            disabledButton={selectedEmployee.length === 0}
            selectedEmployee={selectedEmployee}
            getEmployeeName={getEmployeeName}
            getEmployeeWeightage={getEmployeeWeightage}
            toggleEmployeeAssignment={toggleEmployeeAssignment}
            openEmployeeSelector={openEmployeeSelector}
            closeEmployeeSelector={closeEmployeeSelector}
            currentMetricIndex={currentMetricIndex}
            showEmployeeSelector={showEmployeeSelector}
            validationErrors={validationErrors}
            autoDistributeWeightage={autoDistributeWeightage}
            getWeightageSuggestion={getWeightageSuggestion}
            isEditMode={false}
            // 🆕 Category modal props
            showCategoryModal={showCategoryModal}
            openCategoryModal={openCategoryModal}
            closeCategoryModal={closeCategoryModal}
            newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName}
            newCategoryDescription={newCategoryDescription}
            setNewCategoryDescription={setNewCategoryDescription}
            newCategoryDisplayOrder={newCategoryDisplayOrder}
            setNewCategoryDisplayOrder={setNewCategoryDisplayOrder}
            handleAddCategory={handleAddCategory}
            addingCategory={addingCategory}
          />
        </div>
      )}

      {/* -------------- Edit KRA Form -------------- */}
      {showEditForm && editingKRA && (
        <div className="mt-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white">Edit KRA</h3>
              <p className="text-sm text-gray-400">
                <Users className="inline h-4 w-4 mr-1" />
                Department: {editingKRA.department}
                <span className="mx-2">•</span>
                Period: {editingKRA.period}
                <span className="mx-2">•</span>
                Batch: {editingKRA.batchId?.slice(0, 12)}...
                <span className="mx-2">•</span>
                {editingKRA.employees?.length || 0} employees
              </p>
              <p className="text-xs text-yellow-400 mt-1">
                ⚠️ Select an employee from the dropdown below to edit their metrics.
              </p>
            </div>
            <button
              onClick={handleCancelForm}
              className="cursor-pointer text-gray-300 p-1 rounded hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* EDIT MODE */}
          <KRAMatrics
            kraCategories={kraCategories}               // 🆕
            metrics={[]}
            handleAddMetric={() => {}}
            handleRemoveMetric={() => {}}
            handleMetricChange={() => {}}
            isCreatingKRA={updatingKRA}
            handleSaveKRA={handleUpdateKRA}
            handleCancelForm={handleCancelForm}
            buttonText={`Update ${selectedEmployeeForEdit || 'Employee'}`}
            showTitleDesc={true}
            editTitle={editTitle}
            setEditTitle={setEditTitle}
            editDescription={editDescription}
            setEditDescription={setEditDescription}
            disabledButton={!selectedEmployeeForEdit}
            selectedEmployee={[]}
            getEmployeeName={() => ''}
            getEmployeeWeightage={() => 0}
            toggleEmployeeAssignment={() => {}}
            openEmployeeSelector={() => {}}
            closeEmployeeSelector={() => {}}
            currentMetricIndex={null}
            showEmployeeSelector={false}
            validationErrors={validationErrors}
            autoDistributeWeightage={() => {}}
            getWeightageSuggestion={() => []}
            isEditMode={true}
            selectedEmployeeForEdit={selectedEmployeeForEdit}
            setSelectedEmployeeForEdit={setSelectedEmployeeForEdit}
            employeeMetrics={employeeMetrics}
            setEmployeeMetrics={setEmployeeMetrics}
            handleEmployeeSelect={handleEmployeeSelect}
            handleAddEmployeeMetric={handleAddEmployeeMetric}
            handleRemoveEmployeeMetric={handleRemoveEmployeeMetric}
            handleEmployeeMetricChange={handleEmployeeMetricChange}
            getEmployeeWeightageForEdit={getEmployeeWeightageForEdit}
            batchEmployeesList={batchEmployeesList}
            originalKraId={originalKraId}
            // 🆕 Category modal props
            showCategoryModal={showCategoryModal}
            openCategoryModal={openCategoryModal}
            closeCategoryModal={closeCategoryModal}
            newCategoryName={newCategoryName}
            setNewCategoryName={setNewCategoryName}
            newCategoryDescription={newCategoryDescription}
            setNewCategoryDescription={setNewCategoryDescription}
            newCategoryDisplayOrder={newCategoryDisplayOrder}
            setNewCategoryDisplayOrder={setNewCategoryDisplayOrder}
            handleAddCategory={handleAddCategory}
            addingCategory={addingCategory}
          />
        </div>
      )}

      {/* -------------- Existing KRAs List -------------- */}
      <div className="mt-6">
        <KRAMatricsContainer 
          kraList={kraList}
          loading={loading}
          error={error}
          deletingKRA={deletingKRA}
          handleDeleteKRA={handleDeleteKRA}
          handleEditKRA={handleOpenEditForm}
        />
      </div>
    </div>
  );
}

export default KRAManagement;