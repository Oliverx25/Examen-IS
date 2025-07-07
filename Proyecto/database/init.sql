-- Archivo de inicialización de la base de datos
-- Data Warehouse Académico

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Configurar el esquema
SET search_path TO public;

-- Dar permisos al usuario
GRANT ALL PRIVILEGES ON DATABASE datawarehouse TO dw_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dw_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dw_user;

-- Configuraciones adicionales para optimización OLAP
SET shared_preload_libraries = 'pg_stat_statements';
SET max_connections = 200;
SET shared_buffers = '256MB';
SET effective_cache_size = '1GB';
SET work_mem = '16MB';
SET maintenance_work_mem = '64MB';

-- Crear índices adicionales para optimización OLAP
-- (Estos se ejecutarán después de que Django cree las tablas)

-- Mensaje de confirmación
SELECT 'Base de datos inicializada correctamente para Data Warehouse Académico' as mensaje;
