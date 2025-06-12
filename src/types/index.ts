// User Management Types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: string;
  status: 'active' | 'inactive';
  avatar?: string;
  department?: string;
  position?: string;
  hireDate?: string;
  lastLogin?: string;
}

export interface Employee extends User {
  employeeId: string;
  department: string;
  position: string;
  hireDate: string;
  salary?: number;
  manager?: string;
  skills: string[];
  performance: {
    rating: number;
    lastReview: string;
    goals: string[];
  };
}

// Role Management Types
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

// API interface for roles (matches backend structure)
export interface RoleAPI {
  id?: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  fechaCreacion?: string;
  permisos: string[];
}

// Permission Management Types
export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  createdAt?: string;
}

// API interface for permissions (matches backend structure)
export interface PermissionAPI {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  activo: boolean;
  fechaCreacion?: string;
}

// Session Management Types
export interface UserSession {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  loginTime: string;
  logoutTime?: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  duration?: number;
  status: 'active' | 'expired' | 'terminated';
}

// Authentication Types
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: number;
}

// Toast Notification Types
export interface ToastType {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// Form Props Types
export interface RoleFormProps {
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

// Filter and Search Types
export interface FilterOptions {
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  category?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Pagination Types
export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  errors?: string[];
}

export interface ApiListResponse<T> extends ApiResponse<T[]> {
  pagination?: PaginationOptions;
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

// Component State Types
export interface LoadingState {
  [key: string]: boolean;
}

export interface ErrorState {
  [key: string]: string | null;
}

// Table Column Types
export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

// Modal Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

// Dropdown Option Types
export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}