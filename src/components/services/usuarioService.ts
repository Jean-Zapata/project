// services/usuarioService.ts
const API_BASE_URL = 'http://localhost:9898/api';

export interface UsuarioAPI {
  id?: number;
  username: string;
  email: string;
  activo: boolean;
  password?: string;
  fechaCreacion?: string;
  ultimoLogin?: string;
  rol: {
    id: number;
    nombre: string;
    descripcion?: string;
  };
  empleado?: {
    id?: number;
    nombres: string;
    apellidos: string;
    dni?: string;
    email?: string;
    telefono?: string;
    direccion?: string;
    fechaNacimiento?: string;
    fechaIngreso: string;
    salario?: number;
    estado?: string;
  };
}

export interface Usuario {
  id?: string;
  username: string;
  email: string;
  isActive: boolean;
  password?: string;
  createdAt: string;
  lastLogin?: string;
  role: {
    id: number;
    name: string;
    description?: string;
  };
  employee?: {
    id?: string;
    firstName: string;
    lastName: string;
    dni?: string;
    email?: string;
    phone?: string;
    address?: string;
    birthDate?: string;
    hireDate?: string;
    salary?: number;
    status?: string;
  };
}

export interface CreateUsuarioDTO {
  username: string;
  password: string;
  email: string;
  roleId: number;
  employee?: {
    nombres: string;
    apellidos: string;
    dni: string;
    email: string;
    telefono?: string;
    direccion?: string;
    fechaNacimiento?: string;
    fechaIngreso: string;
    salario?: number;
  };
}

export interface UpdateUsuarioDTO {
  username?: string;
  email?: string;
  isActive?: boolean;
  roleId?: number;
  password?: string;
  employee?: {
    firstName?: string;
    lastName?: string;
    dni?: string;
    email?: string;
    phone?: string;
    address?: string;
    birthDate?: string;
    hireDate?: string;
    salary?: number;
    status?: string;
  };
}

interface UserStats {
  activeUsers: number;
  totalUsers: number;
}

class UsuarioService {
  private baseURL = `${API_BASE_URL}/usuarios`;

  private mapApiToUsuario(apiUsuario: UsuarioAPI): Usuario {
    return {
      id: apiUsuario.id?.toString(),
      username: apiUsuario.username,
      email: apiUsuario.email,
      isActive: apiUsuario.activo,
      createdAt: apiUsuario.fechaCreacion || new Date().toISOString(),
      lastLogin: apiUsuario.ultimoLogin,
      role: {
        id: apiUsuario.rol.id,
        name: apiUsuario.rol.nombre,
        description: apiUsuario.rol.descripcion
      },
      employee: apiUsuario.empleado ? {
        id: apiUsuario.empleado.id?.toString(),
        firstName: apiUsuario.empleado.nombres,
        lastName: apiUsuario.empleado.apellidos,
        dni: apiUsuario.empleado.dni,
        email: apiUsuario.empleado.email,
        phone: apiUsuario.empleado.telefono,
        address: apiUsuario.empleado.direccion,
        birthDate: apiUsuario.empleado.fechaNacimiento,
        hireDate: apiUsuario.empleado.fechaIngreso,
        salary: apiUsuario.empleado.salario,
        status: apiUsuario.empleado.estado
      } : undefined
    };
  }

  private mapUsuarioToApi(usuario: Partial<Usuario>): Partial<UsuarioAPI> {
    return {
      username: usuario.username,
      email: usuario.email,
      activo: usuario.isActive,
      rol: usuario.role ? {
        id: usuario.role.id,
        nombre: usuario.role.name,
        descripcion: usuario.role.description
      } : undefined,
      empleado: usuario.employee ? (
        usuario.employee.hireDate !== undefined ? {
          nombres: usuario.employee.firstName,
          apellidos: usuario.employee.lastName,
          dni: usuario.employee.dni,
          email: usuario.employee.email,
          telefono: usuario.employee.phone,
          direccion: usuario.employee.address,
          fechaNacimiento: usuario.employee.birthDate,
          fechaIngreso: usuario.employee.hireDate,
          salario: usuario.employee.salary,
          estado: usuario.employee.status
        } : undefined
      ) : undefined
    };
  }

  async getAllUsers(): Promise<Usuario[]> {
    try {
      const response = await fetch(this.baseURL);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const apiUsers: UsuarioAPI[] = await response.json();
      return apiUsers.map(this.mapApiToUsuario);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<Usuario> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const apiUser: UsuarioAPI = await response.json();
      return this.mapApiToUsuario(apiUser);
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async createUser(userData: CreateUsuarioDTO): Promise<Usuario> {
    try {
      const payload = {
        username: userData.username,
        password: userData.password,
        email: userData.email,
        rol: { id: userData.roleId },
        empleado: userData.employee ? {
          nombres: userData.employee.nombres,
          apellidos: userData.employee.apellidos,
          dni: userData.employee.dni,
          email: userData.employee.email,
          telefono: userData.employee.telefono,
          direccion: userData.employee.direccion,
          fechaNacimiento: userData.employee.fechaNacimiento,
          fechaIngreso: userData.employee.fechaIngreso,
          salario: userData.employee.salario
        } : undefined
      };

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const createdUser: UsuarioAPI = await response.json();
      return this.mapApiToUsuario(createdUser);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, userData: UpdateUsuarioDTO): Promise<Usuario> {
    try {
      // Obtener el usuario actual para mantener el password si no se proporciona uno nuevo
      const currentUser = await this.getUserById(id);
      
      // Construye el payload según lo que espera la API
      const payload: Partial<UsuarioAPI> = {
        username: userData.username,
        email: userData.email,
        activo: userData.isActive,
        password: userData.password || currentUser.password, // Usar el password actual si no se proporciona uno nuevo
        rol: userData.roleId ? { 
          id: userData.roleId,
          nombre: 'Rol', // Estos valores serán actualizados por el backend
          descripcion: ''
        } : undefined
      };
      
      // Maneja el empleado si existe
      if (userData.employee) {
        payload.empleado = {
          nombres: userData.employee.firstName || '',
          apellidos: userData.employee.lastName || '',
          dni: userData.employee.dni || '',
          email: userData.employee.email || '',
          telefono: userData.employee.phone || '',
          direccion: userData.employee.address || '',
          fechaNacimiento: userData.employee.birthDate || '',
          fechaIngreso: userData.employee.hireDate || '',
          salario: userData.employee.salary,
          estado: userData.employee.status || ''
        };
      }

      console.log('Payload enviado a la API:', payload);

      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const updatedUser: UsuarioAPI = await response.json();
      console.log('Usuario actualizado recibido de la API:', updatedUser);
      
      return this.mapApiToUsuario(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async getStats(): Promise<UserStats> {
    try {
      const response = await fetch(`${this.baseURL}/stats`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      
      // Asegurarse de que todos los campos necesarios estén presentes
      return {
        activeUsers: data.activeUsers || 0,
        totalUsers: data.totalUsers || data.activeUsers || 0
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Retornar valores por defecto en caso de error
      return {
        activeUsers: 0,
        totalUsers: 0
      };
    }
  }

  async getUsuarios(): Promise<Usuario[]> {
    return this.getAllUsers();
  }

  async registerUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    roleId: number;
  }): Promise<Usuario> {
    try {
      // Generar un username único basado en el email
      const baseUsername = userData.email.split('@')[0];
      const timestamp = new Date().getTime();
      const username = `${baseUsername}${timestamp}`;

      // Primero crear el empleado
      const empleadoPayload = {
        nombres: userData.firstName,
        apellidos: userData.lastName,
        email: userData.email,
        fechaIngreso: new Date().toISOString().split('T')[0],
        estado: 'ACTIVO',
        salario: 0
      };

      console.log('Payload de empleado:', empleadoPayload);

      const empleadoResponse = await fetch(`${API_BASE_URL}/empleados`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(empleadoPayload),
      });

      if (!empleadoResponse.ok) {
        const errorData = await empleadoResponse.json().catch(() => ({}));
        console.error('Error al crear empleado:', errorData);
        throw new Error(errorData.message || `Error al crear empleado: ${empleadoResponse.status}`);
      }

      const empleadoCreado = await empleadoResponse.json();

      // Luego crear el usuario
      const usuarioPayload = {
        username: username,
        password: userData.password,
        email: userData.email,
        activo: true,
        rol: { id: userData.roleId },
        empleado: { id: empleadoCreado.id }
      };

      console.log('Payload de usuario:', usuarioPayload);

      const usuarioResponse = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usuarioPayload),
      });

      if (!usuarioResponse.ok) {
        const errorData = await usuarioResponse.json().catch(() => ({}));
        console.error('Error al crear usuario:', errorData);
        throw new Error(errorData.message || `Error al crear usuario: ${usuarioResponse.status}`);
      }

      const createdUser: UsuarioAPI = await usuarioResponse.json();
      return this.mapApiToUsuario(createdUser);
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }
}

export default new UsuarioService();
