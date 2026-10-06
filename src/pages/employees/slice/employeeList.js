import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getRequest } from "../../../services/api/APIMethodCaller";

export const fetchEmployeeList=createAsyncThunk('employeeList',async(_,{rejectWithValue})=>{
  try{
     const response = await getRequest(`/employee`);
        if (response?.success) {
          return response.data.data || [];
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

const initialState={
  data:[],
  loading:false,
  error:null
}

const employeeListSlice=createSlice({
  name:'employeeList',
  initialState,
  reducers:{},
  extraReducers:(builder)=>{
    builder.addCase(fetchEmployeeList.pending,(state)=>{
        state.loading=true;
        state.error=null;
    })
    builder.addCase(fetchEmployeeList.fulfilled,(state,action)=>{
        state.loading=false;
        state.data=action.payload;
    })
    builder.addCase(fetchEmployeeList.rejected,(state,action)=>{
        state.loading=false;
        state.error=action.payload;
    })
  }
})

export const empList = (state) => state.employees.data;

export const empLoading = (state) => state.employees.loading;
export const empError = (state) => state.employees.error;

export default employeeListSlice.reducer;
