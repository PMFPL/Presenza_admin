import React from 'react';
import { Plus, X, Loader } from 'lucide-react';

const KRAMatrics = ({
  kraCategories,
  metrics,
  handleAddMetric,
  handleRemoveMetric,
  handleMetricChange,
  isCreatingKRA,
  handleSaveKRA,
  handleCancelForm,
  buttonText = 'Create KRA',
  showTitleDesc = false,
  editTitle = '',
  setEditTitle = () => {},
  editDescription = '',
  setEditDescription = () => {},
  disabledButton = false,
  selectedEmployee = [],
  getEmployeeName = () => '',
  getEmployeeWeightage = () => 0,
  toggleEmployeeAssignment = () => {},
  openEmployeeSelector = () => {},
  closeEmployeeSelector = () => {},
  currentMetricIndex = null,
  showEmployeeSelector = false,
  validationErrors = {},
  autoDistributeWeightage = () => {},
  getWeightageSuggestion = () => [],
  // Edit mode props
  isEditMode = false,
  selectedEmployeeForEdit = null,
  setSelectedEmployeeForEdit = () => {},
  employeeMetrics = [],
  setEmployeeMetrics = () => {},
  handleEmployeeSelect = () => {},
  handleAddEmployeeMetric = () => {},
  handleRemoveEmployeeMetric = () => {},
  handleEmployeeMetricChange = () => {},
  getEmployeeWeightageForEdit = () => 0,
  batchEmployeesList = [],
  originalKraId = null,

  // 🆕 Category modal props
  showCategoryModal = false,
  openCategoryModal = () => {},
  closeCategoryModal = () => {},
  newCategoryName = '',
  setNewCategoryName = () => {},
  newCategoryDescription = '',
  setNewCategoryDescription = () => {},
  newCategoryDisplayOrder = 1,
  setNewCategoryDisplayOrder = () => {},
  handleAddCategory = () => {},
  addingCategory = false,
}) => {
  
  // For edit mode
  if (isEditMode) {
    const totalWeightage = getEmployeeWeightageForEdit();
    const isWeightageComplete = totalWeightage === 100;

    return (
      <div className="mt-6">
        {/* Title and Description fields */}
        {showTitleDesc && (
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1">KRA Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter KRA title"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1">Description (Optional)</label>
              <input
                type="text"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Enter description"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>
        )}

        {/* Employee Selection Dropdown */}
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1">Select Employee to Edit</label>
          <select
            value={selectedEmployeeForEdit || ''}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedEmployeeForEdit(value);
              if (value) {
                handleEmployeeSelect(value);
              }
            }}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="" className="bg-gray-800">Select an employee</option>
            {batchEmployeesList.map((empName, index) => (
              <option key={index} value={empName} className="bg-gray-800">
                {empName}
              </option>
            ))}
          </select>
          {selectedEmployeeForEdit && (
            <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
              ✓ Editing: {selectedEmployeeForEdit}
              {originalKraId && <span className="text-gray-400 ml-2">(KRA ID: {originalKraId.slice(0, 8)}...)</span>}
            </p>
          )}
        </div>

        {/* Employee Metrics */}
        {selectedEmployeeForEdit && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-white">
                Metrics for {selectedEmployeeForEdit}
              </h4>
              <button
                onClick={handleAddEmployeeMetric}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors text-sm"
              >
                <Plus className="h-4 w-4" />
                Add Metric
              </button>
            </div>

            <div className="space-y-4">
              {employeeMetrics.map((metric, index) => {
                const hasError = validationErrors[`employee_metric_${index}_category`] || 
                                validationErrors[`employee_metric_${index}_name`] ||
                                validationErrors[`employee_metric_${index}_target`] ||
                                validationErrors[`employee_metric_${index}_weightage`];

                return (
                  <div key={metric.id || index} className={`bg-white/5 rounded-lg p-4 border ${hasError ? 'border-red-500/50' : 'border-white/10'}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                        {/* Category */}
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Category</label>
                          <select
                            value={metric.category || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '__others__') {
                                openCategoryModal();
                              } else {
                                handleEmployeeMetricChange(index, 'category', value);
                              }
                            }}
                            className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                              validationErrors[`employee_metric_${index}_category`] 
                                ? 'border-red-500' 
                                : 'border-white/20'
                            }`}
                          >
                            <option value="" className="bg-gray-800">Select Category</option>
                            {kraCategories.map(cat => (
                              <option key={cat._id} value={cat.categoryName} className="bg-gray-800">
                                {cat.categoryName}
                              </option>
                            ))}
                            <option value="__others__" className="bg-gray-800">➕ Others</option>
                          </select>
                          {validationErrors[`employee_metric_${index}_category`] && (
                            <p className="text-xs text-red-400 mt-1">{validationErrors[`employee_metric_${index}_category`]}</p>
                          )}
                        </div>

                        {/* Name */}
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Metric Name</label>
                          <input
                            type="text"
                            value={metric.name || ''}
                            onChange={(e) => handleEmployeeMetricChange(index, 'name', e.target.value)}
                            placeholder="Enter metric name"
                            className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                              validationErrors[`employee_metric_${index}_name`] 
                                ? 'border-red-500' 
                                : 'border-white/20'
                            }`}
                          />
                          {validationErrors[`employee_metric_${index}_name`] && (
                            <p className="text-xs text-red-400 mt-1">{validationErrors[`employee_metric_${index}_name`]}</p>
                          )}
                        </div>

                        {/* Target */}
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Target</label>
                          <input
                            type="number"
                            value={metric.target || ''}
                            onChange={(e) => handleEmployeeMetricChange(index, 'target', e.target.value)}
                            placeholder="0"
                            className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                              validationErrors[`employee_metric_${index}_target`] 
                                ? 'border-red-500' 
                                : 'border-white/20'
                            }`}
                          />
                          {validationErrors[`employee_metric_${index}_target`] && (
                            <p className="text-xs text-red-400 mt-1">{validationErrors[`employee_metric_${index}_target`]}</p>
                          )}
                        </div>

                        {/* Weightage */}
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Weightage (%)</label>
                          <input
                            type="number"
                            value={metric.weightage || ''}
                            onChange={(e) => handleEmployeeMetricChange(index, 'weightage', e.target.value)}
                            placeholder="0"
                            className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                              validationErrors[`employee_metric_${index}_weightage`] 
                                ? 'border-red-500' 
                                : 'border-white/20'
                            }`}
                          />
                          {validationErrors[`employee_metric_${index}_weightage`] && (
                            <p className="text-xs text-red-400 mt-1">{validationErrors[`employee_metric_${index}_weightage`]}</p>
                          )}
                        </div>
                      </div>

                      {/* Remove Button */}
                      {employeeMetrics.length > 1 && (
                        <button
                          onClick={() => handleRemoveEmployeeMetric(index)}
                          className="mt-6 p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Weightage */}
            <div className="mt-4 flex justify-end">
              <span className={`text-sm font-semibold ${
                isWeightageComplete ? 'text-green-400' : 'text-red-400'
              }`}>
                Total Weightage: {totalWeightage}%
                {!isWeightageComplete && ' (Must be 100%)'}
              </span>
            </div>

            {validationErrors['employee_total_weightage'] && (
              <p className="text-xs text-red-400 mt-1">{validationErrors['employee_total_weightage']}</p>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
          <button
            onClick={handleCancelForm}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveKRA}
            disabled={isCreatingKRA || disabledButton || !selectedEmployeeForEdit || !isWeightageComplete}
            className={`flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg transition-colors ${
              (isCreatingKRA || disabledButton || !selectedEmployeeForEdit || !isWeightageComplete) 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:from-purple-600 hover:to-pink-600'
            }`}
          >
            {isCreatingKRA ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              buttonText
            )}
          </button>
        </div>

        {/* 🆕 Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-[#032446] rounded-xl p-6 w-full max-w-md border border-white/20 shadow-xl">
              <h4 className="text-lg font-semibold text-white mb-4">Add New Category</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Category Name *</label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                    placeholder="e.g. Quality"
                  />
                </div>
                {/* <div>
                  <label className="block text-sm text-gray-300 mb-1">Description</label>
                  <input
                    type="text"
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                    placeholder="Description (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={newCategoryDisplayOrder}
                    onChange={(e) => setNewCategoryDisplayOrder(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                    min="1"
                  />
                </div> */}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={closeCategoryModal}
                  className="px-4 py-2 text-gray-300 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  disabled={addingCategory}
                  className="px-4 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff6b35]/80 disabled:opacity-50 transition-colors"
                >
                  {addingCategory ? 'Adding...' : 'Add Category'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Create mode rendering
  return (
    <div className="mt-6">
      {/* Title and Description fields */}
      {showTitleDesc && (
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">KRA Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Enter KRA title"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">Description (Optional)</label>
            <input
              type="text"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Enter description"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
        </div>
      )}

      {/* Employee Weightage Summary */}
      {selectedEmployee.length > 0 && (
        <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400">Employee Weightage Summary:</p>
            {metrics.length > 0 && (
              <button
                onClick={autoDistributeWeightage}
                className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded text-xs transition-colors"
              >
                <span className="inline-block rotate-45">✦</span>
                Auto-Distribute
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedEmployee.map(empId => {
              const weightage = getEmployeeWeightage(empId);
              const status = weightage === 100 ? 'complete' : weightage === 0 ? 'none' : 'partial';
              return (
                <span 
                  key={empId}
                  className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${
                    status === 'complete' 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : status === 'none'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  }`}
                >
                  {status === 'complete' ? '✅' : '⚠️'}
                  {getEmployeeName(empId)}: {weightage}%
                </span>
              );
            })}
          </div>
          {selectedEmployee.some(empId => getEmployeeWeightage(empId) !== 100) && (
            <div className="mt-2">
              <p className="text-xs text-yellow-400">
                ⚠️ All employees must have exactly 100% weightage
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h4 className="text-md font-medium text-white">KRA Metrics</h4>
        <button
          onClick={handleAddMetric}
          disabled={selectedEmployee.length === 0}
          className={`flex items-center gap-1 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors text-sm ${
            selectedEmployee.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Plus className="h-4 w-4" />
          Add Metric
        </button>
      </div>

      {selectedEmployee.length === 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-yellow-300 text-sm mb-4">
          Please select at least one employee before adding metrics.
        </div>
      )}

      <div className="space-y-4">
        {metrics.map((metric, index) => {
          const hasError = validationErrors[`metric_${index}_category`] || 
                          validationErrors[`metric_${index}_name`] ||
                          validationErrors[`metric_${index}_target`] ||
                          validationErrors[`metric_${index}_weightage`] ||
                          validationErrors[`metric_${index}_assignedEmployees`];
          
          return (
            <div key={metric.id || index} className={`bg-white/5 rounded-lg p-4 border ${hasError ? 'border-red-500/50' : 'border-white/10'}`}>
              <div className="flex items-start gap-3">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Category */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Category</label>
                    <select
                      value={metric.category}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '__others__') {
                          openCategoryModal();
                        } else {
                          handleMetricChange(index, 'category', value);
                        }
                      }}
                      className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                        validationErrors[`metric_${index}_category`] 
                          ? 'border-red-500' 
                          : 'border-white/20'
                      }`}
                    >
                      <option value="" className="bg-gray-800">Select Category</option>
                      {kraCategories.map(cat => (
                        <option key={cat._id} value={cat.categoryName} className="bg-gray-800">
                          {cat.categoryName}
                        </option>
                      ))}
                      <option value="__others__" className="bg-gray-800">➕ Others</option>
                    </select>
                    {validationErrors[`metric_${index}_category`] && (
                      <p className="text-xs text-red-400 mt-1">{validationErrors[`metric_${index}_category`]}</p>
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Metric Name</label>
                    <input
                      type="text"
                      value={metric.name}
                      onChange={(e) => handleMetricChange(index, 'name', e.target.value)}
                      placeholder="Enter metric name"
                      className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                        validationErrors[`metric_${index}_name`] 
                          ? 'border-red-500' 
                          : 'border-white/20'
                      }`}
                    />
                    {validationErrors[`metric_${index}_name`] && (
                      <p className="text-xs text-red-400 mt-1">{validationErrors[`metric_${index}_name`]}</p>
                    )}
                  </div>

                  {/* Target */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Target</label>
                    <input
                      type="number"
                      value={metric.target}
                      onChange={(e) => handleMetricChange(index, 'target', e.target.value)}
                      placeholder="0"
                      className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                        validationErrors[`metric_${index}_target`] 
                          ? 'border-red-500' 
                          : 'border-white/20'
                      }`}
                    />
                    {validationErrors[`metric_${index}_target`] && (
                      <p className="text-xs text-red-400 mt-1">{validationErrors[`metric_${index}_target`]}</p>
                    )}
                  </div>

                  {/* Weightage */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Weightage (%)</label>
                    <input
                      type="number"
                      value={metric.weightage}
                      onChange={(e) => handleMetricChange(index, 'weightage', e.target.value)}
                      placeholder="0"
                      className={`w-full bg-white/10 border rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                        validationErrors[`metric_${index}_weightage`] 
                          ? 'border-red-500' 
                          : 'border-white/20'
                      }`}
                    />
                    {validationErrors[`metric_${index}_weightage`] && (
                      <p className="text-xs text-red-400 mt-1">{validationErrors[`metric_${index}_weightage`]}</p>
                    )}
                  </div>
                </div>

                {/* Remove Button */}
                {metrics.length > 1 && (
                  <button
                    onClick={() => handleRemoveMetric(index)}
                    className="mt-6 p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Employee Assignment Section */}
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400">Assign to Employees:</label>
                  <button
                    onClick={() => openEmployeeSelector(index)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                      validationErrors[`metric_${index}_assignedEmployees`]
                        ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                        : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                    }`}
                  >
                    <span className="inline-block">👥</span>
                    {metric.assignedEmployees?.length || 0} assigned
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-1 mt-1">
                  {metric.assignedEmployees && metric.assignedEmployees.length > 0 ? (
                    metric.assignedEmployees.map(empId => {
                      const empWeightage = getEmployeeWeightage(empId);
                      return (
                        <span key={empId} className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded">
                          {getEmployeeName(empId)} ({empWeightage}%)
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs text-red-400">No employees assigned</span>
                  )}
                  {validationErrors[`metric_${index}_assignedEmployees`] && (
                    <p className="text-xs text-red-400 w-full mt-1">
                      {validationErrors[`metric_${index}_assignedEmployees`]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Employee Selector Modal */}
      {showEmployeeSelector && currentMetricIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Assign Employees for Metric: {metrics[currentMetricIndex]?.name || 'Metric'}
              </h3>
              <button
                onClick={closeEmployeeSelector}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              {selectedEmployee.map(empId => {
                const isChecked = metrics[currentMetricIndex]?.assignedEmployees?.includes(empId) || false;
                const empWeightage = getEmployeeWeightage(empId);
                return (
                  <label
                    key={empId}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isChecked ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleEmployeeAssignment(currentMetricIndex, empId)}
                      className="w-4 h-4 text-blue-500 rounded"
                    />
                    <span className="text-white flex-1">{getEmployeeName(empId)}</span>
                    <span className={`text-xs ${
                      empWeightage === 100 ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {empWeightage}%
                    </span>
                  </label>
                );
              })}
            </div>
            
            <div className="flex justify-end mt-4 pt-4 border-t border-white/10">
              <button
                onClick={closeEmployeeSelector}
                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
        <button
          onClick={handleCancelForm}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveKRA}
          disabled={isCreatingKRA || disabledButton || selectedEmployee.length === 0}
          className={`flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg transition-colors ${
            (isCreatingKRA || disabledButton || selectedEmployee.length === 0) 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:from-purple-600 hover:to-pink-600'
          }`}
        >
          {isCreatingKRA ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            buttonText
          )}
        </button>
      </div>

      {/* 🆕 Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#032446] rounded-xl p-6 w-full max-w-md border border-white/20 shadow-xl">
            <h4 className="text-lg font-semibold text-white mb-4">Add New Category</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                  placeholder="e.g. Quality"
                />
              </div>
              {/* <div>
                <label className="block text-sm text-gray-300 mb-1">Description</label>
                <input
                  type="text"
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                  placeholder="Description (optional)"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Display Order</label>
                <input
                  type="number"
                  value={newCategoryDisplayOrder}
                  onChange={(e) => setNewCategoryDisplayOrder(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white"
                  min="1"
                />
              </div> */}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeCategoryModal}
                className="px-4 py-2 text-gray-300 hover:bg-white/10 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                disabled={addingCategory}
                className="px-4 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff6b35]/80 disabled:opacity-50 transition-colors"
              >
                {addingCategory ? 'Adding...' : 'Add Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KRAMatrics;