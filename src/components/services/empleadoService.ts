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
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      
      // Asegurarse de que todos los campos necesarios estén presentes
      return {
        totalEmpleados: data.totalEmpleados || 0,
        empleadosActivos: data.empleadosActivos || 0,
        empleadosInactivos: data.empleadosInactivos || 0,
        salarioPromedio: data.salarioPromedio || 0
      };
    } catch (error) {
      console.error('Error fetching employee stats:', error);
      // Retornar valores por defecto en caso de error
      return {
        totalEmpleados: 0,
        empleadosActivos: 0,
        empleadosInactivos: 0,
        salarioPromedio: 0
      };
    }
  }
}

export default new EmpleadoService();
