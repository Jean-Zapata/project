const API_BASE_URL = 'http://localhost:9898/api';

class UsuarioService {
  // Obtener todos los usuarios
  async getUsuarios() {
    const response = await fetch(`${API_BASE_URL}/usuarios`);
    return response.json();
  }

  // Obtener estadísticas generales de los usuarios
  async getStats() {
    const response = await fetch(`${API_BASE_URL}/usuarios`); // Asegúrate de tener un endpoint para esto
    return response.json();
  }
}

export default new UsuarioService();
