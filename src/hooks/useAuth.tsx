/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Credentials, User } from "@/data/types";
import { toUserMessage } from "@/services/http";
import {
  login as loginRequest,
  logout as logoutRequest,
  refreshSession,
} from "@/services/authService";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isRestoringSession: boolean;
  login: (credentials: Credentials) => void;
  loginError: string | null;
  isLoggingIn: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = ["auth", "session"] as const;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();

  const { data: user = null, isPending: isRestoringSession } = useQuery({
    queryKey: SESSION_KEY,
    queryFn: async (): Promise<User | null> => {
      try {
        return (await refreshSession()).user;
      } catch {
        return null;
      }
    },
    staleTime: Infinity,
    retry: false,
  });

  const {
    mutate: login,
    error: loginErrorRaw,
    isPending: isLoggingIn,
  } = useMutation({
    mutationFn: (credentials: Credentials) => loginRequest(credentials),
    onSuccess: (session) => queryClient.setQueryData(SESSION_KEY, session.user),
  });

  const { mutate: logout } = useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => queryClient.setQueryData(SESSION_KEY, null),
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isRestoringSession,
        login,
        loginError: loginErrorRaw ? toUserMessage(loginErrorRaw) : null,
        isLoggingIn,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
