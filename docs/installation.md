# Guía de Instalación

## Requisitos Previos

### Sistema Operativo
- Windows 10/11
- macOS 10.15 o superior
- Linux (Ubuntu 20.04 o superior)

### Software Necesario
- Node.js 18.x o superior
- PostgreSQL 14.x o superior
- Git
- NPM 8.x o superior
- Docker (opcional)

## Instalación del Proyecto

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Jean-Zapata/project
cd proyecto
```

### 2. Instalar Dependencias

```bash
# Instalar dependencias del frontend
cd frontend
npm install

# Instalar dependencias del backend
cd ../backend
npm install
```

### 3. Configuración del Entorno

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:9898/api
REACT_APP_ENV=development
```

#### Backend (.env)
```env
# Servidor
PORT=9898
NODE_ENV=development

# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=proyecto_db
DB_USER=postgres
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=tu_secret_key
JWT_EXPIRATION=4h

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

### 4. Configuración de la Base de Datos

```bash
# Crear base de datos
psql -U postgres
CREATE DATABASE proyecto_db;

# Ejecutar migraciones
cd backend
npm run migration:run

# Cargar datos iniciales
npm run seed:run
```

### 5. Iniciar el Proyecto

#### Desarrollo

```bash
# Iniciar backend
cd backend
npm run dev

# Iniciar frontend (en otra terminal)
cd frontend
npm start
```

#### Producción

```bash
# Construir frontend
cd frontend
npm run build

# Iniciar backend en producción
cd backend
npm run start:prod
```

## Instalación con Docker

### 1. Construir Imágenes

```bash
docker-compose build
```

### 2. Iniciar Contenedores

```bash
docker-compose up -d
```

### 3. Verificar Contenedores

```bash
docker-compose ps
```

## Verificación de la Instalación

### 1. Verificar Backend
```bash
curl http://localhost:9898/api/health
```

### 2. Verificar Frontend
Abrir en el navegador:
```
http://localhost:3000
```

### 3. Verificar Base de Datos
```bash
psql -U postgres -d proyecto_db -c "\dt"
```

## Solución de Problemas

### Problemas Comunes

1. **Error de Conexión a la Base de Datos**
   ```bash
   # Verificar que PostgreSQL está corriendo
   sudo service postgresql status
   
   # Verificar credenciales
   psql -U postgres -d proyecto_db
   ```

2. **Error de Puerto en Uso**
   ```bash
   # Verificar procesos usando el puerto
   netstat -ano | findstr :9898
   
   # Matar proceso
   taskkill /PID <pid> /F
   ```

3. **Error de Dependencias**
   ```bash
   # Limpiar caché de npm
   npm cache clean --force
   
   # Reinstalar dependencias
   rm -rf node_modules
   npm install
   ```

### Logs

#### Backend
```bash
# Ver logs en desarrollo
npm run dev

# Ver logs en producción
pm2 logs
```

#### Frontend
```bash
# Ver logs de build
npm run build

# Ver logs de desarrollo
npm start
```

## Actualización del Proyecto

### 1. Actualizar Código
```bash
git pull origin main
```

### 2. Actualizar Dependencias
```bash
# Frontend
cd frontend
npm update

# Backend
cd backend
npm update
```

### 3. Ejecutar Migraciones
```bash
cd backend
npm run migration:run
```

## Desinstalación

### 1. Detener Servicios
```bash
# Detener backend
cd backend
npm run stop

# Detener frontend
cd frontend
npm run stop
```

### 2. Eliminar Base de Datos
```bash
psql -U postgres
DROP DATABASE proyecto_db;
```

### 3. Eliminar Archivos
```bash
# Eliminar directorio del proyecto
rm -rf proyecto

# Eliminar dependencias globales (opcional)
npm uninstall -g typescript
npm uninstall -g ts-node
```

## Soporte

Para reportar problemas o solicitar ayuda:

1. Crear un issue en GitHub
2. Contactar al equipo de soporte
3. Revisar la documentación en línea 