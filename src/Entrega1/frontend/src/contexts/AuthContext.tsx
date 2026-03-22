import type { ReactNode } from "react";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import * as api from "../services/api";
import type { UserData } from "../services/api";


interface AuthContextValue {
  user: UserData | null;
  token: string | null;
  isAuthenticated: boolean;
  isSignupFlow: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserData>;
  register: (name: string, email: string, password: string) => Promise<UserData>;
  selectRole: (role: string) => Promise<UserData>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("token")
  );
  const [isSignupFlow, setIsSignupFlow] = useState<boolean>(
    () => sessionStorage.getItem("signupFlow") === "true"
  );
  const [isLoading, setIsLoading] = useState(!!token);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    api
      .getMe(token)
      .then((u) => setUser(u))
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const loginFn = useCallback(async (email: string, password: string) => {
    const data = await api.login(email, password);
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    if (!data.user.role) {
      sessionStorage.setItem("signupFlow", "true");
      setIsSignupFlow(true);
    }
    return data.user;
  }, []);

  const registerFn = useCallback(
    async (name: string, email: string, password: string) => {
      const data = await api.register(name, email, password);
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
      sessionStorage.setItem("signupFlow", "true");
      setIsSignupFlow(true);
      return data.user;
    },
    []
  );

  const selectRoleFn = useCallback(
    async (role: string) => {
      if (!token) throw new Error("Não autenticado");
      const updatedUser = await api.selectRole(token, role);
      setUser(updatedUser);
      sessionStorage.removeItem("signupFlow");
      setIsSignupFlow(false);
      return updatedUser;
    },
    [token]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("signupFlow");
    setToken(null);
    setUser(null);
    setIsSignupFlow(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isSignupFlow,
        isLoading,
        login: loginFn,
        register: registerFn,
        selectRole: selectRoleFn,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
