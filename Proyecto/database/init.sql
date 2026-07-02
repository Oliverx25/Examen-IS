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

-- Nota: parámetros como shared_preload_libraries, max_connections y shared_buffers
-- requieren reinicio del servidor y deben configurarse en postgresql.conf,
-- no en scripts de inicialización.

-- Crear índices adicionales para optimización OLAP
-- (Estos se ejecutarán después de que Django cree las tablas)

-- Mensaje de confirmación
SELECT 'Base de datos inicializada correctamente para Data Warehouse Académico' as mensaje;
