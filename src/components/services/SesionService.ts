const API_BASE_URL = 'http://localhost:9898/api';

export interface SesionResponse {
  token: string;
  fechaInicio: string;
  fechaExpiracion: string;
  activa: boolean;
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
}

export default new SesionService();
