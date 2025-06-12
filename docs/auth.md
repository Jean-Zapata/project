# Autenticación

## Descripción General

El sistema utiliza un sistema de autenticación basado en JWT (JSON Web Tokens) con las siguientes características:

- Tokens de acceso con expiración de 4 horas
- Almacenamiento seguro de contraseñas con bcrypt
- Manejo de sesiones múltiples
- Protección contra ataques comunes

## Flujo de Autenticación

### 1. Registro de Usuario

```typescript
// Ejemplo de registro
const registerData = {
  email: "usuario@ejemplo.com",
  password: "contraseña123",
  firstName: "Juan",
  lastName: "Pérez",
  roleId: 2 // ID del rol EMPLEADO
};

const response = await authService.register(registerData);
```

### 2. Inicio de Sesión

```typescript
// Ejemplo de login
const loginData = {
  username: "usuario@ejemplo.com",
  password: "contraseña123"
};

const response = await authService.login(loginData.username, loginData.password);
```

### 3. Manejo de Sesiones

```typescript
// Ejemplo de validación de sesión
const isValid = await authService.validateSession(token);

// Ejemplo de cierre de sesión
await authService.logout(token);
```

## Estructura de Tokens

### Token de Acceso
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user_id",
    "username": "username",
    "role": "role_name",
    "iat": "timestamp",
    "exp": "timestamp"
  }
}
```

## Roles y Permisos

### Roles Predefinidos

1. **ADMIN**
   - Acceso total al sistema
   - Gestión de usuarios
   - Gestión de roles
   - Monitoreo de sesiones

2. **EMPLEADO**
   - Acceso limitado a consultas
   - Perfil propio
   - Operaciones básicas

## Seguridad

### Protección de Contraseñas

```typescript
// Hash de contraseña
const hashedPassword = await bcrypt.hash(password, 10);

// Verificación de contraseña
const isValid = await bcrypt.compare(password, hashedPassword);
```

### Headers de Seguridad

```typescript
// Configuración de Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
```

### Protección contra Ataques

1. **Rate Limiting**
   ```typescript
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutos
     max: 100 // límite de 100 requests por ventana
   });
   ```

2. **CORS**
   ```typescript
   app.use(cors({
     origin: process.env.ALLOWED_ORIGINS.split(','),
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
     allowedHeaders: ['Content-Type', 'Authorization']
   }));
   ```

3. **XSS Protection**
   ```typescript
   app.use(helmet.xssFilter());
   ```

## Manejo de Errores

### Errores Comunes

1. **Credenciales Inválidas**
   ```json
   {
     "message": "Credenciales inválidas",
     "code": "AUTH_001"
   }
   ```

2. **Token Expirado**
   ```json
   {
     "message": "Token expirado",
     "code": "AUTH_002"
   }
   ```

3. **Sesión Inactiva**
   ```json
   {
     "message": "Sesión inactiva",
     "code": "AUTH_003"
   }
   ```

## Mejores Prácticas

1. **Almacenamiento de Tokens**
   - Usar HttpOnly cookies para tokens
   - Implementar refresh tokens
   - No almacenar tokens en localStorage

2. **Validación de Entrada**
   - Sanitizar datos de entrada
   - Validar formato de email
   - Requerir contraseñas fuertes

3. **Logging y Auditoría**
   - Registrar intentos de login
   - Monitorear sesiones activas
   - Alertar sobre actividades sospechosas

## Ejemplos de Uso

### Login con React

```typescript
const LoginComponent = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authService.login(
        credentials.username,
        credentials.password
      );
      // Manejar respuesta exitosa
    } catch (error) {
      // Manejar error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={credentials.username}
        onChange={(e) => setCredentials({
          ...credentials,
          username: e.target.value
        })}
      />
      <input
        type="password"
        value={credentials.password}
        onChange={(e) => setCredentials({
          ...credentials,
          password: e.target.value
        })}
      />
      <button type="submit">Iniciar Sesión</button>
    </form>
  );
};
```

### Protección de Rutas

```typescript
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};
```

### Interceptor de Axios

```typescript
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Manejar token expirado
      await authService.refreshToken();
    }
    return Promise.reject(error);
  }
);
``` 