import type { ReactElement } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";

import theme from "./theme/theme";
import { globalStyles } from "./styles/global";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import SignupFlowRoute from "./components/SignupFlowRoute/SignupFlowRoute";
import AppLayout from "./components/AppLayout/AppLayout";
import LoginPage from "./pages/login/Login";
import RegisterPage from "./pages/register/Register";
import SelectRolePage from "./pages/select-role/SelectRole";
import HomePage from "./pages/home/Home";
import DashboardPage from "./pages/dashboard/Dashboard";
import TeamsPage from "./pages/teams/Teams";
import AdminPage from "./pages/admin/Admin";


function RoleRoute({ roles, children }: { roles: string[]; children: ReactElement }) {
  const { user } = useAuth();
  return roles.includes(user?.role ?? "") ? children : <Navigate to="/home" replace />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={globalStyles} />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/select-role"
              element={
                <SignupFlowRoute>
                  <SelectRolePage />
                </SignupFlowRoute>
              }
            />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/home" element={<HomePage />} />
                <Route path="/teams" element={<TeamsPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <RoleRoute roles={["admin", "coordinator"]}>
                      <DashboardPage />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <RoleRoute roles={["admin"]}>
                      <AdminPage />
                    </RoleRoute>
                  }
                />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
