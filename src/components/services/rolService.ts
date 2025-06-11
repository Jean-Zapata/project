const API_BASE_URL = 'http://localhost:9898/api';

class RolService {
  // Obtener roles
  async getRoles() {
    const response = await fetch(`${API_BASE_URL}/roles`);
    return response.json();
  }
}

export default new RolService();
