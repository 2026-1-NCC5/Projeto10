import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";


function ProtectedRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.role) {
    return <Navigate to="/select-role" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
