import React, { useState } from 'react';
import { Edit, Trash2, Users, User, Clock, Loader, Target, RefreshCw, ChevronDown, ChevronRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const KRAMatricsContainer = ({ 
  kraList, 
  loading, 
  error, 
  deletingKRA, 
  handleDeleteKRA,
  handleEditKRA 
}) => {

  const [expandedBatch, setExpandedBatch] = useState(null);

  console.log('KRA List:', kraList);  
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="h-8 w-8 animate-spin text-purple-400" />
        <span className="ml-2 text-gray-300">Loading KRAs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-6 text-center">
        <p className="text-red-300">{error}</p>
      </div>
    );
  }

  const kraData = kraList || [];
  
  if (!kraData || kraData.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-12 text-center">
        <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white">No KRAs Found</h3>
        <p className="text-gray-400 mt-2">Create a new KRA to get started</p>
      </div>
    );
  }

  // Group KRAs by batchId
  const groupedKRAs = kraData.reduce((acc, kra) => {
    if (kra.batchId) {
      if (!acc[kra.batchId]) {
        acc[kra.batchId] = [];
      }
      acc[kra.batchId].push(kra);
    }
    return acc;
  }, {});

  // Toggle batch expansion
  const toggleBatch = (batchId) => {
    if (expandedBatch === batchId) {
      setExpandedBatch(null);
    } else {
      setExpandedBatch(batchId);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'in-progress':
      case 'active':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'pending':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'in-progress':
      case 'active':
        return <AlertCircle className="h-3 w-3" />;
      case 'pending':
        return <Clock className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

// Render employee metrics for a KRA
const renderEmployeeMetrics = (kra) => {
  const employeeNames = kra.employees || [];
  const employeeCount = employeeNames.length;
  const isBatch = employeeCount > 1;

  // Check if we have employee-specific metrics
  const hasEmployeeMetrics = kra.employeeMetrics && Object.keys(kra.employeeMetrics).length > 0;

  // If we have employee-specific metrics, show them (works for both single and multiple employees)
  if (hasEmployeeMetrics) {
    return (
      <div className="mt-4 space-y-4">
        <p className="text-xs text-gray-400 font-medium mb-2">
          {isBatch ? 'EMPLOYEE-WISE METRICS' : 'METRICS'}
        </p>
        {Object.entries(kra.employeeMetrics).map(([empName, empData]) => {
          const metrics = empData.metrics || [];
          const totalWeightage = metrics.reduce((sum, m) => sum + (parseFloat(m.weightage) || 0), 0);
          const totalScore = metrics.reduce((sum, m) => sum + (parseFloat(m.score) || 0), 0);
          const avgScore = metrics.length > 0 ? Math.round(totalScore / metrics.length) : 0;
          
          // Calculate overall status for this employee
          const allCompleted = metrics.every(m => m.status === 'completed');
          const anyInProgress = metrics.some(m => m.status === 'in-progress' || m.status === 'active');
          const overallStatus = allCompleted ? 'completed' : anyInProgress ? 'in-progress' : 'pending';
          
          return (
            <div key={empName} className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
              {/* Employee Header - only show if batch */}
              {isBatch && (
                <div className="flex items-center justify-between p-3 bg-white/10 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-white">{empName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${getStatusColor(overallStatus)}`}>
                      {getStatusIcon(overallStatus)}
                      {overallStatus}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      totalWeightage === 100 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {totalWeightage === 100 ? '✓ 100%' : `${totalWeightage}%`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{metrics.length} metrics</span>
                    <span className="text-xs font-medium text-purple-300">Score: {avgScore}%</span>
                  </div>
                </div>
              )}

              {/* Metrics Grid */}
              <div className="p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {metrics.map((metric, idx) => {
                    const progress = metric.target > 0 ? Math.min((metric.achieved || 0) / metric.target * 100, 100) : 0;
                    const metricStatus = metric.status || 'pending';
                    const isCompleted = progress >= 100 || metricStatus === 'completed';
                    
                    return (
                      <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/5">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-white font-medium">{metric.name}</p>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${getStatusColor(metricStatus)}`}>
                                {metricStatus}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Category: {metric.category}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold text-purple-300">{metric.weightage}%</span>
                            <div className="text-xs text-gray-400">
                              Score: {Math.round(metric.score || 0)}%
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">Achieved: {metric.achieved || 0} / {metric.target}</span>
                          <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                          <div 
                            className={`rounded-full h-1.5 transition-all ${
                              isCompleted ? 'bg-green-400' : 'bg-purple-400'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Total Weightage and Score */}
                <div className="mt-3 flex justify-between items-center">
                  <span className={`text-xs ${
                    totalWeightage === 100 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    Total Weightage: {totalWeightage}%
                    {totalWeightage !== 100 && ' (Must be 100%)'}
                  </span>
                  <span className="text-xs text-purple-300">
                    {isBatch ? 'Average Score' : 'Overall Score'}: {avgScore}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Fallback: Show common metrics (for older data without employeeMetrics)
  if (kra.metrics && kra.metrics.length > 0) {
    const totalWeightage = kra.metrics.reduce((sum, m) => sum + (parseFloat(m.weightage) || 0), 0);
    const totalScore = kra.totalScore || kra.metrics.reduce((sum, m) => sum + (parseFloat(m.score) || 0), 0);
    const avgScore = kra.metrics.length > 0 ? Math.round(totalScore / kra.metrics.length) : 0;
    
    return (
      <div className="mt-4 space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-400 font-medium">METRICS</p>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(kra.status || 'pending')}`}>
              {kra.status || 'pending'}
            </span>
            <span className="text-xs text-purple-300">Total Score: {Math.round(kra.totalScore || 0)}%</span>
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {kra.metrics.map((metric, idx) => {
              const progress = metric.target > 0 ? Math.min((metric.achieved || 0) / metric.target * 100, 100) : 0;
              const metricStatus = metric.status || 'pending';
              const isCompleted = progress >= 100 || metricStatus === 'completed';
              
              return (
                <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-white font-medium">{metric.name}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${getStatusColor(metricStatus)}`}>
                          {metricStatus}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Category: {metric.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-purple-300">{metric.weightage}%</span>
                      <div className="text-xs text-gray-400">
                        Score: {Math.round(metric.score || 0)}%
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">Achieved: {metric.achieved || 0} / {metric.target}</span>
                    <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                    <div 
                      className={`rounded-full h-1.5 transition-all ${
                        isCompleted ? 'bg-green-400' : 'bg-purple-400'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex justify-between items-center">
            <span className={`text-xs ${
              totalWeightage === 100 ? 'text-green-400' : 'text-red-400'
            }`}>
              Total Weightage: {totalWeightage}%
              {totalWeightage !== 100 && ' (Must be 100%)'}
            </span>
            <span className="text-xs text-purple-300">
              Overall Score: {Math.round(kra.totalScore || 0)}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

  // Render KRA card
  const renderKRACard = (kra) => {
    const employeeNames = kra.employees?.join(', ') || 'Unknown Employee';
    const employeeCount = kra.employees?.length || 1;
    const isBatch = employeeCount > 1;
    const hasEmployeeMetrics = kra.employeeMetrics && Object.keys(kra.employeeMetrics).length > 0;
    
    const createdDate = kra.createdOn ? new Date(kra.createdOn) : new Date();
    const formattedDate = createdDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const isExpanded = expandedBatch === kra.batchId;
    const status = kra.status || 'pending';
    const totalScore = Math.round(kra.totalScore || 0);

    return (
      <div key={kra.id || kra.batchId} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:shadow-xl transition-all">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-lg font-semibold text-white">
                {kra.title || 'KRA'}
              </h4>
              <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${getStatusColor(status)}`}>
                {getStatusIcon(status)}
                {status}
              </span>
              {isBatch && (
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  Batch
                </span>
              )}
              {hasEmployeeMetrics && isBatch && (
                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  Custom per Employee
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-300 flex-wrap">
              <span className="flex items-center gap-1">
                {isBatch ? (
                  <Users className="h-4 w-4 text-blue-400" />
                ) : (
                  <User className="h-4 w-4 text-gray-400" />
                )}
                {isBatch ? `${employeeCount} employees` : employeeNames}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">{kra.department || 'No Department'}</span>
              <span className="text-gray-400">•</span>
              <span className="capitalize text-gray-400">{kra.period || 'N/A'}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400 text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formattedDate}
              </span>
            </div>
            {isBatch && kra.employees && kra.employees.length > 0 && (
              <div className="mt-1 text-xs text-gray-400">
                Employees: {kra.employees.join(', ')}
              </div>
            )}
            {kra.description && (
              <p className="mt-2 text-sm text-gray-400">{kra.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-right mr-2">
              <span className="text-sm font-semibold text-purple-300">{totalScore}%</span>
              <p className="text-xs text-gray-400">Score</p>
            </div>
            <button
              onClick={() => toggleBatch(kra.batchId)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </button>
            <span className="px-3 py-1 bg-purple-400/20 text-purple-300 rounded-full text-xs font-medium">
              {kra.metrics?.length || 0} Metrics
            </span>
            {isBatch && (
              <span className="px-3 py-1 bg-green-400/20 text-green-300 rounded-full text-xs font-medium flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Edit
              </span>
            )}
          </div>
        </div>

        {/* Metrics Display - Always visible, but expandable for batch */}
        {isExpanded || !isBatch ? (
          renderEmployeeMetrics(kra)
        ) : (
          <div className="mt-4 text-center">
            <button
              onClick={() => toggleBatch(kra.batchId)}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Click to expand and view employee-wise metrics
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-white/10">
          <button
            onClick={() => handleEditKRA(kra)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors text-sm"
            disabled={deletingKRA}
          >
            <Edit className="h-4 w-4" />
            Edit
          </button>
          <button
            onClick={() => handleDeleteKRA(kra)}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors text-sm"
            disabled={deletingKRA}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {Object.keys(groupedKRAs).map(batchId => {
        const batchKRAs = groupedKRAs[batchId];
        console.log(`Rendering batch ${batchId} with ${batchKRAs.length} KRAs`);
        if (!batchKRAs || batchKRAs.length === 0) return null;
        
        const firstKRA = batchKRAs[0];
        const departmentName = firstKRA.department || 'Unknown Department';
        const period = firstKRA.period || 'N/A';
        const totalEmployees = firstKRA.employees?.length || 0;
        const isExpanded = expandedBatch === batchId;
        
        return (
          <div key={batchId} className="space-y-3">
            {/* Batch Header */}
            <div 
              className="flex items-center gap-3 bg-white/5 rounded-lg p-3 flex-wrap cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => toggleBatch(batchId)}
            >
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-blue-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-blue-400" />
              )}
              <Users className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">
                Batch: {batchId.slice(0, 12)}...
              </h3>
              <span className="text-sm text-gray-400">{departmentName}</span>
              <span className="text-sm text-gray-400">•</span>
              <span className="text-sm text-gray-400 capitalize">{period}</span>
              <span className="text-sm text-gray-400">•</span>
              <span className="text-sm text-gray-400">{totalEmployees} employees</span>
              <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded ml-2">
                <RefreshCw className="inline h-3 w-3 mr-1" />
                {isExpanded ? 'Collapse' : 'Expand'}
              </span>
            </div>
            
            {/* Batch KRAs */}
            {isExpanded && (
              <div className="grid grid-cols-1 gap-4">
                {batchKRAs.map(kra => renderKRACard(kra))}
              </div>
            )}
            
            {/* Collapsed view - show summary */}
            {!isExpanded && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">
                      {batchKRAs.length} KRA entries
                    </span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-400">
                      {batchKRAs.reduce((sum, k) => sum + (k.metrics?.length || 0), 0)} total metrics
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">
                      Avg Score: {Math.round(batchKRAs.reduce((sum, k) => sum + (k.totalScore || 0), 0) / batchKRAs.length)}%
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBatch(batchId);
                      }}
                      className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};