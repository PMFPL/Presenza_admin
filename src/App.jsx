import { lazy, Suspense, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "./components/common/ErrorBoundary";
import AttendanceReport from "./pages/AttendanceReport/AttendanceReport";
import PrivacyPolicy from "./privacy";

const Loading = lazy(() => import("./components/common/Loading"));
const PrivateRoute = lazy(() => import("./private-route/PrivateRoute"));
const Login = lazy(() => import("./pages/login/page/LogIn"));
const Layout = lazy(() => import("./layout/Layout"));
const Dashboard = lazy(() => import("./pages/dashboard/page/DashBoard"));
const Attendance = lazy(() => import("./pages/attendance/page/Attendance"));
const EmployeeList = lazy(() => import("./pages/employees/page/EmployeeList"));
const RequestedLeaveList = lazy(() => import("./pages/regularization/page/RequestedLeaveList"));
const RequestedExpanseList = lazy(() => import("./pages/expanse/page/Expanse"));
const UserTracker = lazy(() => import("./pages/user_Tracking/page/Tracker"));
const KRAManahement = lazy(() => import("./pages/kra-management/page/KRAManagement"));
const LeaveManagement = lazy(() => import("./pages/LeaveManagement/LeaveManagement"));
function App() {
  const [role, setRole] = useState(localStorage.getItem("Role"));

  useEffect(() => {
    // Listen for storage changes (for cross-tab sync)
    const handleStorageChange = (e) => {
      if (e.key === 'Role') {
        setRole(e.newValue);
      }
    };

    // Check for role changes in the same tab
    const checkRoleChange = () => {
      const currentRole = localStorage.getItem("Role");
      setRole(currentRole);
    };

    window.addEventListener('storage', handleStorageChange);

    // Optional: Poll for changes if you need real-time updates
    // (useful if role changes in the same tab without page reload)
    const interval = setInterval(checkRoleChange, 1000);

    console.log("Role from localStorage:", role); // Debugging line

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []); // Empty dependency array means this runs once on mount

  // Update role when it changes (for debugging)
  useEffect(() => {
    console.log("Role updated to:", role);
  }, [role]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading message="Loading application..." />}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="employee" element={<EmployeeList />} />
              <Route path="regularization" element={<RequestedLeaveList />} />
              <Route path="kra-management" element={<KRAManahement />} />
              <Route path="requested-expense" element={<PrivateRoute><RequestedExpanseList /></PrivateRoute>} />
              <Route path="report" element={<PrivateRoute><AttendanceReport /></PrivateRoute>} />

              <Route path="leave-management" element={<PrivateRoute><LeaveManagement /></PrivateRoute>} />
              {/* Render only for CEO - Now updates dynamically */}
              {role === "CEO" && (
                <Route path="user_tracker" element={<UserTracker />} />
              )}
            </Route>
          </Routes>
        </Router>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
