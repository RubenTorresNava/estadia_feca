import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "../api/api.ts";

interface AuthContextType {
  isAdmin: boolean;
  login: (usuario: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return !!localStorage.getItem("feca-admin-token");
  });

  const login = async (usuario: string, password: string): Promise<boolean> => {
    try {
      // 1. Usamos 'api' en lugar de 'fetch'
      // Ya no necesitas poner la URL completa ni los headers manualmente
      const response = await api.post("/administrador/login", { 
        usuario, 
        password 
      });

      const { token } = response.data;

      if (token) {
        localStorage.setItem("feca-admin-token", token);
        setIsAdmin(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error en el inicio de sesión:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("feca-admin-token");
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
