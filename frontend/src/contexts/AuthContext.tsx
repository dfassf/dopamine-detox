import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { UserData } from "../api/auth";
import { refreshToken, logout as apiLogout } from "../api/auth";
import { setAccessToken } from "../api/client";

interface AuthState {
  user: UserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginSuccess: (token: string, user: UserData) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 refresh token으로 세션 복구 시도
  useEffect(() => {
    refreshToken()
      .then((data) => {
        setAccessToken(data.access_token);
        // refresh 성공하면 토큰에서 유저 정보를 가져올 수 없으므로
        // 별도 API가 필요하지만, 간단하게 로컬스토리지에서 복구
        const saved = localStorage.getItem("user");
        if (saved) {
          setUser(JSON.parse(saved));
        }
      })
      .catch(() => {
        setAccessToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const loginSuccess = useCallback((token: string, userData: UserData) => {
    setAccessToken(token);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem("user");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        loginSuccess,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
