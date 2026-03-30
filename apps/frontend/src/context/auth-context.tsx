"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  role: "CANDIDATE" | "RECRUITER" | "ADMIN";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface DecodedToken {
  sub: string;
  email: string;
  role: "CANDIDATE" | "RECRUITER" | "ADMIN";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser({
          id: decoded.sub,
          email: decoded.email,
          role: decoded.role,
        });
      } catch {
        Cookies.remove("accessToken");
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string) => {
    Cookies.set("accessToken", token, { expires: 7 });
    const decoded = jwtDecode<DecodedToken>(token);
    setUser({
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    });
    
    // Check for redirect after login
    const redirectPath = localStorage.getItem("redirectAfterLogin");
    if (redirectPath) {
      localStorage.removeItem("redirectAfterLogin");
      router.push(redirectPath);
      return;
    }

    if (decoded.role === "ADMIN") {
      router.push("/dashboard/admin");
    } else if (decoded.role === "RECRUITER") {
      router.push("/dashboard/recruiter");
    } else {
      router.push("/dashboard/candidat");
    }
  };

  const logout = () => {
    Cookies.remove("accessToken");
    setUser(null);
    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
