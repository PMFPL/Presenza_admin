import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "./APIRootCaller";

//----------------- Get all the records Based on specify API path ----------------
export const getRequest= async (path) => {
  return await apiGet(path);
}

// ------------- Post request with Body based on specific path --------------
export const postRequest= async (path,payload) => {
  return await apiPost(path,payload);
}

// ------------- Patch Request based on Selected Id-------------------------------------
export const patchRequst=async (path,payload)=>{
  return await apiPatch(path,payload);
}

// ------------- Patch Request based on Selected Id-------------------------------------
export const putRequest=async (path,payload)=>{
  return await apiPut(path,payload);
}

// ----------- Delete Request based on specific path -------------
export const deleteRequest=async(path)=>{
  return await apiDelete(path)
}
