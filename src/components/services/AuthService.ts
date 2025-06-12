const API_BASE_URL = 'http://localhost:9898/api';

export interface AuthResponse {
  token: string;
  usuario: {
    id: number;
    username: string;
    email: string;
    role: {
      id: number;
      name: string;
    };
  };
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: number;
}

class AuthService {
  private baseURL = `${API_BASE_URL}/auth`;

  // Iniciar sesión
  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/login?username=${username}&password=${password}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Credenciales inválidas');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en el login:', error);
      throw error;
    }
  }

  // Registrar nuevo usuario
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      // Generar un username único basado en el email
      const baseUsername = userData.email.split('@')[0];
      const timestamp = new Date().getTime();
      const username = `${baseUsername}${timestamp}`;

      const payload = {
        username: username,
        password: userData.password,
        email: userData.email,
        activo: true,
        rolId: userData.roleId // Cambiado de 'roleId' a 'rolId'
      };

      console.log('Payload de registro:', payload);

      const response = await fetch(`${this.baseURL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error al registrar:', errorData);
        throw new Error(errorData.message || `Error al registrar: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en el registro:', error);
      throw error;
    }
  }

  // Validar sesión
  async validateSession(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/validate?token=${token}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Error al validar sesión');
      }

      const data = await response.json();
      return data === 'Session is valid';
    } catch (error) {
      console.error('Error al validar sesión:', error);
      throw error;
    }
  }
}

export default new AuthService();
