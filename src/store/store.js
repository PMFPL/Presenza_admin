import {configureStore} from '@reduxjs/toolkit';
import applicationUsedByEmpReducer from '../components/tracker/application/slice/applicationUsedByEmpSlice';
import employeeListReducer from '../pages/employees/slice/employeeList';
import createNewEmpReducer from '../pages/employees/slice/createEmployee';

export const store=configureStore({
  reducer:{
    employees:employeeListReducer,
    createEmployee:createNewEmpReducer,
    application:applicationUsedByEmpReducer,
  }
})
