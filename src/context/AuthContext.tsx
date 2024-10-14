import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  authToken: string | null;
  login: (
    token: string,
    user: {
      email: string;
      firstName: string;
      lastName: string;
      id: number;
    }
  ) => void;
  logout: () => void;
  user: {
    email: string;
    firstName: string;
    lastName: string;
    id: number;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authToken, setAuthToken] = useState<string | null>(
    localStorage.getItem("authToken")
  );
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null")
  )
  const navigate = useNavigate();

  const login = (token: string, user: any) => {
    setAuthToken(token);
    setUser(user);
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(user));
    navigate("/books");
  };

  const logout = () => {
    setAuthToken(null);
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ authToken, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};
