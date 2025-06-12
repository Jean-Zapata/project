const API_BASE_URL = 'http://localhost:9898/api';

export interface SesionResponse {
  id?: number;
  token: string;
  fechaInicio: string;
  fechaExpiracion: string;
  activa: boolean;
  ipAddress?: string;
  userAgent?: string;
  fechaFin?: string;
  usuario?: {
    id: number;
    username: string;
    email: string;
  };
}

class SesionService {
  private baseURL = `${API_BASE_URL}/sesiones`;

  // Verificar si una sesión está activa
  async checkSession(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/check?token=${token}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Error al verificar sesión');
      }

      const data = await response.json();
      return data === 'Session is active';
    } catch (error) {
      console.error('Error al verificar sesión:', error);
      throw error;
    }
  }

  // Obtener todas las sesiones
  async getAllSessions(): Promise<SesionResponse[]> {
    try {
      const response = await fetch(this.baseURL);
      if (!response.ok) {
        throw new Error('Error al obtener las sesiones');
      }
      return await response.json();
    } catch (error) {
      console.error('Error al obtener sesiones:', error);
      throw error;
    }
  }

  // Obtener una sesión por ID
  async getSessionById(id: number): Promise<SesionResponse> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`);
      if (!response.ok) {
        throw new Error('Error al obtener la sesión');
      }
      return await response.json();
    } catch (error) {
      console.error('Error al obtener sesión:', error);
      throw error;
    }
  }

  // Obtener sesiones por usuario
  async getSessionsByUser(userId: number): Promise<SesionResponse[]> {
    try {
      const response = await fetch(`${this.baseURL}/usuario/${userId}`);
      if (!response.ok) {
        throw new Error('Error al obtener las sesiones del usuario');
      }
      return await response.json();
    } catch (error) {
      console.error('Error al obtener sesiones del usuario:', error);
      throw error;
    }
  }

  // Cerrar una sesión
  async closeSession(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activa: false,
          fechaFin: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Error al cerrar la sesión');
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }

  // Cerrar todas las sesiones de un usuario
  async closeAllUserSessions(userId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/usuario/${userId}/cerrar-todas`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Error al cerrar todas las sesiones del usuario');
      }
    } catch (error) {
      console.error('Error al cerrar todas las sesiones:', error);
      throw error;
    }
  }
}

export default new SesionService();
