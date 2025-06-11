// services/roleService.ts
const API_BASE_URL = 'http://localhost:9898/api';

// Interfaces actualizadas
export interface RoleAPI {
  id?: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  fechaCreacion?: string;
  permisos: string[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  userCount: number;
}

export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
}

class RoleService {
  private baseURL = `${API_BASE_URL}/roles`;

  private mapApiToRole(apiRole: RoleAPI): Role {
    return {
      id: apiRole.id?.toString() || '',
      name: apiRole.nombre,
      description: apiRole.descripcion,
      permissions: apiRole.permisos || [],
      createdAt: apiRole.fechaCreacion || new Date().toISOString(),
      updatedAt: apiRole.fechaCreacion || new Date().toISOString(),
      isActive: apiRole.activo,
      userCount: 0
    };
  }

  private mapRoleToApi(role: Partial<Role>): Partial<RoleAPI> {
    return {
      nombre: role.name || '',
      descripcion: role.description || '',
      activo: role.isActive ?? true,
      permisos: role.permissions || []
    };
  }

  async getAllRoles(): Promise<Role[]> {
    try {
      const response = await fetch(this.baseURL);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const apiRoles: RoleAPI[] = await response.json();
      return apiRoles.map(this.mapApiToRole);
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  }

  async getRoleById(id: string): Promise<Role> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const apiRole: RoleAPI = await response.json();
      return this.mapApiToRole(apiRole);
    } catch (error) {
      console.error('Error fetching role:', error);
      throw error;
    }
  }

  async createRole(roleData: Partial<Role>): Promise<void> {
    try {
      const apiRole = this.mapRoleToApi(roleData);
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRole),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Error: ${response.status} - ${errorData?.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  async updateRole(id: string, roleData: Partial<Role>): Promise<void> {
    try {
      const apiRole = this.mapRoleToApi(roleData);
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRole),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Error: ${response.status} - ${errorData?.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  // Nuevos métodos para manejar permisos
  async getRolePermissions(roleId: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/${roleId}/permisos`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      throw error;
    }
  }

  async updateRolePermissions(roleId: string, permissions: string[]): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/${roleId}/permisos`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permisos: permissions }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Error: ${response.status} - ${errorData?.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating role permissions:', error);
      throw error;
    }
  }

  async deleteRole(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Error: ${response.status} - ${errorData?.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  }

  async getRoles(): Promise<Role[]> {
    return this.getAllRoles();
  }
}

export default new RoleService();