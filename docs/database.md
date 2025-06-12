# Documentación de Base de Datos

## Esquema de Base de Datos

### Tablas Principales

#### Usuarios (users)

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_login TIMESTAMP,
    rol_id INTEGER REFERENCES roles(id)
);
```

#### Roles (roles)

```sql
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Permisos (permissions)

```sql
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Roles_Permisos (role_permissions)

```sql
CREATE TABLE role_permissions (
    rol_id INTEGER REFERENCES roles(id),
    permiso_id INTEGER REFERENCES permissions(id),
    PRIMARY KEY (rol_id, permiso_id)
);
```

#### Sesiones (sessions)

```sql
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    token VARCHAR(255) NOT NULL,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL,
    activa BOOLEAN DEFAULT true
);
```

## Relaciones

### Diagrama ER

```
users 1--N sessions
users N--1 roles
roles N--M permissions
```

### Restricciones

1. **Claves Foráneas**
   - `users.rol_id` -> `roles.id`
   - `sessions.user_id` -> `users.id`
   - `role_permissions.rol_id` -> `roles.id`
   - `role_permissions.permiso_id` -> `permissions.id`

2. **Unicidad**
   - `users.username`
   - `users.email`
   - `roles.nombre`
   - `permissions.nombre`

## Índices

### Índices Primarios
- `users.id`
- `roles.id`
- `permissions.id`
- `sessions.id`

### Índices Secundarios
```sql
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_role_permissions_rol_id ON role_permissions(rol_id);
CREATE INDEX idx_role_permissions_permiso_id ON role_permissions(permiso_id);
```

## Consultas Comunes

### Autenticación

1. **Verificar Credenciales**
```sql
SELECT id, username, email, password, rol_id
FROM users
WHERE (username = :username OR email = :email)
AND activo = true;
```

2. **Crear Sesión**
```sql
INSERT INTO sessions (user_id, token, fecha_expiracion)
VALUES (:user_id, :token, :fecha_expiracion)
RETURNING id;
```

### Gestión de Usuarios

1. **Listar Usuarios**
```sql
SELECT u.id, u.username, u.email, u.activo, 
       u.fecha_creacion, u.ultimo_login, r.nombre as rol
FROM users u
LEFT JOIN roles r ON u.rol_id = r.id
ORDER BY u.fecha_creacion DESC;
```

2. **Buscar Usuario por ID**
```sql
SELECT u.*, r.nombre as rol
FROM users u
LEFT JOIN roles r ON u.rol_id = r.id
WHERE u.id = :id;
```

### Gestión de Roles

1. **Listar Roles con Permisos**
```sql
SELECT r.*, 
       array_agg(p.nombre) as permisos
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.rol_id
LEFT JOIN permissions p ON rp.permiso_id = p.id
GROUP BY r.id;
```

2. **Verificar Permisos de Usuario**
```sql
SELECT p.nombre
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permiso_id
JOIN roles r ON rp.rol_id = r.id
JOIN users u ON u.rol_id = r.id
WHERE u.id = :user_id;
```

## Mantenimiento

### Backups

```bash
# Backup completo
pg_dump -U postgres proyecto_db > backup.sql

# Backup específico
pg_dump -U postgres -t users proyecto_db > users_backup.sql
```

### Restauración

```bash
# Restaurar backup completo
psql -U postgres proyecto_db < backup.sql

# Restaurar tabla específica
psql -U postgres proyecto_db < users_backup.sql
```

### Mantenimiento Regular

```sql
-- Vacuum
VACUUM ANALYZE;

-- Reindex
REINDEX DATABASE proyecto_db;

-- Estadísticas
ANALYZE;
```

## Optimización

### Configuración

```ini
# postgresql.conf
max_connections = 100
shared_buffers = 256MB
work_mem = 4MB
maintenance_work_mem = 64MB
effective_cache_size = 1GB
```

### Monitoreo

```sql
-- Conexiones activas
SELECT count(*) FROM pg_stat_activity;

-- Tamaño de tablas
SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- Índices no utilizados
SELECT schemaname, tablename, indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

## Seguridad

### Usuarios y Permisos

```sql
-- Crear usuario
CREATE USER app_user WITH PASSWORD 'password';

-- Otorgar permisos
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
```

### Encriptación

```sql
-- Encriptar datos sensibles
CREATE EXTENSION pgcrypto;

-- Función para encriptar
CREATE OR REPLACE FUNCTION encrypt_data(data text)
RETURNS text AS $$
BEGIN
    RETURN encode(encrypt(data::bytea, 'key'::bytea, 'aes'), 'hex');
END;
$$ LANGUAGE plpgsql;
```

## Migraciones

### Estructura

```
migrations/
├── 001_create_users_table.sql
├── 002_create_roles_table.sql
├── 003_create_permissions_table.sql
└── 004_create_sessions_table.sql
```

### Ejemplo de Migración

```sql
-- 001_create_users_table.sql
BEGIN;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_login TIMESTAMP,
    rol_id INTEGER REFERENCES roles(id)
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

COMMIT;
```

## Consideraciones de Rendimiento

### Particionamiento

```sql
-- Particionamiento por fecha
CREATE TABLE sessions (
    id SERIAL,
    user_id INTEGER,
    token VARCHAR(255),
    fecha_inicio TIMESTAMP,
    fecha_expiracion TIMESTAMP,
    activa BOOLEAN
) PARTITION BY RANGE (fecha_inicio);

CREATE TABLE sessions_2024_q1 PARTITION OF sessions
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
```

### Caching

```sql
-- Materializar vistas
CREATE MATERIALIZED VIEW user_roles AS
SELECT u.id, u.username, r.nombre as rol
FROM users u
JOIN roles r ON u.rol_id = r.id;

-- Actualizar vista
REFRESH MATERIALIZED VIEW user_roles;
```

## Respaldo y Recuperación

### Estrategia de Backup

1. **Backups Completos**
   - Diarios
   - Semanales
   - Mensuales

2. **Backups Incrementales**
   - Cada 6 horas
   - Retención de 7 días

3. **WAL Archiving**
   - Archivos WAL
   - Point-in-time recovery

### Recuperación

1. **Recuperación Completa**
   ```bash
   pg_restore -U postgres -d proyecto_db backup.dump
   ```

2. **Point-in-time Recovery**
   ```bash
   pg_restore -U postgres -d proyecto_db --recovery-target-time="2024-01-01 12:00:00" backup.dump
   ``` 