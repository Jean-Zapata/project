import React, { useState, useEffect } from 'react';
import { Shield, Check } from 'lucide-react';

interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
}

interface Role {
  id?: string;
  name: string;
  description: string;
  isActive: boolean;
  permissions: string[]; // Array de códigos de permisos
}

interface RoleFormProps {
  role?: Role | null;
  availablePermissions: Permission[];
  onSubmit: (roleData: {
    name: string;
    description: string;
    isActive: boolean;
    permissions: string[];
  }) => void;
  onCancel: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({ role, availablePermissions, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    isActive: true
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description,
        permissions: [...role.permissions],
        isActive: role.isActive
      });
    }
  }, [role]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del rol es requerido';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'La descripción debe tener al menos 10 caracteres';
    }
    
    if (formData.permissions.length === 0) {
      newErrors.permissions = 'Debe seleccionar al menos un permiso';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim(),
      isActive: formData.isActive,
      permissions: formData.permissions
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : false;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePermissionToggle = (permissionCode: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionCode)
        ? prev.permissions.filter(p => p !== permissionCode)
        : [...prev.permissions, permissionCode]
    }));
    
    if (errors.permissions) {
      setErrors(prev => ({ ...prev, permissions: '' }));
    }
  };

  const selectAllPermissions = () => {
    const activePermissions = availablePermissions
      .filter(p => p.isActive)
      .map(p => p.code);
    
    setFormData(prev => ({
      ...prev,
      permissions: activePermissions
    }));
  };

  const clearAllPermissions = () => {
    setFormData(prev => ({
      ...prev,
      permissions: []
    }));
  };

  const selectCategoryPermissions = (category: string) => {
    const categoryPermissions = availablePermissions
      .filter(p => p.category === category && p.isActive)
      .map(p => p.code);
    
    const allCategorySelected = categoryPermissions.every(code => 
      formData.permissions.includes(code)
    );
    
    if (allCategorySelected) {
      // Deseleccionar todos los permisos de la categoría
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(code => !categoryPermissions.includes(code))
      }));
    } else {
      // Seleccionar todos los permisos de la categoría
      setFormData(prev => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...categoryPermissions])]
      }));
    }
  };

  // Agrupar permisos por categoría
  const groupPermissionsByCategory = () => {
    const grouped: { [key: string]: Permission[] } = {};
    
    availablePermissions
      .filter(p => p.isActive) // Solo mostrar permisos activos
      .forEach(permission => {
        const category = permission.category || 'Sin categoría';
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(permission);
      });
    
    return grouped;
  };

  const permissionsByCategory = groupPermissionsByCategory();

  const getCategorySelectionState = (categoryPermissions: Permission[]) => {
    const categoryPermissionCodes = categoryPermissions.map(p => p.code);
    const selectedCount = categoryPermissionCodes.filter(code => 
      formData.permissions.includes(code)
    ).length;
    
    if (selectedCount === 0) return 'none';
    if (selectedCount === categoryPermissionCodes.length) return 'all';
    return 'partial';
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Rol *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Shield className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Ej: Gerente de Ventas"
            />
          </div>
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Descripción *
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Describe las responsabilidades y alcance de este rol..."
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        <div className="flex items-center">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
            Rol activo (los usuarios pueden ser asignados a este rol)
          </label>
        </div>
      </div>

      {/* Permissions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Permisos *</h3>
            <p className="text-sm text-gray-500">Selecciona los permisos que tendrá este rol</p>
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={selectAllPermissions}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Seleccionar todos
            </button>
            
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={clearAllPermissions}
              className="text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              Limpiar todo
            </button>
          </div>
        </div>

        {errors.permissions && <p className="text-sm text-red-600">{errors.permissions}</p>}

        <div className="space-y-6">
          {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => {
            const selectionState = getCategorySelectionState(categoryPermissions);
            
            return (
              <div key={category} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{category}</h4>
                  <button
                    type="button"
                    onClick={() => selectCategoryPermissions(category)}
                    className={`text-sm font-medium ${
                      selectionState === 'all' 
                        ? 'text-red-600 hover:text-red-800' 
                        : 'text-blue-600 hover:text-blue-800'
                    }`}
                  >
                    {selectionState === 'all' ? 'Deseleccionar todos' : 
                     selectionState === 'partial' ? 'Seleccionar todos' : 'Seleccionar todos'}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {categoryPermissions.map((permission) => (
                    <div key={permission.id} className="flex items-start space-x-3">
                      <div className="flex items-center h-5">
                        <input
                          id={permission.id}
                          type="checkbox"
                          checked={formData.permissions.includes(permission.code)}
                          onChange={() => handlePermissionToggle(permission.code)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <label htmlFor={permission.id} className="text-sm font-medium text-gray-900 cursor-pointer">
                          {permission.name}
                        </label>
                        <p className="text-sm text-gray-500 mt-1">{permission.description}</p>
                        <div className="flex items-center mt-1 space-x-2">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {permission.code}
                          </span>
                          {formData.permissions.includes(permission.code) && (
                            <div className="flex items-center text-green-600">
                              <Check className="h-3 w-3 mr-1" />
                              <span className="text-xs">Seleccionado</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {Object.keys(permissionsByCategory).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No hay permisos disponibles</p>
          </div>
        )}
      </div>

      {/* Selected Permissions Summary */}
      {formData.permissions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Permisos seleccionados ({formData.permissions.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {formData.permissions.slice(0, 10).map((permissionCode) => {
              const permission = availablePermissions.find(p => p.code === permissionCode);
              return (
                <span
                  key={permissionCode}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {permission?.name || permissionCode}
                  <button
                    type="button"
                    onClick={() => handlePermissionToggle(permissionCode)}
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                  >
                    ×
                  </button>
                </span>
              );
            })}
            {formData.permissions.length > 10 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                +{formData.permissions.length - 10} más
              </span>
            )}
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          {role ? 'Actualizar Rol' : 'Crear Rol'}
        </button>
      </div>
    </form>
  );
};

export default RoleForm;