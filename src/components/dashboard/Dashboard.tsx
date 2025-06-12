import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import EmployeeDashboard from './EmployeeDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Verificar si el usuario es admin basándose en el nombre del rol o el ID
  const isAdmin = () => {
    if (!user?.role) return false;
    
    // Verificar por nombre del rol (más flexible)
    const roleName = user.role.nombre?.toLowerCase();
    if (roleName === 'admin' || roleName === 'administrator' || roleName === 'administrador' || roleName === 'ADMINISTRADOR') {
      return true;
    }
    
    // Verificar por ID del rol (más específico)
    // Asumiendo que el rol de admin tiene ID 1 basándose en tu código demo
    if (user.role.id === 1) {
      return true;
    }
    
    return false;
  };

  // Debug: mostrar información del usuario en consola
  console.log('Usuario actual:', user);
  console.log('Rol del usuario:', user?.role);
  console.log('¿Es admin?', isAdmin());

  if (isAdmin()) {
    return <AdminDashboard />;
  }

  return <EmployeeDashboard />;
};

export default Dashboard;