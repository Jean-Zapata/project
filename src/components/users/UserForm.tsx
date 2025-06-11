import React, { useState, useEffect } from "react";
import { Usuario } from "../../types";
import { useToast } from "../../context/ToastContext";
import roleService from "../services/roleService";

interface UserFormProps {
  user?: Usuario | null;
  onSubmit: (userData: any) => void;
  onCancel: () => void;
}

interface FormData {
  username: string;
  password: string;
  email: string;
  roleId: string;
  isActive: boolean;
  employee: {
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

// Usar la interface Role del servicio
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  userCount: number;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    email: '',
    roleId: '1',
    isActive: true,
    employee: {
      nombres: '',
      apellidos: '',
      dni: '',
      email: '',
      telefono: '',
      direccion: '',
      fechaNacimiento: '',
      fechaIngreso: new Date().toISOString().split('T')[0], // Fecha actual por defecto
      salario: undefined
    }
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        password: '',
        email: user.email,
        roleId: user.role.id.toString(),
        isActive: user.isActive,
        employee: {
          nombres: user.employee?.firstName || '',
          apellidos: user.employee?.lastName || '',
          dni: user.employee?.dni || '',
          email: user.employee?.email || '',
          telefono: user.employee?.phone || '',
          direccion: user.employee?.address || '',
          fechaNacimiento: user.employee?.birthDate || '',
          fechaIngreso: user.employee?.hireDate || new Date().toISOString().split('T')[0],
          salario: user.employee?.salary || undefined
        }
      });
    }
  }, [user]);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setRolesLoading(true);
      const rolesData = await roleService.getAllRoles();
      const activeRoles = rolesData.filter(role => role.isActive);
      setRoles(activeRoles);
    } catch (error) {
      setErrors(prev => ({ ...prev, roles: 'Error al cargar los roles. Por favor, recarga la página.' }));
    } finally {
      setRolesLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username?.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    }

    if (!user && !formData.password?.trim()) {
      newErrors.password = 'La contraseña es requerida';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.roleId) {
      newErrors.roleId = 'El rol es requerido';
    }

    if (formData.employee.nombres?.trim() || formData.employee.apellidos?.trim()) {
      if (!formData.employee.nombres?.trim()) {
        newErrors.nombres = 'El nombre es requerido';
      }
      if (!formData.employee.apellidos?.trim()) {
        newErrors.apellidos = 'El apellido es requerido';
      }
      if (!formData.employee.dni?.trim()) {
        newErrors.dni = 'El DNI es requerido';
      }
      if (!formData.employee.email?.trim()) {
        newErrors.employeeEmail = 'El email del empleado es requerido';
      } else if (!/\S+@\S+\.\S+/.test(formData.employee.email)) {
        newErrors.employeeEmail = 'Email inválido';
      }
      if (!formData.employee.fechaIngreso) {
        newErrors.fechaIngreso = 'La fecha de ingreso es requerida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      roleId: Number(formData.roleId),
      isActive: formData.isActive,
      ...(formData.password.trim() && { password: formData.password.trim() }),
      employee: (formData.employee.nombres?.trim() && formData.employee.apellidos?.trim()) ? {
        nombres: formData.employee.nombres.trim(),
        apellidos: formData.employee.apellidos.trim(),
        dni: formData.employee.dni.trim(),
        email: formData.employee.email.trim(),
        telefono: formData.employee.telefono?.trim() || undefined,
        direccion: formData.employee.direccion?.trim() || undefined,
        fechaNacimiento: formData.employee.fechaNacimiento || undefined,
        fechaIngreso: formData.employee.fechaIngreso,
        salario: formData.employee.salario || undefined
      } : undefined
    };

    onSubmit(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? (value ? Number(value) : undefined) : value;

    setFormData(prev => ({
      ...prev,
      employee: {
        ...prev.employee,
        [name]: finalValue
      }
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de Usuario *
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.username ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
            placeholder="Ingrese nombre de usuario"
          />
          {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Contraseña {!user && '*'}
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
            placeholder={user ? "Dejar vacío para mantener actual" : "Ingrese contraseña"}
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
          placeholder="Ingrese email"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 mb-2">
            Rol *
          </label>
          <select
            id="roleId"
            name="roleId"
            value={formData.roleId}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.roleId ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
            disabled={rolesLoading}
          >
            <option value="">Seleccione un rol</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          {errors.roleId && <p className="mt-1 text-sm text-red-600">{errors.roleId}</p>}
          {rolesLoading && <p className="mt-1 text-sm text-gray-500">Cargando roles...</p>}
          {!rolesLoading && roles.length === 0 && <p className="mt-1 text-sm text-orange-600">No se encontraron roles activos</p>}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
            Usuario Activo
          </label>
        </div>
      </div>

      {/* Employee Information */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Empleado (Opcional)</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="nombres" className="block text-sm font-medium text-gray-700 mb-2">
              Nombres
            </label>
            <input
              type="text"
              id="nombres"
              name="nombres"
              value={formData.employee.nombres}
              onChange={handleEmployeeChange}
              className={`w-full px-3 py-2 border rounded-lg ${errors.nombres ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
              placeholder="Ingrese nombres"
            />
            {errors.nombres && <p className="mt-1 text-sm text-red-600">{errors.nombres}</p>}
          </div>

          <div>
            <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-2">
              Apellidos
            </label>
            <input
              type="text"
              id="apellidos"
              name="apellidos"
              value={formData.employee.apellidos}
              onChange={handleEmployeeChange}
              className={`w-full px-3 py-2 border rounded-lg ${errors.apellidos ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
              placeholder="Ingrese apellidos"
            />
            {errors.apellidos && <p className="mt-1 text-sm text-red-600">{errors.apellidos}</p>}
          </div>
        </div>

        {/* Additional fields for employee data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-2">
              DNI
            </label>
            <input
              type="text"
              id="dni"
              name="dni"
              value={formData.employee.dni}
              onChange={handleEmployeeChange}
              className={`w-full px-3 py-2 border rounded-lg ${errors.dni ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
              placeholder="Ingrese DNI"
            />
            {errors.dni && <p className="mt-1 text-sm text-red-600">{errors.dni}</p>}
          </div>

          <div>
            <label htmlFor="employeeEmail" className="block text-sm font-medium text-gray-700 mb-2">
              Email del Empleado
            </label>
            <input
              type="email"
              id="employeeEmail"
              name="email"
              value={formData.employee.email}
              onChange={handleEmployeeChange}
              className={`w-full px-3 py-2 border rounded-lg ${errors.employeeEmail ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
              placeholder="Ingrese email del empleado"
            />
            {errors.employeeEmail && <p className="mt-1 text-sm text-red-600">{errors.employeeEmail}</p>}
          </div>
        </div>

        {/* More employee fields like phone, salary, etc. */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.employee.telefono || ''}
              onChange={handleEmployeeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Ingrese teléfono"
            />
          </div>

          <div>
            <label htmlFor="salario" className="block text-sm font-medium text-gray-700 mb-2">
              Salario
            </label>
            <input
              type="number"
              id="salario"
              name="salario"
              value={formData.employee.salario || ''}
              onChange={handleEmployeeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Ingrese salario"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              id="fechaNacimiento"
              name="fechaNacimiento"
              value={formData.employee.fechaNacimiento || ''}
              onChange={handleEmployeeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label htmlFor="fechaIngreso" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Ingreso
            </label>
            <input
              type="date"
              id="fechaIngreso"
              name="fechaIngreso"
              value={formData.employee.fechaIngreso}
              onChange={handleEmployeeChange}
              className={`w-full px-3 py-2 border rounded-lg ${errors.fechaIngreso ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
            />
            {errors.fechaIngreso && <p className="mt-1 text-sm text-red-600">{errors.fechaIngreso}</p>}
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
            Dirección
          </label>
          <input
            type="text"
            id="direccion"
            name="direccion"
            value={formData.employee.direccion || ''}
            onChange={handleEmployeeChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Ingrese dirección"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          {user ? 'Actualizar Usuario' : 'Crear Usuario'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
