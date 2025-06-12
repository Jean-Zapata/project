const API_BASE_URL = 'http://localhost:9898/api';

// Backend's Auth Response structure (for /register)
export interface BackendAuthResponse {
  token: string;
  usuario: {
    id: number;
    username: string;
    email: string;
    activo: boolean;
    fechaCreacion?: string;
    ultimoLogin?: string;
    rol: { // Matches backend: 'rol' (lowercase)
      id: number;
      nombre: string; // Matches backend: 'nombre'
      descripcion?: string;
      activo?: boolean;
      fechaCreacion?: string;
      permisos?: any[];
    };
  };
}

// Backend's Session Response structure (for /login)
export interface BackendSessionResponse {
  id: number;
  token: string;
  fechaInicio: string;
  fechaExpiracion: string;
  activa: boolean;
  ipAddress?: string;
  userAgent?: string;
  fechaFin?: string;
  usuario: {
    id: number;
    username: string;
    email: string;
    // Backend's session response also includes the role directly within usuario
    rol: { // Matches backend: 'rol' (lowercase)
      id: number;
      nombre: string; // Matches backend: 'nombre'
      descripcion?: string;
    };
    activo?: boolean; // May not always be present in session's usuario
    fechaCreacion?: string; // May not always be present in session's usuario
    ultimoLogin?: string; // May not always be present in session's usuario
  };
}

// Frontend's User data structure (camelCase)
export interface UserAuthData {
  id: string; // Convert to string for frontend consistency
  username: string;
  email: string;
  isActive: boolean;
  createdAt?: string;
  lastLogin?: string;
  role: { // Frontend convention: 'role' (camelCase)
    id: number;
    name: string; // Frontend convention: 'name' (camelCase)
    description?: string;
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

  // Helper to map BackendAuthResponse (from /register) to Frontend UserAuthData
  private mapBackendAuthResponseToUserAuthData(apiResponse: BackendAuthResponse): UserAuthData {
    return {
      id: apiResponse.usuario.id.toString(),
      username: apiResponse.usuario.username,
      email: apiResponse.usuario.email,
      isActive: apiResponse.usuario.activo,
      createdAt: apiResponse.usuario.fechaCreacion,
      lastLogin: apiResponse.usuario.ultimoLogin,
      role: {
        id: apiResponse.usuario.rol.id,
        name: apiResponse.usuario.rol.nombre,
        description: apiResponse.usuario.rol.descripcion,
      },
    };
  }

  // Helper to map BackendSessionResponse (from /login) to Frontend UserAuthData
  private mapBackendSessionResponseToUserAuthData(apiResponse: BackendSessionResponse): UserAuthData {
    // Note: The 'usuario' object in BackendSessionResponse might be less complete than BackendAuthResponse
    // We prioritize what's available and map it to UserAuthData
    return {
      id: apiResponse.usuario.id.toString(),
      username: apiResponse.usuario.username,
      email: apiResponse.usuario.email,
      isActive: apiResponse.usuario.activo || true, // Default to true if not explicitly provided
      createdAt: apiResponse.usuario.fechaCreacion,
      lastLogin: apiResponse.usuario.ultimoLogin,
      role: {
        id: apiResponse.usuario.rol.id,
        name: apiResponse.usuario.rol.nombre,
        description: apiResponse.usuario.rol.descripcion,
      },
    };
  }

  // Iniciar sesión
  async login(usernameOrEmail: string, password: string): Promise<UserAuthData> { // Returns Frontend UserAuthData
    try {
      if (!usernameOrEmail || usernameOrEmail.trim() === '') {
        throw new Error('El nombre de usuario o email no puede estar vacío');
      }
      if (!password || password.trim() === '') {
        throw new Error('La contraseña no puede estar vacía');
      }

      console.log('AuthService.login - Username or Email:', usernameOrEmail);
      console.log('AuthService.login - Password length:', password?.length);

      const requestBody = {
        username: usernameOrEmail.trim(), // Backend expects 'username' field for both
        password: password,
        ip: window.location.hostname, // Or actual IP if available
        userAgent: navigator.userAgent
      };

      console.log('AuthService.login - Request body:', requestBody);

      const response = await fetch(`${this.baseURL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('AuthService.login - Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('AuthService.login - Error data:', errorData);
        throw new Error(errorData.message || 'Credenciales inválidas');
      }

      const data: BackendSessionResponse = await response.json();
      console.log('AuthService.login - Success backend session data:', data);

      // Map the backend session response to frontend UserAuthData
      return this.mapBackendSessionResponseToUserAuthData(data);

    } catch (error) {
      console.error('Error en el login:', error);
      throw error;
    }
  }

  // Registrar nuevo usuario
  async register(userData: RegisterData): Promise<UserAuthData> { // Returns Frontend UserAuthData
    try {
      const baseUsername = userData.email.split('@')[0];
      const timestamp = new Date().getTime();
      const username = `${baseUsername}${timestamp}`;

      const payload = {
        username: username,
        password: userData.password,
        email: userData.email,
        activo: true,
        rolId: userData.roleId
      };

      console.log('Payload de registro:', payload);

      const response = await fetch(`${this.baseURL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error al registrar:', errorData);
        throw new Error(errorData.message || `Error al registrar: ${response.status}`);
      }

      const data: BackendAuthResponse = await response.json();
      console.log('AuthService.register - Success backend auth data:', data);

      // Map the backend auth response to frontend UserAuthData
      return this.mapBackendAuthResponseToUserAuthData(data);

    } catch (error) {
      console.error('Error en el registro:', error);
      throw error;
    }
  }

  // Validar sesión
  async validateSession(token: string): Promise<boolean> {
    try {
      if (!token || token.trim() === '') {
        return false;
      }

      const response = await fetch(`${this.baseURL}/validate?token=${token}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al validar sesión');
      }

      const data = await response.json();
      return data === true;
    } catch (error) {
      console.error('Error al validar sesión:', error);
      return false;
    }
  }

  // Cerrar sesión
  async logout(token: string): Promise<void> {
    try {
      if (!token || token.trim() === '') {
        throw new Error('Token requerido para cerrar sesión');
      }

      const response = await fetch(`${this.baseURL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error('Error al cerrar sesión');
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }
}

export default new AuthService();