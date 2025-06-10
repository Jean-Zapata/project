// services/usuarioService.ts
const API_BASE_URL = 'http://localhost:9898/api';

export interface UsuarioAPI {
  id?: number;
  username: string;
  email: string;
  activo: boolean;
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
    department?: string;
    position?: string;
    hireDate?: string;
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
        department: apiUsuario.empleado.departamento,
        position: apiUsuario.empleado.cargo,
        hireDate: apiUsuario.empleado.fechaContratacion
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
      empleado: usuario.employee ? {
        nombres: usuario.employee.firstName,
        apellidos: usuario.employee.lastName,
        departamento: usuario.employee.department,
        cargo: usuario.employee.position,
        fechaContratacion: usuario.employee.hireDate
      } : undefined
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

  async createUser(userData: CreateUsuarioDTO): Promise<void> {
    try {
      const payload = {
        username: userData.username,
        password: userData.password,
        email: userData.email,
        activo: true,
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
          salario: userData.employee.salario,
          estado: 'ACTIVO'
        } : undefined
      };

      console.log('Payload a enviar:', payload);
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Error: ${response.status} - ${errorData?.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error detallado:', error);
      throw error;
    }
  }

  async updateUser(id: string, userData: Partial<Usuario>): Promise<void> {
    try {
      const apiUser = this.mapUsuarioToApi(userData);
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiUser),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
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
        throw new Error(`Error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

export default new UsuarioService();