import { useMemo } from "react";
import type { ReactElement } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";

import { createAppTheme } from "./theme/theme";
import { ThemeModeProvider, useThemeMode } from "./theme/ThemeModeContext";
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
import PublicDashboardPage from "./pages/publicDashboard/PublicDashboard";
import RankingPage from "./pages/ranking/Ranking";


function RoleRoute({ roles, children }: { roles: string[]; children: ReactElement }) {
  const { user } = useAuth();
  return roles.includes(user?.role ?? "") ? children : <Navigate to="/home" replace />;
}


function ThemedApp() {
  const { mode } = useThemeMode();
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={globalStyles} />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/overview" element={<PublicDashboardPage />} />
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
                <Route path="/ranking" element={<RankingPage />} />
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


function App() {
  return (
    <ThemeModeProvider>
      <ThemedApp />
    </ThemeModeProvider>
  );
}

export default App;
