"use client";

import { createContext, useContext, useReducer, useEffect } from "react";
import apiClient from "@/lib/api";

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_USER":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case "LOGOUT":
      return {
        ...initialState,
        loading: false,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("polling_token");
      const user = localStorage.getItem("polling_user");

      if (token && user) {
        try {
          apiClient.setToken(token);
          const userData = JSON.parse(user);

          // Verify token is still valid
          const response = await apiClient.get("/auth/me");

          dispatch({
            type: "SET_USER",
            payload: { user: response, token },
          });
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem("polling_token");
          localStorage.removeItem("polling_user");
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await apiClient.post("/auth/login", { email, password });

      const { token, user } = response;

      // Store in localStorage
      localStorage.setItem("polling_token", token);
      localStorage.setItem("polling_user", JSON.stringify(user));

      // Set token for future requests
      apiClient.setToken(token);

      dispatch({
        type: "SET_USER",
        payload: { user, token },
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.message || "Login failed";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (name, email, password) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await apiClient.post("/auth/register", {
        name,
        email,
        password,
        role: "user", // Always register as user
      });

      const { token, user } = response;

      // Store in localStorage
      localStorage.setItem("polling_token", token);
      localStorage.setItem("polling_user", JSON.stringify(user));

      // Set token for future requests
      apiClient.setToken(token);

      dispatch({
        type: "SET_USER",
        payload: { user, token },
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.message || "Registration failed";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem("polling_token");
    localStorage.removeItem("polling_user");
    apiClient.setToken(null);
    dispatch({ type: "LOGOUT" });
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
