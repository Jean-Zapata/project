import React, { useState, useEffect } from 'react';
import { Users, UserCheck, BarChart3, Calendar, DollarSign } from 'lucide-react';
import usuarioService, { Usuario } from '../services/usuarioService';
import empleadoService from '../services/empleadoService';
import rolService, { Role } from '../../components/services/roleService';

interface Stats {
  activeUsers: number;
  totalUsers: number;
}

interface EmpleadoStats {
  totalEmpleados: number;
  empleadosActivos: number;
  empleadosInactivos: number;
  salarioPromedio: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({ activeUsers: 0, totalUsers: 0 });
  const [empleadoStats, setEmpleadoStats] = useState<EmpleadoStats>({
    totalEmpleados: 0,
    empleadosActivos: 0,
    empleadosInactivos: 0,
    salarioPromedio: 0
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Obtener estadísticas generales
        const statsData = await usuarioService.getStats();
        setStats({
          activeUsers: statsData.activeUsers,
          totalUsers: statsData.activeUsers // Temporalmente usamos activeUsers como total
        });

        const empleadosData = await empleadoService.getEmpleadoStats();
        setEmpleadoStats({
          totalEmpleados: empleadosData.totalEmpleados || 0,
          empleadosActivos: empleadosData.empleadosActivos || 0,
          empleadosInactivos: empleadosData.empleadosInactivos || 0,
          salarioPromedio: empleadosData.salarioPromedio || 0
        });

        // Obtener roles y usuarios
        const rolesData = await rolService.getRoles();
        setRoles(rolesData);

        const usuariosData = await usuarioService.getUsuarios();
        setUsuarios(usuariosData);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-gray-600">
          <Calendar className="w-6 h-6 animate-spin" />
          <span>Cargando datos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Estadísticas de Empleados */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Empleados</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{empleadoStats?.totalEmpleados}</p>
              <div className="mt-2 flex items-center text-sm">
                <span className="text-green-600 mr-2">+{empleadoStats?.empleadosActivos} activos</span>
                <span className="text-red-600">{empleadoStats?.empleadosInactivos} inactivos</span>
              </div>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Estadísticas de Usuarios */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.activeUsers}</p>
              <p className="text-sm text-gray-500 mt-2">de {stats?.totalUsers} totales</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Estadísticas de Roles */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Roles</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{roles.length}</p>
              <p className="text-sm text-gray-500 mt-2">Roles del sistema</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Salario Promedio */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Salario Promedio</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {empleadoStats?.salarioPromedio?.toLocaleString('es-PE', {
                  style: 'currency',
                  currency: 'PEN'
                })}
              </p>
              <p className="text-sm text-gray-500 mt-2">Por empleado</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Usuarios Recientes</h3>
        <div className="space-y-4">
          {usuarios.slice(0, 5).map((usuario) => (
            <div key={usuario.id} className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {usuario.username.split(' ').map((n: string) => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{usuario.username}</p>
                <p className="text-sm text-gray-600">{usuario.email}</p>
              </div>
              <div className="flex items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  usuario.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {usuario.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
