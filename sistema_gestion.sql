-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS sistema_empleados;
USE sistema_empleados;



-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(200),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Para bcrypt
    email VARCHAR(100) NOT NULL UNIQUE,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_login TIMESTAMP NULL,
    rol_id INT NOT NULL,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- Tabla de empleados
CREATE TABLE IF NOT EXISTS empleados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    dni VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    direccion VARCHAR(200),
    fecha_nacimiento DATE,
    fecha_ingreso DATE NOT NULL,
    salario DECIMAL(10,2),
    estado VARCHAR(20) DEFAULT 'ACTIVO',
    usuario_id INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla de sesiones (para control de login)
CREATE TABLE IF NOT EXISTS sesiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL,
    activa BOOLEAN DEFAULT TRUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    fecha_fin TIMESTAMP NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Índices para optimización
-- Índices para optimización (sin IF NOT EXISTS)
CREATE INDEX idx_empleados_dni ON empleados(dni);
CREATE INDEX idx_empleados_email ON empleados(email);
CREATE INDEX idx_usuarios_username ON usuarios(username);
CREATE INDEX idx_sesiones_token ON sesiones(token);
CREATE INDEX idx_sesiones_usuario ON sesiones(usuario_id);


-- Datos iniciales para roles
INSERT INTO roles (nombre, descripcion) VALUES 
('ADMINISTRADOR', 'Acceso completo al sistema'),
('EMPLEADO', 'Acceso limitado a consultas')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), descripcion=VALUES(descripcion);

-- Usuario administrador por defecto (password: admin123)
INSERT INTO usuarios (username, password, email, rol_id) VALUES 
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMye.Iy.jL3pKoLaHIDnQeZoY4nKdJLUQm6', 'admin@empresa.com', 1)
ON DUPLICATE KEY UPDATE username=VALUES(username), password=VALUES(password), email=VALUES(email), rol_id=VALUES(rol_id);

-- Empleado de ejemplo
INSERT INTO empleados (nombres, apellidos, dni, email, telefono, direccion, fecha_nacimiento, fecha_ingreso, salario, usuario_id) VALUES 
('Juan Carlos', 'Pérez López', '12345678', 'juan.perez@empresa.com', '987654321', 'Av. Lima 123', '1990-05-15', '2023-01-15', 3500.00, 1)
ON DUPLICATE KEY UPDATE nombres=VALUES(nombres), apellidos=VALUES(apellidos), dni=VALUES(dni), email=VALUES(email), telefono=VALUES(telefono), direccion=VALUES(direccion), fecha_nacimiento=VALUES(fecha_nacimiento), fecha_ingreso=VALUES(fecha_ingreso), salario=VALUES(salario), usuario_id=VALUES(usuario_id);

-- Tabla de permisos
CREATE TABLE IF NOT EXISTS permisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(200),
    categoria VARCHAR(50),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de relación muchos-a-muchos entre roles y permisos
CREATE TABLE IF NOT EXISTS rol_permisos (
    rol_id INT NOT NULL,
    permiso_id INT NOT NULL,
    PRIMARY KEY (rol_id, permiso_id),
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE CASCADE
);

-- Insertar permisos básicos
INSERT INTO permisos (codigo, nombre, descripcion, categoria) VALUES 
('user_management', 'Gestión de Usuarios', 'Crear, editar y eliminar usuarios', 'Administración'),
('role_management', 'Gestión de Roles', 'Crear, editar y eliminar roles', 'Administración'),
('system_settings', 'Configuración del Sistema', 'Acceso a configuraciones generales', 'Administración'),
('analytics', 'Análisis', 'Ver análisis y métricas del sistema', 'Análisis y Reportes'),
('reports', 'Reportes', 'Generar y ver reportes', 'Análisis y Reportes'),
('compliance_reports', 'Reportes de Cumplimiento', 'Acceso a reportes de cumplimiento', 'Análisis y Reportes'),
('employee_management', 'Gestión de Empleados', 'Administrar información de empleados', 'Gestión de Empleados'),
('team_management', 'Gestión de Equipos', 'Administrar equipos de trabajo', 'Gestión de Empleados'),
('performance_review', 'Evaluación de Desempeño', 'Realizar evaluaciones de desempeño', 'Gestión de Empleados'),
('recruitment', 'Reclutamiento', 'Gestionar procesos de contratación', 'Recursos Humanos'),
('payroll_access', 'Acceso a Nómina', 'Ver y gestionar información de nómina', 'Recursos Humanos'),
('timesheet_management', 'Gestión de Horarios', 'Administrar horarios y asistencia', 'Tiempo y Documentos'),
('timesheet_approval', 'Aprobación de Horarios', 'Aprobar registros de tiempo', 'Tiempo y Documentos'),
('document_access', 'Acceso a Documentos', 'Ver y gestionar documentos', 'Tiempo y Documentos'),
('profile_view', 'Ver Perfil', 'Ver información del perfil personal', 'Acceso Básico'),
('basic_timesheet', 'Registro Básico de Tiempo', 'Registrar tiempo básico', 'Acceso Básico')
ON DUPLICATE KEY UPDATE codigo=VALUES(codigo), nombre=VALUES(nombre), descripcion=VALUES(descripcion), categoria=VALUES(categoria);

-- Asignar todos los permisos al rol ADMINISTRADOR (ID = 1)
INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT 1, id FROM permisos
ON DUPLICATE KEY UPDATE rol_id=VALUES(rol_id), permiso_id=VALUES(permiso_id);

-- Asignar permisos básicos al rol EMPLEADO (ID = 2)
INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT 2, id FROM permisos WHERE codigo IN ('profile_view', 'basic_timesheet')
ON DUPLICATE KEY UPDATE rol_id=VALUES(rol_id), permiso_id=VALUES(permiso_id);

-- Insertar empleado 1
INSERT INTO empleados (nombres, apellidos, dni, email, telefono, direccion, fecha_nacimiento, fecha_ingreso, salario, usuario_id) 
VALUES 
('Ana María', 'González Pérez', '23456789', 'ana.gonzalez@jczap.net', '987654322', 'Calle Ficticia 456', '1985-06-20', '2023-02-01', 4000.00, 1);

-- Insertar empleado 2
INSERT INTO empleados (nombres, apellidos, dni, email, telefono, direccion, fecha_nacimiento, fecha_ingreso, salario, usuario_id) 
VALUES 
('Carlos Eduardo', 'Méndez Rojas', '23456780', 'carlos.mendez@jczap.net', '987654323', 'Calle Real 789', '1992-04-10', '2022-11-10', 3500.00, 1);

-- Insertar empleado 3
INSERT INTO empleados (nombres, apellidos, dni, email, telefono, direccion, fecha_nacimiento, fecha_ingreso, salario, usuario_id) 
VALUES 
('María José', 'López García', '34567890', 'maria.lopez@jczap.net', '987654324', 'Avenida Central 123', '1990-08-15', '2021-06-01', 3000.00, 1);

-- Insertar empleado 4
INSERT INTO empleados (nombres, apellidos, dni, email, telefono, direccion, fecha_nacimiento, fecha_ingreso, salario, usuario_id) 
VALUES 
('Luis Alberto', 'Ramírez Díaz', '45678901', 'luis.ramirez@jczap.net', '987654325', 'Calle Sol 321', '1988-11-25', '2020-05-12', 4200.00, 1);

-- Insertar empleado 5
INSERT INTO empleados (nombres, apellidos, dni, email, telefono, direccion, fecha_nacimiento, fecha_ingreso, salario, usuario_id) 
VALUES 
('Pedro Antonio', 'Sánchez Gómez', '56789012', 'pedro.sanchez@jczap.net', '987654326', 'Avenida Los Olivos 567', '1995-02-18', '2023-03-01', 3300.00, 1);


-- Insertar 5 usuarios en la tabla de usuarios
INSERT INTO usuarios (username, password, email, rol_id) VALUES 
('usuario1', '$2a$10$N9qo8uLOickgx2ZMRZoMye.Iy.jL3pKoLaHIDnQeZoY4nKdJLUQm6', 'usuario1@jczap.net', 1),
('usuario2', '$2a$10$VhF7uUO8JkK0Mq4y1nD2SO/mzF7lQYk5kFkl0LhUw1lyuRbBkeVn2', 'usuario2@jczap.net', 2),
('usuario3', '$2a$10$VVfOaIkPjrDi2Wm7K2FKnO/DhSlPfsYOIb2AqfzUtLPlr9gkxKqGe6', 'usuario3@jczap.net', 1),
('usuario4', '$2a$10$MweGlwzDTbUpcAShnE4Z2u8Vz6cyQqFg2kjgLctHDXf8MEIu7OUh2', 'usuario4@jczap.net', 2),
('usuario5', '$2a$10$H02hZ4SiS.5rAq0lgd4k72ExqfMR2Jql0.Ej0ql8fF2uEvj0rGHhuu', 'usuario5@jczap.net', 1);

