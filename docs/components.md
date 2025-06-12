# Componentes

## Componentes de Autenticación

### Login.tsx
```typescript
interface LoginProps {
  onLoginSuccess: (userData: UserAuthData) => void;
  onLoginError: (error: Error) => void;
}
```

**Características:**
- Formulario de inicio de sesión
- Validación de campos
- Manejo de errores
- Soporte para credenciales demo
- Redirección post-login

**Uso:**
```typescript
<Login 
  onLoginSuccess={(userData) => {
    // Manejar login exitoso
  }}
  onLoginError={(error) => {
    // Manejar error
  }}
/>
```

### Register.tsx
```typescript
interface RegisterProps {
  onRegisterSuccess: (userData: UserAuthData) => void;
  onRegisterError: (error: Error) => void;
}
```

**Características:**
- Formulario de registro
- Validación de campos
- Generación automática de username
- Selección de rol
- Redirección post-registro

**Uso:**
```typescript
<Register 
  onRegisterSuccess={(userData) => {
    // Manejar registro exitoso
  }}
  onRegisterError={(error) => {
    // Manejar error
  }}
/>
```

### ForgotPassword.tsx
```typescript
interface ForgotPasswordProps {
  onResetRequest: (email: string) => Promise<void>;
  onResetError: (error: Error) => void;
}
```

**Características:**
- Formulario de recuperación
- Validación de email
- Confirmación de envío
- Manejo de errores

**Uso:**
```typescript
<ForgotPassword 
  onResetRequest={async (email) => {
    // Manejar solicitud de reset
  }}
  onResetError={(error) => {
    // Manejar error
  }}
/>
```

## Componentes de Usuario

### UserManagement.tsx
```typescript
interface UserManagementProps {
  onUserAction: (action: 'create' | 'update' | 'delete', user: User) => void;
  onError: (error: Error) => void;
}
```

**Características:**
- Lista de usuarios
- Filtrado y búsqueda
- Paginación
- Acciones CRUD
- Confirmación de acciones

**Uso:**
```typescript
<UserManagement 
  onUserAction={(action, user) => {
    // Manejar acción de usuario
  }}
  onError={(error) => {
    // Manejar error
  }}
/>
```

### UserForm.tsx
```typescript
interface UserFormProps {
  user?: User;
  onSubmit: (userData: Partial<User>) => Promise<void>;
  onCancel: () => void;
}
```

**Características:**
- Formulario de usuario
- Validación de campos
- Modo edición/creación
- Campos condicionales
- Manejo de roles

**Uso:**
```typescript
<UserForm 
  user={existingUser}
  onSubmit={async (userData) => {
    // Manejar envío de formulario
  }}
  onCancel={() => {
    // Manejar cancelación
  }}
/>
```

## Componentes de Sesión

### SessionManagement.tsx
```typescript
interface SessionManagementProps {
  onSessionAction: (action: 'view' | 'terminate', session: Session) => void;
  onError: (error: Error) => void;
}
```

**Características:**
- Lista de sesiones activas
- Filtrado por usuario/IP
- Detalles de sesión
- Terminación de sesión
- Monitoreo en tiempo real

**Uso:**
```typescript
<SessionManagement 
  onSessionAction={(action, session) => {
    // Manejar acción de sesión
  }}
  onError={(error) => {
    // Manejar error
  }}
/>
```

## Componentes de Layout

### Layout.tsx
```typescript
interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showSidebar?: boolean;
}
```

**Características:**
- Header con navegación
- Sidebar responsive
- Breadcrumbs
- Notificaciones
- Perfil de usuario

**Uso:**
```typescript
<Layout 
  title="Dashboard"
  showSidebar={true}
>
  {/* Contenido de la página */}
</Layout>
```

### Sidebar.tsx
```typescript
interface SidebarProps {
  items: MenuItem[];
  onItemClick: (item: MenuItem) => void;
  collapsed?: boolean;
}
```

**Características:**
- Menú colapsable
- Iconos
- Submenús
- Indicador de ruta activa
- Permisos basados en rol

**Uso:**
```typescript
<Sidebar 
  items={menuItems}
  onItemClick={(item) => {
    // Manejar clic en ítem
  }}
  collapsed={false}
/>
```

## Componentes de UI

### DataTable.tsx
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: Column[];
  onRowClick?: (row: T) => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  totalRows: number;
  page: number;
  rowsPerPage: number;
}
```

**Características:**
- Paginación
- Ordenamiento
- Filtrado
- Selección de filas
- Acciones personalizadas

**Uso:**
```typescript
<DataTable 
  data={users}
  columns={userColumns}
  onRowClick={(user) => {
    // Manejar clic en fila
  }}
  onSort={(field, direction) => {
    // Manejar ordenamiento
  }}
  totalRows={100}
  page={1}
  rowsPerPage={10}
/>
```

### FormField.tsx
```typescript
interface FormFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'password' | 'email' | 'number';
  value: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}
```

**Características:**
- Validación
- Mensajes de error
- Tipos de campo
- Estado disabled
- Estado required

**Uso:**
```typescript
<FormField 
  name="email"
  label="Email"
  type="email"
  value={email}
  onChange={(value) => {
    // Manejar cambio
  }}
  error={emailError}
  required
/>
```

## Componentes de Utilidad

### LoadingSpinner.tsx
```typescript
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
}
```

**Características:**
- Tamaños predefinidos
- Color personalizable
- Texto opcional
- Animación suave

**Uso:**
```typescript
<LoadingSpinner 
  size="medium"
  color="primary"
  text="Cargando..."
/>
```

### ErrorBoundary.tsx
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}
```

**Características:**
- Captura de errores
- UI de fallback
- Logging de errores
- Recuperación de errores

**Uso:**
```typescript
<ErrorBoundary 
  fallback={<ErrorComponent />}
  onError={(error, errorInfo) => {
    // Manejar error
  }}
>
  {/* Componentes hijos */}
</ErrorBoundary>
```

### Toast.tsx
```typescript
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}
```

**Características:**
- Tipos de mensaje
- Duración configurable
- Animación de entrada/salida
- Cierre automático

**Uso:**
```typescript
<Toast 
  message="Operación exitosa"
  type="success"
  duration={3000}
  onClose={() => {
    // Manejar cierre
  }}
/>
``` 