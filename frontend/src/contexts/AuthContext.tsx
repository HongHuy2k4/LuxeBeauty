import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { axiosClient } from "@/axios/axiosClient";

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<User, "id" | "role">) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user từ API khi app khởi động nếu có token
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axiosClient.get("/user");
          if (response.data) {
            setUser(response.data);
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await axiosClient.post("/login", { email, password });
    if (response.data?.success) {
      const { user, token } = response.data.data;
      setUser(user);
      localStorage.setItem("token", token);
    } else {
      throw new Error(response.data?.message || "Login failed");
    }
  };

  const register = async (userData: Omit<User, "id" | "role">) => {
    const response = await axiosClient.post("/register", {
      name: userData.fullName,
      email: userData.email,
      password: (userData as any).password,
      password_confirmation: (userData as any).password_confirmation,
      phone: userData.phone
    });
    
    if (response.data?.success) {
      const { user, token } = response.data.data;
      setUser(user);
      localStorage.setItem("token", token);
    } else {
      throw new Error(response.data?.message || "Registration failed");
    }
  };

  const logout = async () => {
    try {
      if (localStorage.getItem("token")) {
        await axiosClient.post("/logout");
      }
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    localStorage.removeItem("token");
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

