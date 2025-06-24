-- Script para poblar el Data Warehouse con datos sintéticos
-- Mínimo 5000 registros en la tabla de hechos

-- ===========================
-- POBLAR DIMENSIONES
-- ===========================

-- Insertar datos en dim_programa
INSERT INTO dim_programa (nombre_programa, nivel, coordinador, facultad) VALUES
('Ingeniería en Sistemas Computacionales', 'Licenciatura', 'Dr. Carlos Martínez', 'Ingeniería'),
('Ingeniería Industrial', 'Licenciatura', 'Dra. Ana García', 'Ingeniería'),
('Administración de Empresas', 'Licenciatura', 'Dr. Roberto López', 'Administración'),
('Contaduría Pública', 'Licenciatura', 'Dra. María Fernández', 'Administración'),
('Derecho', 'Licenciatura', 'Dr. Juan Rodríguez', 'Derecho'),
('Psicología', 'Licenciatura', 'Dra. Laura Sánchez', 'Ciencias Sociales'),
('Medicina', 'Licenciatura', 'Dr. Miguel Torres', 'Medicina'),
('Arquitectura', 'Licenciatura', 'Arq. Patricia Morales', 'Arquitectura'),
('Ingeniería Civil', 'Licenciatura', 'Dr. Fernando Castro', 'Ingeniería'),
('Comunicación', 'Licenciatura', 'Dra. Elena Vargas', 'Comunicación'),
('Maestría en Administración', 'Maestría', 'Dr. José Herrera', 'Administración'),
('Maestría en Ingeniería', 'Maestría', 'Dr. David Ruiz', 'Ingeniería');

-- Insertar datos en dim_tiempo (últimos 5 años)
INSERT INTO dim_tiempo (anio, periodo, mes_inicio, mes_fin, descripcion) VALUES
(2020, '2020-1', 1, 6, 'Enero-Junio 2020'),
(2020, '2020-2', 8, 12, 'Agosto-Diciembre 2020'),
(2021, '2021-1', 1, 6, 'Enero-Junio 2021'),
(2021, '2021-2', 8, 12, 'Agosto-Diciembre 2021'),
(2022, '2022-1', 1, 6, 'Enero-Junio 2022'),
(2022, '2022-2', 8, 12, 'Agosto-Diciembre 2022'),
(2023, '2023-1', 1, 6, 'Enero-Junio 2023'),
(2023, '2023-2', 8, 12, 'Agosto-Diciembre 2023'),
(2024, '2024-1', 1, 6, 'Enero-Junio 2024'),
(2024, '2024-2', 8, 12, 'Agosto-Diciembre 2024');

-- Insertar datos en dim_materia
INSERT INTO dim_materia (nombre_materia, creditos, departamento, nivel) VALUES
-- Materias de Ingeniería
('Programación I', 8, 'Ingeniería en Sistemas', 'Básico'),
('Programación II', 8, 'Ingeniería en Sistemas', 'Intermedio'),
('Base de Datos', 6, 'Ingeniería en Sistemas', 'Intermedio'),
('Redes de Computadoras', 6, 'Ingeniería en Sistemas', 'Avanzado'),
('Ingeniería de Software', 8, 'Ingeniería en Sistemas', 'Avanzado'),
('Matemáticas I', 8, 'Ciencias Básicas', 'Básico'),
('Matemáticas II', 8, 'Ciencias Básicas', 'Básico'),
('Física I', 6, 'Ciencias Básicas', 'Básico'),
('Física II', 6, 'Ciencias Básicas', 'Intermedio'),
('Química', 6, 'Ciencias Básicas', 'Básico'),
-- Materias de Administración
('Contabilidad I', 6, 'Administración', 'Básico'),
('Contabilidad II', 6, 'Administración', 'Intermedio'),
('Mercadotecnia', 6, 'Administración', 'Intermedio'),
('Recursos Humanos', 6, 'Administración', 'Avanzado'),
('Finanzas', 8, 'Administración', 'Avanzado'),
('Economía', 6, 'Administración', 'Básico'),
('Estadística', 6, 'Administración', 'Intermedio'),
-- Materias Generales
('Inglés I', 4, 'Idiomas', 'Básico'),
('Inglés II', 4, 'Idiomas', 'Básico'),
('Inglés III', 4, 'Idiomas', 'Intermedio'),
('Inglés IV', 4, 'Idiomas', 'Intermedio'),
('Desarrollo Humano', 4, 'Desarrollo Integral', 'Básico'),
('Ética Profesional', 4, 'Desarrollo Integral', 'Avanzado'),
('Metodología de la Investigación', 6, 'Investigación', 'Intermedio'),
('Taller de Titulación', 8, 'Investigación', 'Avanzado');

-- Insertar datos en dim_docente
INSERT INTO dim_docente (nombre_docente, grado_academico, departamento_asignado, email) VALUES
('Dr. Alberto Ramírez', 'Doctorado', 'Ingeniería en Sistemas', 'alberto.ramirez@universidad.edu'),
('Dra. Carmen Jiménez', 'Doctorado', 'Ingeniería en Sistemas', 'carmen.jimenez@universidad.edu'),
('M.C. Roberto Flores', 'Maestría', 'Ingeniería en Sistemas', 'roberto.flores@universidad.edu'),
('Dr. Luis Mendoza', 'Doctorado', 'Ciencias Básicas', 'luis.mendoza@universidad.edu'),
('Dra. Sandra Pérez', 'Doctorado', 'Ciencias Básicas', 'sandra.perez@universidad.edu'),
('M.C. Jorge Vega', 'Maestría', 'Ciencias Básicas', 'jorge.vega@universidad.edu'),
('Dra. Mónica Rivera', 'Doctorado', 'Administración', 'monica.rivera@universidad.edu'),
('Dr. Andrés Moreno', 'Doctorado', 'Administración', 'andres.moreno@universidad.edu'),
('M.A. Claudia Silva', 'Maestría', 'Administración', 'claudia.silva@universidad.edu'),
('Lic. María González', 'Licenciatura', 'Idiomas', 'maria.gonzalez@universidad.edu'),
('M.A. Fernando Ramos', 'Maestría', 'Idiomas', 'fernando.ramos@universidad.edu'),
('Dr. Pedro Aguilar', 'Doctorado', 'Desarrollo Integral', 'pedro.aguilar@universidad.edu'),
('Dra. Isabel Reyes', 'Doctorado', 'Investigación', 'isabel.reyes@universidad.edu'),
('M.C. Arturo Medina', 'Maestría', 'Investigación', 'arturo.medina@universidad.edu'),
('Dr. Raúl Guerrero', 'Doctorado', 'Ingeniería en Sistemas', 'raul.guerrero@universidad.edu'),
('Dra. Gabriela Campos', 'Doctorado', 'Administración', 'gabriela.campos@universidad.edu');

-- Insertar estudiantes (300 estudiantes para generar suficientes datos)
INSERT INTO dim_estudiante (nombre, genero, programa_academico, semestre_ingreso, fecha_nacimiento)
SELECT
    CASE (random() * 100)::int % 20
        WHEN 0 THEN 'Ana ' || surnames.apellido
        WHEN 1 THEN 'Carlos ' || surnames.apellido
        WHEN 2 THEN 'María ' || surnames.apellido
        WHEN 3 THEN 'José ' || surnames.apellido
        WHEN 4 THEN 'Laura ' || surnames.apellido
        WHEN 5 THEN 'Miguel ' || surnames.apellido
        WHEN 6 THEN 'Elena ' || surnames.apellido
        WHEN 7 THEN 'David ' || surnames.apellido
        WHEN 8 THEN 'Patricia ' || surnames.apellido
        WHEN 9 THEN 'Roberto ' || surnames.apellido
        WHEN 10 THEN 'Claudia ' || surnames.apellido
        WHEN 11 THEN 'Fernando ' || surnames.apellido
        WHEN 12 THEN 'Sandra ' || surnames.apellido
        WHEN 13 THEN 'Andrés ' || surnames.apellido
        WHEN 14 THEN 'Mónica ' || surnames.apellido
        WHEN 15 THEN 'Jorge ' || surnames.apellido
        WHEN 16 THEN 'Isabel ' || surnames.apellido
        WHEN 17 THEN 'Pedro ' || surnames.apellido
        WHEN 18 THEN 'Gabriela ' || surnames.apellido
        ELSE 'Alberto ' || surnames.apellido
    END as nombre,
    CASE WHEN random() < 0.5 THEN 'Masculino' ELSE 'Femenino' END as genero,
    programas.nombre_programa,
    periodos.periodo,
    DATE '1995-01-01' + (random() * (DATE '2005-12-31' - DATE '1995-01-01'))::int as fecha_nacimiento
FROM
    (SELECT unnest(ARRAY['García', 'López', 'Martínez', 'Rodríguez', 'González', 'Hernández', 'Pérez', 'Sánchez', 'Ramírez', 'Cruz', 'Flores', 'Gómez', 'Díaz', 'Morales', 'Jiménez', 'Ruiz', 'Gutierrez', 'Mendoza', 'Silva', 'Vargas', 'Castro', 'Ortiz', 'Ramos', 'Torres', 'Aguilar']) as apellido) as surnames,
    (SELECT nombre_programa FROM dim_programa WHERE nivel = 'Licenciatura' ORDER BY random() LIMIT 1) as programas,
    (SELECT periodo FROM dim_tiempo ORDER BY random() LIMIT 1) as periodos
LIMIT 300;

-- ===========================
-- POBLAR TABLA DE HECHOS
-- ===========================

-- Generar más de 5000 registros de rendimiento académico
-- Cada estudiante tendrá múltiples materias en diferentes periodos
INSERT INTO hechos_rendimiento_academico
(id_estudiante, id_materia, id_docente, id_tiempo, id_programa, calificacion, estatus, creditos_obtenidos)
SELECT
    e.id_estudiante,
    m.id_materia,
    d.id_docente,
    t.id_tiempo,
    p.id_programa,
    -- Generar calificación realista (distribución normal hacia 75-85)
    CASE
        WHEN random() < 0.1 THEN (random() * 30 + 40)::numeric(4,2)  -- 10% reprueban (40-70)
        WHEN random() < 0.3 THEN (random() * 15 + 70)::numeric(4,2)  -- 20% regular (70-85)
        WHEN random() < 0.8 THEN (random() * 15 + 75)::numeric(4,2)  -- 50% bueno (75-90)
        ELSE (random() * 10 + 90)::numeric(4,2)                      -- 20% excelente (90-100)
    END as calificacion,
    CASE
        WHEN (random() * 30 + 40) < 70 THEN 'Reprobado'
        WHEN (random() * 30 + 40) BETWEEN 70 AND 75 THEN 'Extraordinario'
        ELSE 'Aprobado'
    END as estatus,
    CASE
        WHEN (random() * 30 + 40) >= 70 THEN m.creditos
        ELSE 0
    END as creditos_obtenidos
FROM
    dim_estudiante e
    CROSS JOIN dim_materia m
    CROSS JOIN (SELECT id_tiempo FROM dim_tiempo ORDER BY random() LIMIT 3) t  -- 3 periodos por estudiante-materia
    CROSS JOIN (SELECT id_docente FROM dim_docente ORDER BY random() LIMIT 1) d
    CROSS JOIN (SELECT id_programa FROM dim_programa WHERE nivel = 'Licenciatura' ORDER BY random() LIMIT 1) p
WHERE
    random() < 0.7  -- 70% probabilidad de que un estudiante curse cada materia
LIMIT 6000;  -- Asegurar más de 5000 registros

-- Actualizar estadísticas para optimizar consultas
ANALYZE dim_estudiante;
ANALYZE dim_materia;
ANALYZE dim_docente;
ANALYZE dim_tiempo;
ANALYZE dim_programa;
ANALYZE hechos_rendimiento_academico;
