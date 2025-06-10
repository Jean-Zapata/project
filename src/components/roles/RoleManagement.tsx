import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Edit, Trash2, Shield, Users, Calendar, MoreVertical, Loader2 } from 'lucide-react';
import { Role, Permission } from '../../types';
import Modal from '../common/Modal';
import RoleForm from './RoleForm';
import { useToast } from '../../context/ToastContext';
import roleService from './../services/roleService';
import permissionService from './../services/permissionService';

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const itemsPerPage = 8;

  const { addToast } = useToast();

  // Cargar roles y permisos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setPermissionsLoading(true);
      
      // Cargar roles y permisos en paralelo
      const [rolesData, permissionsData] = await Promise.all([
        roleService.getAllRoles(),
        permissionService.getAllPermissions()
      ]);
      
      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Error al cargar los datos. Por favor, intenta de nuevo.'
      });
    } finally {
      setLoading(false);
      setPermissionsLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      setLoading(true);
      const rolesData = await roleService.getAllRoles();
      setRoles(rolesData);
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Error al cargar los roles. Por favor, intenta de nuevo.'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter(role => {
    const matchesSearch = 
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && role.isActive) ||
      (filterStatus === 'inactive' && !role.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRoles = filteredRoles.slice(startIndex, startIndex + itemsPerPage);

  const handleCreateRole = () => {
    setSelectedRole(null);
    setShowRoleModal(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setShowRoleModal(true);
  };

  const handleDeleteRole = async (role: Role) => {
    if (role.userCount > 0) {
      addToast({
        type: 'error',
        message: `Cannot delete role "${role.name}" because it has ${role.userCount} assigned users.`
      });
      return;
    }

    if (!window.confirm(`¿Estás seguro de que quieres eliminar el rol "${role.name}"?`)) {
      return;
    }

    try {
      setDeleteLoading(role.id);
      await roleService.deleteRole(role.id);
      
      // Actualizar la lista local
      setRoles(prevRoles => prevRoles.filter(r => r.id !== role.id));
      
      addToast({
        type: 'success',
        message: `Role "${role.name}" has been deleted successfully.`
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: `Error al eliminar el rol "${role.name}". Por favor, intenta de nuevo.`
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleRoleSubmit = async (roleData: Partial<Role>) => {
    try {
      if (selectedRole) {
        // Actualizar rol existente
        await roleService.updateRole(selectedRole.id, roleData);
        
        // Actualizar la lista local
        setRoles(prevRoles => 
          prevRoles.map(role => 
            role.id === selectedRole.id 
              ? { ...role, ...roleData, updatedAt: new Date().toISOString() }
              : role
          )
        );
        
        addToast({
          type: 'success',
          message: `Role "${roleData.name}" updated successfully!`
        });
      } else {
        // Crear nuevo rol
        await roleService.createRole(roleData);
        
        // Recargar la lista para obtener el ID del nuevo rol
        await loadRoles();
        
        addToast({
          type: 'success',
          message: `Role "${roleData.name}" created successfully!`
        });
      }
      setShowRoleModal(false);
    } catch (error) {
      addToast({
        type: 'error',
        message: selectedRole 
          ? `Error al actualizar el rol "${roleData.name}". Por favor, intenta de nuevo.`
          : `Error al crear el rol "${roleData.name}". Por favor, intenta de nuevo.`
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPermissionName = (permissionCode: string) => {
    const permission = permissions.find(p => p.code === permissionCode);
    return permission ? permission.name : permissionCode;
  };

  // Obtener categorías únicas de permisos
  const getUniqueCategories = () => {
    const categories = new Set(permissions.map(p => p.category));
    return Array.from(categories);
  };

  if (loading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Cargando datos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Roles</h2>
          <p className="mt-1 text-sm text-gray-500">
            Administra roles y permisos del sistema
          </p>
        </div>
        <button
          onClick={handleCreateRole}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Rol
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Roles</p>
              <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Roles Activos</p>
              <p className="text-2xl font-bold text-gray-900">{roles.filter(r => r.isActive).length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Usuarios Asignados</p>
              <p className="text-2xl font-bold text-gray-900">{roles.reduce((sum, role) => sum + role.userCount, 0)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Permisos Únicos</p>
              <p className="text-2xl font-bold text-gray-900">{permissions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los Estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Filter className="w-4 h-4 mr-2" />
            Filtros Avanzados
          </button>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentRoles.map((role) => (
          <div key={role.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${role.isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <Shield className={`w-5 h-5 ${role.isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    role.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {role.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
              
              <div className="relative">
                <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{role.description}</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Usuarios asignados:</span>
                <span className="font-medium text-gray-900">{role.userCount}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Permisos:</span>
                <span className="font-medium text-gray-900">{role.permissions.length}</span>
              </div>
              
              <div className="text-xs text-gray-500">
                Actualizado: {formatDate(role.updatedAt)}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-1 mb-3">
                {role.permissions.slice(0, 3).map((permission, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                    {getPermissionName(permission)}
                  </span>
                ))}
                {role.permissions.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{role.permissions.length - 3} más
                  </span>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditRole(role)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteRole(role)}
                  disabled={role.userCount > 0 || deleteLoading === role.id}
                  className="inline-flex items-center justify-center px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {deleteLoading === role.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRoles.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron roles</h3>
          <p className="text-gray-500">Intenta ajustar tus criterios de búsqueda o filtros.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredRoles.length)}</span> de{' '}
                <span className="font-medium">{filteredRoles.length}</span> resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === currentPage
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title={selectedRole ? 'Editar Rol' : 'Crear Nuevo Rol'}
        size="lg"
      >
        <RoleForm
          role={selectedRole}
          availablePermissions={permissions}
          onSubmit={handleRoleSubmit}
          onCancel={() => setShowRoleModal(false)}
        />
      </Modal>
    </div>
  );
};

export default RoleManagement;