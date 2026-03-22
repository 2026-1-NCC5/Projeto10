import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";


interface SignupFlowRouteProps {
  children: ReactNode;
}

function SignupFlowRoute({ children }: SignupFlowRouteProps) {
  const { isAuthenticated, isSignupFlow, isLoading, user } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isSignupFlow && user?.role) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}

export default SignupFlowRoute;
