# Guía de Seguridad

## Autenticación

### JWT (JSON Web Tokens)

#### Estructura del Token

```typescript
interface JWT {
  header: {
    alg: 'HS256';
    typ: 'JWT';
  };
  payload: {
    sub: string;      // ID del usuario
    iat: number;      // Fecha de emisión
    exp: number;      // Fecha de expiración
    role: string;     // Rol del usuario
  };
  signature: string;  // Firma HMAC SHA-256
}
```

#### Implementación

```typescript
// Generación de token
const generateToken = (user: User): string => {
  const payload = {
    sub: user.id,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (4 * 60 * 60), // 4 horas
    role: user.role
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    algorithm: 'HS256'
  });
};

// Verificación de token
const verifyToken = (token: string): JWT => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET) as JWT;
  } catch (error) {
    throw new UnauthorizedError('Token inválido');
  }
};
```

### Refresh Tokens

```typescript
interface RefreshToken {
  id: string;
  userId: number;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// Generación de refresh token
const generateRefreshToken = async (userId: number): Promise<RefreshToken> => {
  const token = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

  return await prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt
    }
  });
};
```

## Autorización

### RBAC (Role-Based Access Control)

```typescript
enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST'
}

enum Permission {
  READ_USERS = 'READ_USERS',
  WRITE_USERS = 'WRITE_USERS',
  DELETE_USERS = 'DELETE_USERS',
  READ_ROLES = 'READ_ROLES',
  WRITE_ROLES = 'WRITE_ROLES'
}

const rolePermissions = new Map<Role, Permission[]>([
  [Role.ADMIN, Object.values(Permission)],
  [Role.USER, [Permission.READ_USERS]],
  [Role.GUEST, []]
]);
```

### Middleware de Autorización

```typescript
const authorize = (requiredPermissions: Permission[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const userPermissions = rolePermissions.get(user.role) || [];

    const hasPermission = requiredPermissions.every(
      permission => userPermissions.includes(permission)
    );

    if (!hasPermission) {
      throw new ForbiddenError('No tiene permisos para realizar esta acción');
    }

    next();
  };
};
```

## Protección de Datos

### Encriptación

#### Encriptación de Contraseñas

```typescript
const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
```

#### Encriptación de Datos Sensibles

```typescript
const encryptData = (data: string): string => {
  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    Buffer.from(process.env.ENCRYPTION_KEY, 'hex'),
    Buffer.from(process.env.ENCRYPTION_IV, 'hex')
  );

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${encrypted}:${authTag.toString('hex')}`;
};

const decryptData = (encryptedData: string): string => {
  const [encrypted, authTag] = encryptedData.split(':');
  
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(process.env.ENCRYPTION_KEY, 'hex'),
    Buffer.from(process.env.ENCRYPTION_IV, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};
```

### Sanitización

#### Sanitización de Inputs

```typescript
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Eliminar < y >
    .replace(/javascript:/gi, '') // Eliminar javascript:
    .trim();
};

const sanitizeObject = <T extends object>(obj: T): T => {
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key] as string);
    }
  }

  return sanitized;
};
```

## Prevención de Ataques

### XSS (Cross-Site Scripting)

```typescript
// Middleware de protección XSS
const xssProtection = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
};

// Sanitización de HTML
const sanitizeHtml = (html: string): string => {
  return sanitize(html, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a'],
    allowedAttributes: {
      a: ['href']
    }
  });
};
```

### CSRF (Cross-Site Request Forgery)

```typescript
// Middleware CSRF
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Generación de token CSRF
app.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

### SQL Injection

```typescript
// Uso de parámetros preparados
const getUserById = async (id: number): Promise<User> => {
  return await prisma.user.findUnique({
    where: { id }
  });
};

// Validación de tipos
const validateId = (id: unknown): number => {
  if (typeof id !== 'number' || isNaN(id)) {
    throw new BadRequestError('ID inválido');
  }
  return id;
};
```

## Headers de Seguridad

```typescript
// Middleware de headers de seguridad
const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=()');
  next();
};
```

## Rate Limiting

```typescript
// Configuración de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana
  message: 'Demasiadas peticiones, por favor intente más tarde'
});

// Aplicar a rutas específicas
app.use('/api/auth', limiter);
```

## Logging de Seguridad

```typescript
// Logger de seguridad
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'security.log' })
  ]
});

// Middleware de logging
const securityLogging = (req: Request, res: Response, next: NextFunction) => {
  const logData = {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    method: req.method,
    path: req.path,
    userAgent: req.get('user-agent'),
    userId: req.user?.id
  };

  securityLogger.info('Request', logData);
  next();
};
```

## Auditoría

```typescript
// Modelo de auditoría
interface AuditLog {
  id: number;
  userId: number;
  action: string;
  resource: string;
  resourceId: string;
  changes: object;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

// Servicio de auditoría
const auditService = {
  async log(action: string, resource: string, resourceId: string, changes: object) {
    return await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action,
        resource,
        resourceId,
        changes,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        timestamp: new Date()
      }
    });
  }
};
```

## Políticas de Contraseñas

```typescript
// Validación de contraseñas
const validatePassword = (password: string): boolean => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
};
```

## Recuperación de Contraseña

```typescript
// Generación de token de recuperación
const generatePasswordResetToken = async (userId: number): Promise<string> => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 3600000); // 1 hora

  await prisma.passwordReset.create({
    data: {
      userId,
      token,
      expiresAt
    }
  });

  return token;
};

// Verificación de token
const verifyPasswordResetToken = async (token: string): Promise<boolean> => {
  const reset = await prisma.passwordReset.findFirst({
    where: {
      token,
      expiresAt: {
        gt: new Date()
      },
      used: false
    }
  });

  return !!reset;
};
```

## Sesiones

```typescript
// Gestión de sesiones
const sessionService = {
  async createSession(userId: number): Promise<Session> {
    return await prisma.session.create({
      data: {
        userId,
        token: crypto.randomBytes(32).toString('hex'),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
      }
    });
  },

  async invalidateSession(sessionId: number): Promise<void> {
    await prisma.session.update({
      where: { id: sessionId },
      data: { active: false }
    });
  }
};
``` 