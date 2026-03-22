import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";

import theme from "./theme/theme";
import { globalStyles } from "./styles/global";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import SignupFlowRoute from "./components/SignupFlowRoute/SignupFlowRoute";
import LoginPage from "./pages/login/Login";
import RegisterPage from "./pages/register/Register";
import SelectRolePage from "./pages/select-role/SelectRole";
import HomePage from "./pages/home/Home";


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
              <Route path="/home" element={<HomePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
