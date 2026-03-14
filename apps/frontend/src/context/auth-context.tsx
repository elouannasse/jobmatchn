"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  role: "CANDIDATE" | "RECRUITER";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUser({
          id: decoded.sub,
          email: decoded.email,
          role: decoded.role,
        });
      } catch (error) {
        Cookies.remove("accessToken");
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string) => {
    Cookies.set("accessToken", token, { expires: 7 });
    const decoded: any = jwtDecode(token);
    setUser({
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    });
    
    if (decoded.role === "RECRUITER") {
      router.push("/dashboard/recruiter");
    } else {
      router.push("/dashboard/candidate");
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
