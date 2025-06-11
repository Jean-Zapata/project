const API_BASE_URL = 'http://localhost:9898/api';

export interface AuthResponse {
  token: string;
  usuario: string;  // Este es el nombre del usuario, puedes incluir más info si es necesario.
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
        throw new Error('Credenciales inválidas');
      }

      const data = await response.json();
      return data; // Contendrá el token y el usuario
    } catch (error) {
      console.error('Error en el login:', error);
      throw error;
    }
  }

  // Cerrar sesión
  async logout(token: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/logout?token=${token}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Error al cerrar sesión');
      }

      console.log('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
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
