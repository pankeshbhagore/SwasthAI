import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("medimind_token") || null);

  // Load user on mount or token change
  useEffect(() => {
    if (token && !user) {
      loadUser();
    } else if (!token) {
      setLoading(false);
      setUser(null);
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const currentToken = token || localStorage.getItem("medimind_token");
      if (!currentToken) {
        setLoading(false);
        return;
      }
      api.defaults.headers.common["Authorization"] = `Bearer ${currentToken}`;
      const res = await api.get("/users/profile");
      if (res.data.success) {
        setUser(res.data.user);
      } else {
        throw new Error("Failed to load profile");
      }
    } catch (error) {
      console.error("Auth Error:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.post("/users/login", { email, password });
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem("medimind_token", newToken);
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(newUser);
    return res.data;
  };

  const register = async (data) => {
    const res = await api.post("/users/register", data);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem("medimind_token", newToken);
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(newUser);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("medimind_token");
    delete api.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
