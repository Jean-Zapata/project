import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RegisterData } from '../types';
import AuthService, { UserAuthData as AuthServiceUserAuthData } from '../components/services/AuthService';

// Definir la interfaz User para el frontend
export interface User {
  id: string;
  email: string;
  username: string;
  isActive?: boolean; // Puede ser opcional si no siempre se envía
  createdAt?: string;
  lastLogin?: string;
  role: { // Ahora es un objeto
    id: number;
    name: string; // O 'nombre' si prefieres la terminología del backend
    description?: string; // O 'descripcion' si viene del backend
  };
  // Añadir otras propiedades que vengan del backend si son necesarias para el frontend
  // Por ejemplo, si el backend envía empleado:
  // employee?: {
  //   id?: string;
  //   firstName: string;
  //   lastName: string;
  //   // ... otras propiedades de empleado
  // };
}

// Definir el tipo para el contexto de autenticación
export interface AuthContextType {
  user: User | null;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      AuthService.validateSession(token)
        .then(isValid => {
          if (isValid) {
            // Asegurarse de que el usuario parseado tenga la estructura correcta del rol
            const parsedUser: User = JSON.parse(storedUser);
            setUser(parsedUser);
          } else {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        })
        .catch(() => {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (usernameOrEmail: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const authServiceResponse: AuthServiceUserAuthData = await AuthService.login(usernameOrEmail, password);
      
      // Mapear la respuesta de AuthService a la interfaz User del AuthContext
      const userData: User = {
        id: authServiceResponse.id.toString(),
        email: authServiceResponse.email,
        username: authServiceResponse.username,
        isActive: authServiceResponse.isActive,
        createdAt: authServiceResponse.createdAt,
        lastLogin: authServiceResponse.lastLogin,
        role: {
          id: authServiceResponse.role.id,
          name: authServiceResponse.role.name,
          description: authServiceResponse.role.description,
        },
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', authServiceResponse.token);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    setIsLoading(true);
    try {
      const authServiceResponse: AuthServiceUserAuthData = await AuthService.register(userData);

      // Mapear la respuesta de AuthService a la interfaz User del AuthContext
      const newUser: User = {
        id: authServiceResponse.id.toString(),
        email: authServiceResponse.email,
        username: authServiceResponse.username,
        isActive: authServiceResponse.isActive,
        createdAt: authServiceResponse.createdAt,
        lastLogin: authServiceResponse.lastLogin,
        role: {
          id: authServiceResponse.role.id,
          name: authServiceResponse.role.name,
          description: authServiceResponse.role.description,
        },
      };

      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('token', authServiceResponse.token);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await AuthService.logout(token);
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    }
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}; 