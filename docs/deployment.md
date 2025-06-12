# Guía de Despliegue

## Requisitos del Sistema

### Servidor de Producción

- CPU: 2+ cores
- RAM: 4GB mínimo
- Disco: 20GB SSD
- SO: Ubuntu 20.04 LTS

### Software Necesario

- Node.js 18.x
- PostgreSQL 14.x
- Nginx
- PM2
- Docker (opcional)
- Git

## Preparación del Entorno

### 1. Actualizar Sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Instalar Dependencias

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Nginx
sudo apt install -y nginx

# PM2
sudo npm install -g pm2
```

### 3. Configurar PostgreSQL

```bash
# Crear base de datos
sudo -u postgres psql
CREATE DATABASE proyecto_db;
CREATE USER app_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE proyecto_db TO app_user;
\q
```

## Despliegue Manual

### 1. Clonar Repositorio

```bash
git clone https://github.com/tu-usuario/proyecto.git
cd proyecto
```

### 2. Configurar Variables de Entorno

```bash
# Frontend (.env.production)
REACT_APP_API_URL=https://api.tudominio.com
REACT_APP_ENV=production

# Backend (.env)
NODE_ENV=production
PORT=9898
DB_HOST=localhost
DB_PORT=5432
DB_NAME=proyecto_db
DB_USER=app_user
DB_PASSWORD=tu_password
JWT_SECRET=tu_secret_key
JWT_EXPIRATION=4h
```

### 3. Construir Frontend

```bash
cd frontend
npm install
npm run build
```

### 4. Configurar Backend

```bash
cd backend
npm install
npm run build
```

### 5. Configurar Nginx

```nginx
# /etc/nginx/sites-available/proyecto
server {
    listen 80;
    server_name tudominio.com;

    # Frontend
    location / {
        root /var/www/proyecto/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:9898;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6. Activar Configuración Nginx

```bash
sudo ln -s /etc/nginx/sites-available/proyecto /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Iniciar Backend con PM2

```bash
cd backend
pm2 start dist/app.js --name "proyecto-backend"
pm2 save
```

## Despliegue con Docker

### 1. Construir Imágenes

```bash
# Frontend
docker build -t proyecto-frontend -f frontend/Dockerfile .

# Backend
docker build -t proyecto-backend -f backend/Dockerfile .
```

### 2. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    image: proyecto-frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  backend:
    image: proyecto-backend
    ports:
      - "9898:9898"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
    depends_on:
      - db

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=proyecto_db
      - POSTGRES_USER=app_user
      - POSTGRES_PASSWORD=tu_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 3. Iniciar Contenedores

```bash
docker-compose up -d
```

## SSL/TLS

### 1. Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obtener Certificado

```bash
sudo certbot --nginx -d tudominio.com
```

### 3. Configuración Nginx con SSL

```nginx
server {
    listen 443 ssl;
    server_name tudominio.com;

    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;

    # Configuración SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Frontend
    location / {
        root /var/www/proyecto/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:9898;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redireccionar HTTP a HTTPS
server {
    listen 80;
    server_name tudominio.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoreo

### 1. Configurar PM2

```bash
# Monitoreo básico
pm2 monit

# Logs
pm2 logs

# Métricas
pm2 status
```

### 2. Configurar Nginx Logs

```nginx
# /etc/nginx/nginx.conf
http {
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
}
```

### 3. Monitoreo de Base de Datos

```bash
# Ver conexiones activas
sudo -u postgres psql -d proyecto_db -c "SELECT * FROM pg_stat_activity;"

# Ver tamaño de tablas
sudo -u postgres psql -d proyecto_db -c "SELECT relname, pg_size_pretty(pg_total_relation_size(relid)) FROM pg_catalog.pg_statio_user_tables ORDER BY pg_total_relation_size(relid) DESC;"
```

## Mantenimiento

### 1. Actualizaciones

```bash
# Actualizar código
git pull origin main

# Reconstruir frontend
cd frontend
npm install
npm run build

# Reiniciar backend
cd backend
npm install
npm run build
pm2 restart proyecto-backend
```

### 2. Backups

```bash
# Backup de base de datos
pg_dump -U app_user proyecto_db > backup_$(date +%Y%m%d).sql

# Backup de archivos
tar -czf proyecto_$(date +%Y%m%d).tar.gz /var/www/proyecto
```

### 3. Limpieza

```bash
# Limpiar logs antiguos
find /var/log/nginx -name "*.log" -mtime +30 -delete

# Limpiar backups antiguos
find /backup -name "backup_*.sql" -mtime +7 -delete
```

## Escalabilidad

### 1. Load Balancer

```nginx
# /etc/nginx/nginx.conf
upstream backend {
    server 127.0.0.1:9898;
    server 127.0.0.1:9899;
    server 127.0.0.1:9900;
}

server {
    location /api {
        proxy_pass http://backend;
    }
}
```

### 2. Clustering

```bash
# Iniciar múltiples instancias
pm2 start dist/app.js -i max --name "proyecto-backend"
```

### 3. Caching

```nginx
# Configuración de caché
location /static/ {
    expires 1y;
    add_header Cache-Control "public, no-transform";
}

location /api/ {
    proxy_cache my_cache;
    proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
    proxy_cache_valid 200 60m;
}
```

## Resolución de Problemas

### 1. Logs

```bash
# Nginx
sudo tail -f /var/log/nginx/error.log

# PM2
pm2 logs proyecto-backend

# PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### 2. Diagnóstico

```bash
# Verificar puertos
sudo netstat -tulpn | grep LISTEN

# Verificar procesos
ps aux | grep node

# Verificar espacio
df -h
```

### 3. Reinicio de Servicios

```bash
# Nginx
sudo systemctl restart nginx

# PostgreSQL
sudo systemctl restart postgresql

# PM2
pm2 restart all
```

## Seguridad

### 1. Firewall

```bash
# Configurar UFW
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### 2. Headers de Seguridad

```nginx
# Nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-XSS-Protection "1; mode=block";
add_header X-Content-Type-Options "nosniff";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
```

### 3. Rate Limiting

```nginx
# Nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    proxy_pass http://localhost:9898;
}
``` 