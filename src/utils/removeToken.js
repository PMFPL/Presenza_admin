export const removeToken = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('isAdminLoggedIn');
};
