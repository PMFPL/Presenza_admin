import { Navigate } from 'react-router-dom'

function PrivateRoute({ children }) {
  const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';

  if (!isAdminLoggedIn) {
    return <Navigate to="/login" replace />
  }

  if (isAdminLoggedIn) {
    return children
  }
}
export default PrivateRoute;
