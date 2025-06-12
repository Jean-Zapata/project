import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Settings, 
  FileText,
  BarChart3,
  Clock,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Globe
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, activeTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'employees', label: 'Employees', icon: UserCheck },
    { id: 'roles', label: 'Roles', icon: Shield },
    { id: 'sessions', label: 'Sesiones', icon: Globe },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const employeeMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: UserCheck },
    { id: 'timesheet', label: 'Timesheet', icon: Clock },
    { id: 'documents', label: 'Documents', icon: FileText },
  ];

  const menuItems = user?.role?.name === 'ADMINISTRADOR' ? adminMenuItems : employeeMenuItems;

  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-64'
    } min-h-screen flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg">EmpMS</span>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-1 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-700">
        {!isCollapsed && (
          <div className="mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {user?.role?.name}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;