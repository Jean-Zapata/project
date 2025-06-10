// services/permissionService.ts
const API_BASE_URL = 'http://localhost:9898/api';

// API Response interface for permissions
export interface PermissionAPI {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  activo: boolean;
  fechaCreacion?: string;
}

// Frontend interface for permissions
export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  createdAt?: string;
}

class PermissionService {
  private baseURL = `${API_BASE_URL}/permisos`;

  // Map API response to frontend interface
  private mapApiToPermission(apiPermission: PermissionAPI): Permission {
    return {
      id: apiPermission.id.toString(),
      code: apiPermission.codigo,
      name: apiPermission.nombre,
      description: apiPermission.descripcion,
      category: apiPermission.categoria,
      isActive: apiPermission.activo,
      createdAt: apiPermission.fechaCreacion || new Date().toISOString()
    };
  }

  // Map frontend interface to API request
  private mapPermissionToApi(permission: Partial<Permission>): Partial<PermissionAPI> {
    return {
      codigo: permission.code || '',
      nombre: permission.name || '',
      descripcion: permission.description || '',
      categoria: permission.category || '',
      activo: permission.isActive ?? true
    };
  }

  async getAllPermissions(): Promise<Permission[]> {
    try {
      const response = await fetch(this.baseURL);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const apiPermissions: PermissionAPI[] = await response.json();
      return apiPermissions.map(this.mapApiToPermission);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      throw error;
    }
  }

  async getPermissionById(id: string): Promise<Permission> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const apiPermission: PermissionAPI = await response.json();
      return this.mapApiToPermission(apiPermission);
    } catch (error) {
      console.error('Error fetching permission:', error);
      throw error;
    }
  }

  async getPermissionsByCategory(category: string): Promise<Permission[]> {
    try {
      const response = await fetch(`${this.baseURL}/categoria/${encodeURIComponent(category)}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const apiPermissions: PermissionAPI[] = await response.json();
      return apiPermissions.map(this.mapApiToPermission);
    } catch (error) {
      console.error('Error fetching permissions by category:', error);
      throw error;
    }
  }

  async getActivePermissions(): Promise<Permission[]> {
    try {
      const response = await fetch(`${this.baseURL}/activos`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const apiPermissions: PermissionAPI[] = await response.json();
      return apiPermissions.map(this.mapApiToPermission);
    } catch (error) {
      console.error('Error fetching active permissions:', error);
      throw error;
    }
  }

  async getPermissionsByCode(codes: string[]): Promise<Permission[]> {
    try {
      const queryString = codes.map(code => `codes=${encodeURIComponent(code)}`).join('&');
      const response = await fetch(`${this.baseURL}/por-codigos?${queryString}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const apiPermissions: PermissionAPI[] = await response.json();
      return apiPermissions.map(this.mapApiToPermission);
    } catch (error) {
      console.error('Error fetching permissions by codes:', error);
      throw error;
    }
  }

  async createPermission(permissionData: Partial<Permission>): Promise<void> {
    try {
      const apiPermission = this.mapPermissionToApi(permissionData);
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPermission),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Error: ${response.status} - ${errorData?.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error creating permission:', error);
      throw error;
    }
  }

  async updatePermission(id: string, permissionData: Partial<Permission>): Promise<void> {
    try {
      const apiPermission = this.mapPermissionToApi(permissionData);
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPermission),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Error: ${response.status} - ${errorData?.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating permission:', error);
      throw error;
    }
  }

  async deletePermission(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Error: ${response.status} - ${errorData?.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting permission:', error);
      throw error;
    }
  }

  async togglePermissionStatus(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/${id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`Error: ${response.status} - ${errorData?.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error toggling permission status:', error);
      throw error;
    }
  }

  async getPermissionCategories(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/categorias`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching permission categories:', error);
      throw error;
    }
  }

  async searchPermissions(query: string): Promise<Permission[]> {
    try {
      const response = await fetch(`${this.baseURL}/buscar?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const apiPermissions: PermissionAPI[] = await response.json();
      return apiPermissions.map(this.mapApiToPermission);
    } catch (error) {
      console.error('Error searching permissions:', error);
      throw error;
    }
  }
}

export default new PermissionService();