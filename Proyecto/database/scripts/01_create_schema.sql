-- Esquema de Data Warehouse para Análisis de Rendimiento Académico
-- Esquema de estrella con tabla de hechos y 5 dimensiones

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================
-- TABLAS DE DIMENSIONES
-- ===========================

-- Dimensión: Estudiante
CREATE TABLE dim_estudiante (
    id_estudiante SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    genero VARCHAR(20) NOT NULL,
    programa_academico VARCHAR(100) NOT NULL,
    semestre_ingreso VARCHAR(10) NOT NULL,
    fecha_nacimiento DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dimensión: Materia
CREATE TABLE dim_materia (
    id_materia SERIAL PRIMARY KEY,
    nombre_materia VARCHAR(150) NOT NULL,
    creditos INTEGER NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    nivel VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dimensión: Docente
CREATE TABLE dim_docente (
    id_docente SERIAL PRIMARY KEY,
    nombre_docente VARCHAR(100) NOT NULL,
    grado_academico VARCHAR(50) NOT NULL,
    departamento_asignado VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dimensión: Tiempo
CREATE TABLE dim_tiempo (
    id_tiempo SERIAL PRIMARY KEY,
    anio INTEGER NOT NULL,
    periodo VARCHAR(10) NOT NULL,
    mes_inicio INTEGER NOT NULL,
    mes_fin INTEGER NOT NULL,
    descripcion VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dimensión: Programa
CREATE TABLE dim_programa (
    id_programa SERIAL PRIMARY KEY,
    nombre_programa VARCHAR(150) NOT NULL,
    nivel VARCHAR(50) NOT NULL,
    coordinador VARCHAR(100),
    facultad VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================
-- TABLA DE HECHOS
-- ===========================

-- Tabla de hechos: Rendimiento Académico
CREATE TABLE hechos_rendimiento_academico (
    id_hecho SERIAL PRIMARY KEY,
    id_estudiante INTEGER NOT NULL,
    id_materia INTEGER NOT NULL,
    id_docente INTEGER NOT NULL,
    id_tiempo INTEGER NOT NULL,
    id_programa INTEGER NOT NULL,
    calificacion DECIMAL(4,2) NOT NULL CHECK (calificacion >= 0 AND calificacion <= 100),
    estatus VARCHAR(20) NOT NULL CHECK (estatus IN ('Aprobado', 'Reprobado', 'Extraordinario')),
    creditos_obtenidos INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Claves foráneas
    FOREIGN KEY (id_estudiante) REFERENCES dim_estudiante(id_estudiante),
    FOREIGN KEY (id_materia) REFERENCES dim_materia(id_materia),
    FOREIGN KEY (id_docente) REFERENCES dim_docente(id_docente),
    FOREIGN KEY (id_tiempo) REFERENCES dim_tiempo(id_tiempo),
    FOREIGN KEY (id_programa) REFERENCES dim_programa(id_programa)
);

-- ===========================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ===========================

-- Índices en tabla de hechos
CREATE INDEX idx_hechos_estudiante ON hechos_rendimiento_academico(id_estudiante);
CREATE INDEX idx_hechos_materia ON hechos_rendimiento_academico(id_materia);
CREATE INDEX idx_hechos_tiempo ON hechos_rendimiento_academico(id_tiempo);
CREATE INDEX idx_hechos_programa ON hechos_rendimiento_academico(id_programa);
CREATE INDEX idx_hechos_estatus ON hechos_rendimiento_academico(estatus);
CREATE INDEX idx_hechos_calificacion ON hechos_rendimiento_academico(calificacion);

-- Índices en dimensiones
CREATE INDEX idx_estudiante_programa ON dim_estudiante(programa_academico);
CREATE INDEX idx_materia_departamento ON dim_materia(departamento);
CREATE INDEX idx_tiempo_periodo ON dim_tiempo(periodo);

-- ===========================
-- VISTAS PARA ANÁLISIS
-- ===========================

-- Vista para análisis general de rendimiento
CREATE VIEW vw_rendimiento_general AS
SELECT
    h.id_hecho,
    e.nombre as estudiante,
    e.programa_academico,
    e.genero,
    m.nombre_materia,
    m.departamento,
    m.creditos,
    d.nombre_docente,
    t.anio,
    t.periodo,
    p.nombre_programa,
    p.nivel,
    h.calificacion,
    h.estatus,
    h.creditos_obtenidos
FROM hechos_rendimiento_academico h
JOIN dim_estudiante e ON h.id_estudiante = e.id_estudiante
JOIN dim_materia m ON h.id_materia = m.id_materia
JOIN dim_docente d ON h.id_docente = d.id_docente
JOIN dim_tiempo t ON h.id_tiempo = t.id_tiempo
JOIN dim_programa p ON h.id_programa = p.id_programa;

-- Vista para tasas de reprobación
CREATE VIEW vw_tasas_reprobacion AS
SELECT
    m.nombre_materia,
    m.departamento,
    p.nombre_programa,
    t.periodo,
    COUNT(*) as total_evaluaciones,
    COUNT(CASE WHEN h.estatus = 'Reprobado' THEN 1 END) as reprobados,
    ROUND(
        (COUNT(CASE WHEN h.estatus = 'Reprobado' THEN 1 END) * 100.0 / COUNT(*)), 2
    ) as tasa_reprobacion
FROM hechos_rendimiento_academico h
JOIN dim_materia m ON h.id_materia = m.id_materia
JOIN dim_programa p ON h.id_programa = p.id_programa
JOIN dim_tiempo t ON h.id_tiempo = t.id_tiempo
GROUP BY m.nombre_materia, m.departamento, p.nombre_programa, t.periodo;

COMMENT ON TABLE dim_estudiante IS 'Dimensión que contiene información de los estudiantes';
COMMENT ON TABLE dim_materia IS 'Dimensión que contiene información de las materias';
COMMENT ON TABLE dim_docente IS 'Dimensión que contiene información de los docentes';
COMMENT ON TABLE dim_tiempo IS 'Dimensión temporal para análisis por periodos';
COMMENT ON TABLE dim_programa IS 'Dimensión que contiene información de los programas académicos';
COMMENT ON TABLE hechos_rendimiento_academico IS 'Tabla de hechos con métricas de rendimiento académico';
