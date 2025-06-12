const API_BASE_URL = 'http://localhost:9898/api';

export interface EmpleadoStats {
  totalEmpleados: number;
  empleadosActivos: number;
  empleadosInactivos: number;
  salarioPromedio: number;
}

class EmpleadoService {
  private baseURL = `${API_BASE_URL}/empleados`;

  // Obtener empleados
  async getEmpleados() {
    try {
      const response = await fetch(this.baseURL);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  }

  // Obtener estadísticas de empleados
  async getEmpleadoStats(): Promise<EmpleadoStats> {
    try {
        const response = await fetch(`${this.baseURL}/stats`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.mensaje || `Error: ${response.status}`);
        }
        
        // Validación de datos
        if (!data || typeof data !== 'object') {
            throw new Error('Formato de respuesta inválido');
        }
        
        return {
            totalEmpleados: Number(data.totalEmpleados) || 0,
            empleadosActivos: Number(data.empleadosActivos) || 0,
            empleadosInactivos: Number(data.empleadosInactivos) || 0,
            salarioPromedio: Number(data.salarioPromedio) || 0
        };
    } catch (error) {
        console.error('Error fetching employee stats:', error);
        throw error; // Propagar el error para manejarlo en el componente
    }
}
}

export default new EmpleadoService();
