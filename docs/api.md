# API Documentation

## Base URL
```
http://localhost:9898/api
```

## Autenticación

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "ip": "string",
  "userAgent": "string"
}
```

**Response (200 OK):**
```json
{
  "id": "number",
  "token": "string",
  "fechaInicio": "string",
  "fechaExpiracion": "string",
  "usuario": {
    "id": "number",
    "username": "string",
    "email": "string",
    "activo": "boolean",
    "rol": {
      "id": "number",
      "nombre": "string",
      "descripcion": "string"
    }
  }
}
```

### Register
```http
POST /auth/register
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "email": "string",
  "activo": "boolean",
  "rolId": "number"
}
```

**Response (201 Created):**
```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "activo": "boolean",
  "fechaCreacion": "string",
  "rol": {
    "id": "number",
    "nombre": "string",
    "descripcion": "string"
  }
}
```

### Logout
```http
POST /auth/logout
```

**Request Body:**
```json
{
  "token": "string"
}
```

**Response (200 OK):**
```json
{
  "message": "Sesión cerrada exitosamente"
}
```

## Usuarios

### Get All Users
```http
GET /usuarios
```

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 10)
- `search`: string (optional)
- `sort`: string (optional)
- `order`: "ASC" | "DESC" (default: "ASC")

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "number",
      "username": "string",
      "email": "string",
      "activo": "boolean",
      "fechaCreacion": "string",
      "ultimoLogin": "string",
      "rol": {
        "id": "number",
        "nombre": "string",
        "descripcion": "string"
      }
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

### Get User by ID
```http
GET /usuarios/:id
```

**Response (200 OK):**
```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "activo": "boolean",
  "fechaCreacion": "string",
  "ultimoLogin": "string",
  "rol": {
    "id": "number",
    "nombre": "string",
    "descripcion": "string"
  },
  "empleado": {
    "id": "number",
    "nombres": "string",
    "apellidos": "string",
    "dni": "string",
    "email": "string",
    "telefono": "string",
    "direccion": "string",
    "fechaNacimiento": "string",
    "fechaIngreso": "string",
    "salario": "number",
    "estado": "string"
  }
}
```

### Create User
```http
POST /usuarios
```

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "rolId": "number",
  "activo": "boolean",
  "empleado": {
    "nombres": "string",
    "apellidos": "string",
    "dni": "string",
    "email": "string",
    "telefono": "string",
    "direccion": "string",
    "fechaNacimiento": "string",
    "fechaIngreso": "string",
    "salario": "number",
    "estado": "string"
  }
}
```

**Response (201 Created):**
```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "activo": "boolean",
  "fechaCreacion": "string",
  "rol": {
    "id": "number",
    "nombre": "string",
    "descripcion": "string"
  }
}
```

### Update User
```http
PUT /usuarios/:id
```

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "rolId": "number",
  "activo": "boolean",
  "empleado": {
    "nombres": "string",
    "apellidos": "string",
    "dni": "string",
    "email": "string",
    "telefono": "string",
    "direccion": "string",
    "fechaNacimiento": "string",
    "fechaIngreso": "string",
    "salario": "number",
    "estado": "string"
  }
}
```

**Response (200 OK):**
```json
{
  "id": "number",
  "username": "string",
  "email": "string",
  "activo": "boolean",
  "fechaCreacion": "string",
  "rol": {
    "id": "number",
    "nombre": "string",
    "descripcion": "string"
  }
}
```

### Delete User
```http
DELETE /usuarios/:id
```

**Response (200 OK):**
```json
{
  "message": "Usuario eliminado exitosamente"
}
```

## Roles

### Get All Roles
```http
GET /roles
```

**Response (200 OK):**
```json
[
  {
    "id": "number",
    "nombre": "string",
    "descripcion": "string",
    "activo": "boolean",
    "fechaCreacion": "string"
  }
]
```

### Get Role by ID
```http
GET /roles/:id
```

**Response (200 OK):**
```json
{
  "id": "number",
  "nombre": "string",
  "descripcion": "string",
  "activo": "boolean",
  "fechaCreacion": "string"
}
```

## Sesiones

### Get Active Sessions
```http
GET /sesiones
```

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 10)
- `search`: string (optional)
- `sort`: string (optional)
- `order`: "ASC" | "DESC" (default: "ASC")

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "number",
      "usuario": {
        "id": "number",
        "username": "string",
        "email": "string"
      },
      "fechaInicio": "string",
      "fechaExpiracion": "string",
      "activa": "boolean",
      "ipAddress": "string",
      "userAgent": "string"
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

## Códigos de Error

### 400 Bad Request
```json
{
  "message": "string",
  "errors": [
    {
      "field": "string",
      "message": "string"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "message": "No autorizado"
}
```

### 403 Forbidden
```json
{
  "message": "Acceso denegado"
}
```

### 404 Not Found
```json
{
  "message": "Recurso no encontrado"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error interno del servidor"
}
```

## Rate Limiting

- 100 requests por minuto por IP
- 1000 requests por hora por IP

## Seguridad

- Todas las rutas requieren autenticación excepto `/auth/login` y `/auth/register`
- Los tokens JWT expiran después de 4 horas
- Las contraseñas se almacenan con hash bcrypt
- Se implementa CORS para dominios específicos
- Se utilizan headers de seguridad (Helmet) 