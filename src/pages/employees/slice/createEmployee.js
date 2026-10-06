import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {patchRequst, postRequest } from "../../../services/api/APIMethodCaller";

export const createNewEmployee=createAsyncThunk('createEmployee',async({selectedEmp,payload},{rejectWithValue})=>{
  try{
     const response = selectedEmp
     ? await patchRequst(`/employee/${selectedEmp._id}`,payload)
     : await postRequest(`/employee`,payload);
     console.log("payload:",payload)
        if (response?.success) {
          return response.data || [];
      } else {
          return rejectWithValue(response?.error || "Something went wrong");
      }
  }
  catch(err){
    return rejectWithValue(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch Application List"
      );
  }
})

const initialState = {
  loading: false,
  error: null,
  success: false,
  employee: null,
};
const employeeSlice = createSlice({
  name: "employee",
  initialState,

  reducers: {
    resetCreateEmployeeState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.employee = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createNewEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.employee = action.payload;
      })
      .addCase(createNewEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { resetCreateEmployeeState } = employeeSlice.actions;

export default employeeSlice.reducer;
