import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "../api/api.ts";


interface Usuario {
  id: number;
  nombre: string;
  correo?: string;
  matricula?: string;
  rol: 'admin' | 'alumno' | 'staff';
}

interface AuthContextType {
  usuario: Usuario | null;
  isAdmin: boolean;
  isAlumno: boolean;
  login: (identificador: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const stored = localStorage.getItem("feca-usuario");
    return stored ? JSON.parse(stored) : null;
  });

  const isAdmin = usuario?.rol === 'admin';
  const isAlumno = usuario?.rol === 'alumno';

  const login = async (identificador: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post("/auth/login", { identificador, password });
      const { token, usuario: userData } = response.data;
      if (token && userData) {
        if (userData.rol === 'alumno') {
          localStorage.setItem("feca-alumno-token", token);
        } else if (userData.rol === 'admin') {
          localStorage.setItem("feca-admin-token", token);
        }
        localStorage.setItem("feca-usuario", JSON.stringify(userData));
        setUsuario(userData);
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
    localStorage.removeItem("feca-alumno-token");
    localStorage.removeItem("feca-usuario");
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, isAdmin, isAlumno, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
