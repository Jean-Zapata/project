import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import Loading from '../common/Loading';

interface LoginProps {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister, onSwitchToForgotPassword }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const { login, isLoading } = useAuth();
  const { addToast } = useToast();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = 'Email o nombre de usuario es requerido';
    }
    
    if (!formData.password || formData.password.trim() === '') {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // API Authentication Service
  const authenticateWithAPI = async (emailOrUsername: string, password: string) => {
    try {
      console.log('Intentando autenticación con API...');
      console.log('Email/Username:', emailOrUsername);
      console.log('Password length:', password?.length);
      
      // Validación antes de enviar
      if (!emailOrUsername || emailOrUsername.trim() === '') {
        throw new Error('Email o nombre de usuario es requerido');
      }
      
      if (!password || password.trim() === '') {
        throw new Error('La contraseña es requerida');
      }

      // CAMBIO AQUÍ: Usar "username" en lugar de "usernameOrEmail" para coincidir con Postman
      const requestBody = {
        username: emailOrUsername.trim(), // Cambio aquí
        password: password,
        ip: window.location.hostname,
        userAgent: navigator.userAgent
      };

      console.log('Request body:', requestBody);

      const response = await fetch('http://localhost:9898/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Respuesta de la API:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error de la API:', errorData);
        throw new Error(errorData.message || 'Autenticación fallida');
      }

      const data = await response.json();
      console.log('Datos recibidos de la API:', data);
      
      // Verificar que los datos necesarios estén presentes
      if (!data || !data.usuario) {
        throw new Error('Respuesta de la API incompleta');
      }

      // Transform API response to match your auth context expectations
      // Basado en la respuesta de Postman que viste
      return {
        token: data.token,
        user: {
          id: data.usuario.id.toString(),
          username: data.usuario.username,
          email: data.usuario.email,
          role: {
            id: data.usuario.rol?.id || 0,
            name: data.usuario.rol?.nombre || data.usuario.rol?.name || 'Usuario'
          }
        }
      };
    } catch (error) {
      console.error('Error de autenticación con API:', error);
      throw error;
    }
  };

  // Demo credentials fallback
  const authenticateWithDemo = async (email: string, password: string) => {
    const demoCredentials = [
      { email: 'admin@company.com', password: 'password', role: 'admin' },
      { email: 'employee@company.com', password: 'password', role: 'employee' }
    ];

    const user = demoCredentials.find(
      cred => cred.email === email && cred.password === password
    );

    if (!user) {
      throw new Error('Credenciales demo inválidas');
    }

    // Simulate API response structure
    return {
      token: `demo-token-${Date.now()}`,
      user: {
        id: user.role === 'admin' ? '1' : '2',
        username: user.email.split('@')[0],
        email: user.email,
        role: {
          id: user.role === 'admin' ? 1 : 2,
          name: user.role === 'admin' ? 'Admin' : 'Employee'
        }
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // Intentar autenticación con API primero
      try {
        await authenticateWithAPI(formData.email, formData.password);
        await login(formData.email, formData.password);
        addToast({
          type: 'success',
          message: '¡Inicio de sesión exitoso!'
        });
      } catch (apiError) {
        console.log('Error en autenticación API, probando credenciales demo...', apiError);
        
        // Si falla la API, intentar con credenciales demo
        try {
          await authenticateWithDemo(formData.email, formData.password);
          await login(formData.email, formData.password);
          addToast({
            type: 'success',
            message: '¡Inicio de sesión exitoso con credenciales demo!'
          });
        } catch {
          throw new Error('Credenciales inválidas. Por favor verifica tu email y contraseña, o usa las credenciales demo.');
        }
      }
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Error al iniciar sesión. Por favor intenta de nuevo.'
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Función para llenar credenciales demo rápidamente
  const fillDemoCredentials = (type: 'admin' | 'employee') => {
    const credentials = {
      admin: { email: 'admin@company.com', password: 'password' },
      employee: { email: 'employee@company.com', password: 'password' }
    };
    
    setFormData(prev => ({
      ...prev,
      email: credentials[type].email,
      password: credentials[type].password
    }));
    
    // Clear any existing errors
    setErrors({});
  };

  // Función para llenar credenciales de la API
  const fillAPICredentials = () => {
    setFormData(prev => ({
      ...prev,
      email: 'mateo.rivas@jczap.net',
      password: 'TestPass#2024'
    }));
    
    // Clear any existing errors
    setErrors({});
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Bienvenido de Nuevo</h2>
        <p className="mt-2 text-gray-600">Inicia sesión en tu cuenta</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email o Nombre de Usuario
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="text"
              value={formData.email}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Ingresa tu email o nombre de usuario"
            />
          </div>
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Ingresa tu contraseña"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
              Recordarme
            </label>
          </div>
          <button
            type="button"
            onClick={onSwitchToForgotPassword}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? <Loading size="sm" text="" /> : 'Iniciar Sesión'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          ¿No tienes una cuenta?{' '}
          <button
            onClick={onSwitchToRegister}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Regístrate
          </button>
        </p>
      </div>

      {/* Panel de credenciales mejorado */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800 font-medium mb-3">Opciones de Autenticación:</p>
        
        <div className="space-y-3">
          {/* Opción API */}
          <div>
            <p className="text-xs text-blue-700 mb-2">
              <strong>Opción 1:</strong> Credenciales de la API
            </p>
            <button
              type="button"
              onClick={fillAPICredentials}
              className="w-full px-3 py-2 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              Usar Credenciales API (mateo.rivas@jczap.net)
            </button>
          </div>
          
          {/* Separador */}
          <div className="border-t border-blue-200 pt-2">
            <p className="text-xs text-blue-700 mb-2"><strong>Opción 2:</strong> Credenciales Demo:</p>
            
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials('admin')}
                className="flex-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Demo Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('employee')}
                className="flex-1 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Demo Employee
              </button>
            </div>
            
            <div className="mt-2 text-xs text-gray-600">
              <p>• Admin: admin@company.com / password</p>
              <p>• Employee: employee@company.com / password</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;