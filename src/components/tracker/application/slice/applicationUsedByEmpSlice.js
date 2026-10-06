import { createAsyncThunk, createSlice, createSelector } from "@reduxjs/toolkit";
import { getRequest } from "../../../../services/api/APIMethodCaller";

// Existing thunks
export const fetchApplicationListUsedByEmp = createAsyncThunk(
  "application/fetchApplicationList",
  async ({ employeeId, date }, { rejectWithValue, signal }) => {
    try {
      const url = date
        ? `/activities/top?employeeId=${employeeId}&date=${date}`
        : `/activities/top?employeeId=${employeeId}`;

      const response = await getRequest(url, { signal });

      if (response?.success) {
        return response.data || [];
      }
      return rejectWithValue(response?.error || "Failed to fetch applications");
    } catch (err) {
      if (err?.name === "AbortError" || err?.name === "CanceledError") {
        return rejectWithValue(null);
      }
      return rejectWithValue(
        err?.response?.data?.message ||
        err?.message ||
        "An unexpected error occurred"
      );
    }
  }
);

export const fetchEmployeeStats = createAsyncThunk(
  "application/fetchEmployeeStats",
  async ({ employeeId, date }, { rejectWithValue, signal }) => {
    try {
      const url = date
        ? `/activities/stats?employeeId=${employeeId}&date=${date}`
        : `/activities/stats?employeeId=${employeeId}`;

      const response = await getRequest(url, { signal });

      if (response?.success) {
        return response.data || {};
      }
      return rejectWithValue(response?.error || "Failed to fetch statistics");
    } catch (err) {
      if (err?.name === "AbortError" || err?.name === "CanceledError") {
        return rejectWithValue(null);
      }
      return rejectWithValue(
        err?.response?.data?.message ||
        err?.message ||
        "An unexpected error occurred"
      );
    }
  }
);

// NEW: Fetch all apps list with summary
export const fetchAppsList = createAsyncThunk(
  "application/fetchAppsList",
  async ({ employeeId, startDate, endDate }, { rejectWithValue, signal }) => {
    try {
      let url = `/activities/apps?employeeId=${employeeId}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const response = await getRequest(url, { signal });

      if (response?.success) {
        return response.data || [];
      }
      return rejectWithValue(response?.error || "Failed to fetch apps list");
    } catch (err) {
      if (err?.name === "AbortError" || err?.name === "CanceledError") {
        return rejectWithValue(null);
      }
      return rejectWithValue(
        err?.response?.data?.message ||
        err?.message ||
        "An unexpected error occurred"
      );
    }
  }
);

// NEW: Fetch app history with filters
export const fetchAppHistory = createAsyncThunk(
  "application/fetchAppHistory",
  async ({ 
    employeeId, 
    app, 
    startDate, 
    endDate, 
    sortBy = 'timestamp', 
    sortOrder = 'desc',
    page = 1,
    limit = 50,
    search = ''
  }, { rejectWithValue, signal }) => {
    try {
      let url = `/activities/app-history?employeeId=${employeeId}&app=${encodeURIComponent(app)}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      if (sortBy) url += `&sortBy=${sortBy}`;
      if (sortOrder) url += `&sortOrder=${sortOrder}`;
      if (page) url += `&page=${page}`;
      if (limit) url += `&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const response = await getRequest(url, { signal });

      if (response?.success) {
        return response.data || { data: [], pagination: {} };
      }
      return rejectWithValue(response?.error || "Failed to fetch app history");
    } catch (err) {
      if (err?.name === "AbortError" || err?.name === "CanceledError") {
        return rejectWithValue(null);
      }
      return rejectWithValue(
        err?.response?.data?.message ||
        err?.message ||
        "An unexpected error occurred"
      );
    }
  }
);

// NEW: Search across all activities
export const searchActivities = createAsyncThunk(
  "application/searchActivities",
  async ({ 
    employeeId, 
    search, 
    app,
    startDate, 
    endDate, 
    sortBy = 'timestamp', 
    sortOrder = 'desc',
    page = 1,
    limit = 50
  }, { rejectWithValue, signal }) => {
    try {
      let url = `/activities/search-history?employeeId=${employeeId}&search=${encodeURIComponent(search)}`;
      if (app) url += `&app=${encodeURIComponent(app)}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      if (sortBy) url += `&sortBy=${sortBy}`;
      if (sortOrder) url += `&sortOrder=${sortOrder}`;
      if (page) url += `&page=${page}`;
      if (limit) url += `&limit=${limit}`;

      const response = await getRequest(url, { signal });

      if (response?.success) {
        return response.data || { data: [], pagination: {} };
      }
      return rejectWithValue(response?.error || "Failed to search activities");
    } catch (err) {
      if (err?.name === "AbortError" || err?.name === "CanceledError") {
        return rejectWithValue(null);
      }
      return rejectWithValue(
        err?.response?.data?.message ||
        err?.message ||
        "An unexpected error occurred"
      );
    }
  }
);

// NEW: Fetch activities by date range
export const fetchActivitiesByDateRange = createAsyncThunk(
  "application/fetchActivitiesByDateRange",
  async ({ 
    employeeId, 
    startDate, 
    endDate, 
    app,
    sortBy = 'timestamp', 
    sortOrder = 'desc',
    page = 1,
    limit = 50,
    search = ''
  }, { rejectWithValue, signal }) => {
    try {
      let url = `/activities/date-range?employeeId=${employeeId}&startDate=${startDate}&endDate=${endDate}`;
      if (app) url += `&app=${encodeURIComponent(app)}`;
      if (sortBy) url += `&sortBy=${sortBy}`;
      if (sortOrder) url += `&sortOrder=${sortOrder}`;
      if (page) url += `&page=${page}`;
      if (limit) url += `&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const response = await getRequest(url, { signal });

      if (response?.success) {
        return response.data || { data: [], pagination: {}, summary: {} };
      }
      return rejectWithValue(response?.error || "Failed to fetch activities by date range");
    } catch (err) {
      if (err?.name === "AbortError" || err?.name === "CanceledError") {
        return rejectWithValue(null);
      }
      return rejectWithValue(
        err?.response?.data?.message ||
        err?.message ||
        "An unexpected error occurred"
      );
    }
  }
);

const initialState = {
  appDetails: [],
  stats: null,
  loading: false,
  statsLoading: false,
  error: null,
  statsError: null,
  lastFetch: null,
  lastListRequestId: null,
  lastStatsRequestId: null,
  
  // New state for enhanced features
  appsList: [],
  appsListLoading: false,
  appsListError: null,
  
  appHistory: { data: [], pagination: {} },
  appHistoryLoading: false,
  appHistoryError: null,
  
  searchResults: { data: [], pagination: {} },
  searchLoading: false,
  searchError: null,
  
  dateRangeResults: { data: [], pagination: {}, summary: {} },
  dateRangeLoading: false,
  dateRangeError: null,
};

const applicationSlice = createSlice({
  name: "application",
  initialState,
  reducers: {
    clearStats: (state) => {
      state.stats = null;
      state.statsError = null;
      state.statsLoading = false;
      state.lastStatsRequestId = null;
    },
    clearAppDetails: (state) => {
      state.appDetails = [];
      state.error = null;
      state.loading = false;
      state.lastListRequestId = null;
    },
    clearAppsList: (state) => {
      state.appsList = [];
      state.appsListError = null;
      state.appsListLoading = false;
    },
    clearAppHistory: (state) => {
      state.appHistory = { data: [], pagination: {} };
      state.appHistoryError = null;
      state.appHistoryLoading = false;
    },
    clearSearchResults: (state) => {
      state.searchResults = { data: [], pagination: {} };
      state.searchError = null;
      state.searchLoading = false;
    },
    clearDateRangeResults: (state) => {
      state.dateRangeResults = { data: [], pagination: {}, summary: {} };
      state.dateRangeError = null;
      state.dateRangeLoading = false;
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Application List (existing)
      .addCase(fetchApplicationListUsedByEmp.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.lastListRequestId = action.meta.requestId;
      })
      .addCase(fetchApplicationListUsedByEmp.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.lastListRequestId) return;
        state.loading = false;
        state.appDetails = Array.isArray(action.payload) ? action.payload : [];
        state.lastFetch = Date.now();
      })
      .addCase(fetchApplicationListUsedByEmp.rejected, (state, action) => {
        if (action.meta.requestId !== state.lastListRequestId) return;
        state.loading = false;
        if (action.payload !== null) {
          state.error = action.payload || action.error?.message || "Failed to fetch applications";
        }
      })
      
      // Employee Stats (existing)
      .addCase(fetchEmployeeStats.pending, (state, action) => {
        state.statsLoading = true;
        state.statsError = null;
        state.lastStatsRequestId = action.meta.requestId;
      })
      .addCase(fetchEmployeeStats.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.lastStatsRequestId) return;
        state.statsLoading = false;
        state.stats = action.payload || {};
        state.lastFetch = Date.now();
      })
      .addCase(fetchEmployeeStats.rejected, (state, action) => {
        if (action.meta.requestId !== state.lastStatsRequestId) return;
        state.statsLoading = false;
        if (action.payload !== null) {
          state.statsError = action.payload || action.error?.message || "Failed to fetch statistics";
        }
      })

      // NEW: Apps List
      .addCase(fetchAppsList.pending, (state) => {
        state.appsListLoading = true;
        state.appsListError = null;
      })
      .addCase(fetchAppsList.fulfilled, (state, action) => {
        state.appsListLoading = false;
        state.appsList = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAppsList.rejected, (state, action) => {
        state.appsListLoading = false;
        if (action.payload !== null) {
          state.appsListError = action.payload || action.error?.message || "Failed to fetch apps list";
        }
      })

      // NEW: App History
      .addCase(fetchAppHistory.pending, (state) => {
        state.appHistoryLoading = true;
        state.appHistoryError = null;
      })
      .addCase(fetchAppHistory.fulfilled, (state, action) => {
        state.appHistoryLoading = false;
        state.appHistory = action.payload || { data: [], pagination: {} };
      })
      .addCase(fetchAppHistory.rejected, (state, action) => {
        state.appHistoryLoading = false;
        if (action.payload !== null) {
          state.appHistoryError = action.payload || action.error?.message || "Failed to fetch app history";
        }
      })

      // NEW: Search Activities
      .addCase(searchActivities.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchActivities.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload || { data: [], pagination: {} };
      })
      .addCase(searchActivities.rejected, (state, action) => {
        state.searchLoading = false;
        if (action.payload !== null) {
          state.searchError = action.payload || action.error?.message || "Failed to search activities";
        }
      })

      // NEW: Date Range
      .addCase(fetchActivitiesByDateRange.pending, (state) => {
        state.dateRangeLoading = true;
        state.dateRangeError = null;
      })
      .addCase(fetchActivitiesByDateRange.fulfilled, (state, action) => {
        state.dateRangeLoading = false;
        state.dateRangeResults = action.payload || { data: [], pagination: {}, summary: {} };
      })
      .addCase(fetchActivitiesByDateRange.rejected, (state, action) => {
        state.dateRangeLoading = false;
        if (action.payload !== null) {
          state.dateRangeError = action.payload || action.error?.message || "Failed to fetch date range data";
        }
      });
  },
});

export const { 
  clearStats, 
  clearAppDetails, 
  clearAppsList,
  clearAppHistory,
  clearSearchResults,
  clearDateRangeResults,
  resetState 
} = applicationSlice.actions;

// Base Selectors
export const selectAppDetails = (state) => state.application.appDetails;
export const selectAppLoading = (state) => state.application.loading;
export const selectAppError = (state) => state.application.error;
export const selectStats = (state) => state.application.stats;
export const selectStatsLoading = (state) => state.application.statsLoading;
export const selectStatsError = (state) => state.application.statsError;
export const selectLastFetch = (state) => state.application.lastFetch;

// NEW Selectors
export const selectAppsList = (state) => state.application.appsList;
export const selectAppsListLoading = (state) => state.application.appsListLoading;
export const selectAppsListError = (state) => state.application.appsListError;

export const selectAppHistory = (state) => state.application.appHistory;
export const selectAppHistoryLoading = (state) => state.application.appHistoryLoading;
export const selectAppHistoryError = (state) => state.application.appHistoryError;

export const selectSearchResults = (state) => state.application.searchResults;
export const selectSearchLoading = (state) => state.application.searchLoading;
export const selectSearchError = (state) => state.application.searchError;

export const selectDateRangeResults = (state) => state.application.dateRangeResults;
export const selectDateRangeLoading = (state) => state.application.dateRangeLoading;
export const selectDateRangeError = (state) => state.application.dateRangeError;

// Memoized Selectors
export const selectHasAppData = createSelector(
  [selectAppDetails],
  (appDetails) => Array.isArray(appDetails) && appDetails.length > 0
);

export const selectAppCount = createSelector(
  [selectAppDetails],
  (appDetails) => appDetails?.length || 0
);

export const selectTopApp = createSelector(
  [selectAppDetails],
  (appDetails) => (Array.isArray(appDetails) && appDetails.length > 0 ? appDetails[0] : null)
);

// Transform stats for UI consumption
export const selectEfficiency = createSelector(
  [selectStats],
  (stats) => {
    if (!stats) {
      return {
        totalActiveTime: 0,
        totalIdleTime: 0,
        mostUsedAppName: 'N/A',
        mostUsedTime: 0,
        totalTrackedTime: 0,
        productivity: { level: 'No Data', emoji: '📭', score: 0 },
        efficiency: { score: 'N/A', level: 'No Data' },
        activePercentage: 0,
        idlePercentage: 0,
        mostUsedAppPercentage: 0,
        appBreakdown: [],
        totalActivities: 0,
        idleCount: 0,
        activeFormatted: '0m',
        idleFormatted: '0m',
        totalFormatted: '0m',
        mostUsedFormatted: '0m',
        hasData: false
      };
    }

    const activeTime = stats.activeTime || {};
    const idleTime = stats.idleTime || {};
    const totalTime = stats.totalTime || {};
    const topApp = stats.topApp || {};
    const productivity = stats.productivity || { level: 'No Data', emoji: '📭', score: 0 };

    const hasData = (totalTime.milliseconds || 0) > 0;

    const productivityScore = productivity.score || 0;
    let efficiencyScore = 'N/A';
    let efficiencyLevel = 'No Data';

    if (productivityScore >= 70) {
      efficiencyScore = 'High';
      efficiencyLevel = 'High Efficiency';
    } else if (productivityScore >= 40) {
      efficiencyScore = 'Medium';
      efficiencyLevel = 'Medium Efficiency';
    } else if (productivityScore > 0) {
      efficiencyScore = 'Low';
      efficiencyLevel = 'Low Efficiency';
    }

    return {
      totalActiveTime: activeTime.milliseconds ? activeTime.milliseconds / 1000 : 0,
      activeFormatted: activeTime.formatted || '0m',
      activePercentage: activeTime.percentage || 0,
      totalIdleTime: idleTime.milliseconds ? idleTime.milliseconds / 1000 : 0,
      idleFormatted: idleTime.formatted || '0m',
      idlePercentage: idleTime.percentage || 0,
      totalTrackedTime: totalTime.milliseconds ? totalTime.milliseconds / 1000 : 0,
      totalFormatted: totalTime.formatted || '0m',
      mostUsedAppName: topApp.name || 'N/A',
      mostUsedTime: topApp.duration ? topApp.duration / 1000 : 0,
      mostUsedFormatted: topApp.formattedDuration || '0m',
      mostUsedAppPercentage: topApp.percentage || 0,
      productivity: {
        level: productivity.level || 'No Data',
        emoji: productivity.emoji || '📭',
        score: productivityScore
      },
      efficiency: {
        score: efficiencyScore,
        level: efficiencyLevel
      },
      appBreakdown: stats.appBreakdown || [],
      totalActivities: stats.totalActivities || 0,
      idleCount: stats.idleCount || 0,
      hasData
    };
  }
);

export default applicationSlice.reducer;