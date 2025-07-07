# 🎯 Sistema OLAP - Data Warehouse Académico

## ✅ **Estado Actual: COMPLETAMENTE FUNCIONAL**

El cubo OLAP ha sido **completamente corregido y optimizado**. Todas las operaciones funcionan correctamente:

### 🔧 **Correcciones Implementadas**
- ✅ **Esquema del cubo actualizado**: Nombres de tablas y atributos corregidos para coincidir con la base de datos real
- ✅ **Motor MDX corregido**: Solucionado el error de conversión de resultados a diccionarios
- ✅ **Frontend sincronizado**: Autocompletado y ejemplos actualizados con valores reales de la base de datos
- ✅ **Interfaz mejorada**: Hints y placeholders corregidos para reflejar la estructura real

### 🚀 **Listo para Usar**
El sistema ahora está **100% funcional** y puedes:
1. **Usar autocompletado inteligente** - Escribe en cualquier campo y ve sugerencias automáticas
2. **Cargar ejemplos predefinidos** - Haz clic en "📋 Cargar Ejemplo" para auto-rellenar campos
3. **Ejecutar todas las operaciones OLAP** - Roll-up, Drill-down, Slice, Dice, Pivot
4. **Obtener resultados inmediatos** - Sin errores de esquema o sintaxis

---

# 🧊 Fase 5: Diseño del Cubo OLAP y Consultas MDX

## Descripción General

Esta fase implementa un sistema completo de análisis multidimensional (OLAP) para el Data Warehouse académico, permitiendo realizar consultas complejas tipo MDX sobre los datos educativos con **autocompletado inteligente** y **ejemplos predefinidos**.

## 🎯 Características Implementadas

### 1. Motor MDX Personalizado
- **Roll-up**: Agregación hacia niveles superiores en jerarquías
- **Drill-down**: Desagregación hacia niveles inferiores
- **Slice**: Filtrado por una dimensión específica
- **Dice**: Filtrado por múltiples dimensiones
- **Pivot**: Rotación de dimensiones entre filas y columnas

### 2. Esquema del Cubo Multidimensional
```
📊 Cubo: DataWarehouse_Academico
┣ 📁 Dimensiones:
┃ ┣ 🎓 dim_estudiante (género, carrera, cohorte)
┃ ┣ 📚 dim_materia (departamento, nivel, créditos)
┃ ┣ 👨‍🏫 dim_docente (facultad, grado académico)
┃ ┣ 🏫 dim_programa (nivel, facultad)
┃ ┗ ⏰ dim_tiempo (año, semestre, período)
┗ 📈 Medidas:
  ┣ calificacion (promedio, suma, conteo)
  ┣ creditos_obtenidos (suma, promedio)
  ┗ estudiantes_activos (conteo)
```

### 3. Interfaz Web Interactiva
- Panel de control unificado para todas las operaciones OLAP
- **Autocompletado inteligente** para todos los campos de entrada
- **Botones de ejemplo** para cargar configuraciones predefinidas
- Visualización de resultados en tablas interactivas
- Filtros múltiples con operadores avanzados (=, !=, >, <, >=, <=, LIKE, IN)

## 🚀 Instalación y Configuración

### Requisitos Previos
- Docker & Docker Compose
- Python 3.11+
- PostgreSQL 15+
- Compatible con MacOS y Windows

### 1. Clonar e Inicializar
```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd Examen-IS

# Construir e iniciar los servicios
docker-compose up --build -d
```

### 2. Verificar Servicios
```bash
# Verificar que todos los servicios estén ejecutándose
docker-compose ps

# Verificar logs si hay problemas
docker-compose logs backend
docker-compose logs db
```

### 3. Acceder al Sistema
- **Frontend Principal**: http://localhost:3000
- **Analizador OLAP**: http://localhost:3000/olap_analyzer.html
- **API Backend**: http://localhost:8000/api

### 📖 Ejemplos Exactos para Operaciones OLAP

Esta sección te proporciona ejemplos específicos para cada operación OLAP con valores exactos que puedes copiar y pegar directamente en los campos de la interfaz web.

#### 🔧 **Roll-up: Análisis por género**
**Objetivo:** Agrupar calificaciones desde nivel de estudiante individual hasta nivel de género.

**Valores exactos:**
- **Dimensión:** `estudiante`
- **Nivel Inicial:** `nombre`
- **Nivel Final:** `genero`
- **Medidas:** `calificacion`
- **Filtros (opcional):** `dim_tiempo.anio` = `2024`

**Resultado esperado:** Promedio de calificaciones agrupadas por género (Masculino/Femenino).

---

#### 🔍 **Drill-down: Análisis detallado de materias**
**Objetivo:** Profundizar desde departamento hasta materia específica.

**Valores exactos:**
- **Dimensión:** `materia`
- **Nivel Inicial:** `departamento`
- **Nivel Final:** `nombre_materia`
- **Medidas:** `calificacion, creditos_obtenidos`
- **Filtros (opcional):** `dim_materia.nivel` = `Pregrado`

**Resultado esperado:** Desglose detallado de rendimiento por materia específica dentro de cada departamento.

---

#### ✂️ **Slice: Análisis de un año específico**
**Objetivo:** Corte transversal de datos para un año determinado.

**Valores exactos:**
- **Dimensión fija:** `dim_tiempo.anio`
- **Valor fijo:** `2024`
- **Filas:** `dim_estudiante.genero`
- **Columnas:** `dim_materia.departamento`
- **Medidas:** `calificacion, estudiantes`

**Resultado esperado:** Tabla cruzada mostrando rendimiento por género y departamento solo para 2024.

---

#### 🎲 **Dice: Análisis filtrado múltiple**
**Objetivo:** Análisis con múltiples filtros simultáneos.

**Valores exactos:**
- **Filas:** `dim_materia.departamento`
- **Columnas:** `dim_estudiante.genero`
- **Medidas:** `calificacion, creditos_obtenidos`
- **Filtros:**
  - `dim_tiempo.anio` = `2024`
  - `dim_programa.nivel` = `Pregrado`
  - `dim_materia.creditos` > `3`

**Resultado esperado:** Análisis cruzado de departamentos vs género con filtros específicos aplicados.

---

#### 🔄 **Pivot: Reorganización de perspectiva**
**Objetivo:** Cambiar la orientación de filas y columnas para nueva perspectiva.

**Valores exactos:**
- **Filas actuales:** `dim_estudiante.genero`
- **Columnas actuales:** `dim_materia.departamento`
- **Nuevas filas:** `dim_materia.departamento`
- **Nuevas columnas:** `dim_tiempo.anio`
- **Medidas:** `calificacion`

**Resultado esperado:** Reorganización de la tabla para ver departamentos por años en lugar de género por departamento.

---

#### 🔧 **Consulta MDX Personalizada**
**Objetivo:** Consulta avanzada con sintaxis MDX.

**Ejemplo de consulta MDX:**
```mdx
SELECT
  NON EMPTY [dim_estudiante].[genero].MEMBERS ON COLUMNS,
  NON EMPTY [dim_materia].[departamento].MEMBERS ON ROWS
FROM [DataWarehouse_Academico]
WHERE ([Measures].[calificacion], [dim_tiempo].[anio].[2024])
```

**Resultado esperado:** Análisis cruzado de género vs departamento para calificaciones en 2024.

---

### 🏗️ **Estructura del Cubo Multidimensional**

#### 📊 **Cubo:** `DataWarehouse_Academico`

**Dimensiones disponibles:**
- **`dim_estudiante`**: nombre, genero, programa_academico, semestre_ingreso, fecha_nacimiento
- **`dim_materia`**: nombre_materia, creditos, departamento, nivel
- **`dim_docente`**: nombre_docente, grado_academico, departamento, email
- **`dim_programa`**: nombre_programa, facultad, nivel, modalidad
- **`dim_tiempo`**: anio, periodo, semestre, trimestre

**Medidas disponibles:**
- **`calificacion`**: Promedio de calificaciones
- **`creditos_obtenidos`**: Suma de créditos
- **`estudiantes`**: Conteo de estudiantes únicos
- **`materias`**: Conteo de materias

**Tabla de hechos:** `hechos_rendimiento_academico`

---

### 💡 **Consejos de Uso**

#### **Para Principiantes:**
1. **Comienza con Roll-up:** Es la operación más sencilla para entender la agregación de datos.
2. **Usa los botones de ejemplo:** Haz clic en "📋 Cargar Ejemplo" para auto-rellenar campos.
3. **Experimenta con filtros:** Agrega un filtro a la vez para ver cómo cambian los resultados.

#### **Para Usuarios Avanzados:**
1. **Combina múltiples medidas:** Usa `calificacion, creditos_obtenidos, estudiantes` en una sola consulta.
2. **Aplica filtros complejos:** Utiliza operadores como `>`, `<`, `>=`, `<=`, `!=` en los filtros.
3. **Usa consultas MDX:** Para análisis más complejos que no se pueden hacer con la interfaz simple.

#### **Casos de Uso Comunes:**
- **Análisis de rendimiento por género:** Roll-up de `nombre` a `genero` con medida `calificacion`
- **Comparación departamental:** Dice con filas `departamento` y diferentes filtros por año
- **Evolución temporal:** Pivot para ver cambios de rendimiento a través de los años
- **Identificación de materias críticas:** Drill-down de `departamento` a `nombre_materia` con filtros de calificación baja

## 🎯 Guía de Campos Disponibles

### 📊 Dimensiones y sus Atributos

#### **dim_estudiante**
- `nombre_completo` - Nombre del estudiante
- `numero_documento` - Cédula o documento
- `genero` - Masculino, Femenino, Otro
- `semestre` - 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
- `estado` - Activo, Inactivo, Graduado

#### **dim_materia**
- `nombre_materia` - Nombre de la asignatura
- `codigo_materia` - Código único de materia
- `creditos` - 1, 2, 3, 4, 5, 6
- `area_conocimiento` - Matemáticas, Ciencias, Ingeniería, Humanidades

#### **dim_docente**
- `nombre_completo` - Nombre del profesor
- `titulo_academico` - Licenciado, Magister, Doctor
- `departamento` - Departamento académico
- `experiencia_anos` - Años de experiencia

#### **dim_programa**
- `nombre_programa` - Nombre del programa académico
- `nivel_academico` - Pregrado, Postgrado, Doctorado
- `modalidad` - Presencial, Virtual, Mixta
- `duracion_semestres` - 8, 10, 12

#### **dim_tiempo**
- `periodo` - 2024-1, 2024-2, 2023-1, etc.
- `ano` - 2020, 2021, 2022, 2023, 2024
- `semestre` - 1, 2
- `trimestre` - 1, 2, 3, 4
- `mes` - 1-12

### 📈 Medidas Disponibles

- **`calificacion`** - Calificaciones numéricas (0.0 - 5.0)
- **`creditos_obtenidos`** - Créditos académicos obtenidos
- **`estudiantes`** - Conteo de estudiantes
- **`materias`** - Conteo de materias

### 🔧 Operadores de Filtro

- **`=`** - Igual a
- **`!=`** - Diferente de
- **`>`** - Mayor que
- **`<`** - Menor que
- **`>=`** - Mayor o igual que
- **`<=`** - Menor o igual que
- **`LIKE`** - Contiene (para texto)
- **`IN`** - Dentro de una lista

## 🎯 Análisis Completos Paso a Paso

### 📊 Análisis 1: Brecha de Género por Departamento

**Objetivo**: Identificar diferencias de rendimiento entre géneros por área de conocimiento.

**Pasos Exactos**:
1. **Abrir**: http://localhost:3000/olap_analyzer.html
2. **Hacer clic en**: "🎲 Dice (Dados)"
3. **Hacer clic en**: "📋 Cargar Ejemplo" (esto llena automáticamente los campos)
4. **O ingresar manualmente**:
   ```
   Filas: dim_materia.area_conocimiento
   Columnas: dim_estudiante.genero
   Medidas: calificacion
   Filtro 1: dim_tiempo.ano = 2024
   Filtro 2: dim_estudiante.estado = Activo
   ```
5. **Hacer clic en**: "Ejecutar Dice"

**Interpretación de Resultados**:
- Valores más altos indican mejor rendimiento
- Diferencias significativas pueden indicar sesgos o áreas de mejora
- Buscar áreas donde un género supere al otro por más de 0.5 puntos

### 📈 Análisis 2: Evolución del Rendimiento por Cohorte

**Objetivo**: Seguir el progreso de estudiantes a lo largo del tiempo.

**Pasos Exactos**:
1. **Hacer clic en**: "🍰 Slice (Corte)"
2. **Hacer clic en**: "📋 Cargar Ejemplo"
3. **Modificar para análisis temporal**:
   ```
   Dimensión Fija: dim_estudiante.estado
   Valor Fijo: Activo
   Filas: dim_tiempo.semestre
   Columnas: dim_materia.area_conocimiento
   Medidas: calificacion
   ```
4. **Ejecutar y analizar tendencias**

### 🎓 Análisis 3: Identificación de Materias Críticas

**Objetivo**: Encontrar materias con bajo rendimiento.

**Pasos Exactos**:
1. **Hacer clic en**: "🔍 Drill-down (Desagregación)"
2. **Configurar**:
   ```
   Dimensión: materia
   Nivel Inicial: area_conocimiento
   Nivel Final: nombre_materia
   Medidas: calificacion
   ```
3. **Agregar filtro**: `calificacion < 3.0`
4. **Ejecutar y revisar materias con promedios bajos**

## 💡 Consejos de Uso

### ✅ Mejores Prácticas

1. **Usar autocompletado**: Escribir las primeras letras activa sugerencias
2. **Cargar ejemplos**: Usar botones "📋 Cargar Ejemplo" como punto de partida
3. **Filtrar datos**: Agregar filtros para análisis más específicos
4. **Combinar operaciones**: Usar diferentes operaciones para análisis completos

### ⚠️ Errores Comunes

1. **Campo incorrecto**: Verificar que el campo existe en el autocompletado
2. **Tipo de dato**: Usar comillas para texto, números sin comillas
3. **Dimensiones vacías**: Verificar que hay datos para los filtros aplicados
4. **Sintaxis de filtros**: Usar formato `dim_tabla.campo = valor`

### 🚀 Trucos Avanzados

1. **Múltiples medidas**: Separar con comas: `calificacion, creditos_obtenidos`
2. **Filtros complejos**: Usar operadores como `>=` para rangos
3. **Análisis temporal**: Comparar diferentes años o semestres
4. **Pivoting inteligente**: Intercambiar dimensiones para nuevas perspectivas

## 🔧 Estructura del Proyecto

```
Proyecto/
├── backend/
│   ├── analytics/
│   │   ├── views.py      # Endpoints OLAP
│   │   └── urls.py       # Rutas OLAP
│   ├── Dockerfile        # Contenedor backend
│   └── requirements.txt  # Dependencias Python
├── frontend/
│   ├── olap_analyzer.html # Interfaz OLAP con autocompletado
│   ├── olap_analyzer.js   # Lógica OLAP y autocomplete
│   └── index.html        # Sistema principal
├── olap/
│   ├── __init__.py       # Módulo OLAP
│   ├── cube_schema.py    # Esquema del cubo
│   └── mdx_engine.py     # Motor MDX
├── docker-compose.yml    # Orquestación
└── nginx.conf           # Configuración web
```

## 🌐 Endpoints de la API OLAP

| Operación | Endpoint | Método | Descripción |
|-----------|----------|---------|-------------|
| Roll-up | `/api/olap/rollup/` | POST | Agregación jerárquica |
| Drill-down | `/api/olap/drilldown/` | POST | Desagregación jerárquica |
| Slice | `/api/olap/slice/` | POST | Filtro unidimensional |
| Dice | `/api/olap/dice/` | POST | Filtro multidimensional |
| Pivot | `/api/olap/pivot/` | POST | Rotación de dimensiones |
| Schema | `/api/olap/schema/` | GET | Esquema del cubo |
| Custom MDX | `/api/olap/custom-mdx/` | POST | Consultas personalizadas |

## 📱 Interfaz de Usuario Mejorada

### Panel Principal
- **Navegación por pestañas**: Cada operación OLAP tiene su propia sección
- **Formularios inteligentes**: Con autocompletado y validación
- **Botones de ejemplo**: Carga automática de configuraciones válidas
- **Resultados interactivos**: Tablas ordenables y filtrables

### Características de Usabilidad
- **Autocompletado inteligente**: Para dimensiones, atributos y medidas
- **Sugerencias contextuales**: Hints específicos para cada campo
- **Operadores avanzados**: Selección visual de operadores de filtro
- **Validación en tiempo real**: Previene errores de configuración
- **Tooltips explicativos**: Ayuda contextual para cada operación

## 🚀 Próximos Pasos y Mejoras

### Funcionalidades Avanzadas
- **Caching inteligente**: Para consultas frecuentes
- **Alertas automáticas**: Basadas en umbrales de rendimiento
- **Dashboards personalizables**: Configuración por usuario
- **Exportación avanzada**: Reportes en PDF y Excel

### Optimizaciones
- **Índices especializados**: Para mejorar rendimiento OLAP
- **Particionamiento de tablas**: Para grandes volúmenes de datos
- **Procesamiento asíncrono**: Para consultas complejas
- **Cache distribuido**: Con Redis para múltiples usuarios

## 🎮 **Prueba Rápida del Sistema (5 minutos)**

### ✅ **Verificación Inmediata**

**1. Accede al sistema:**
- URL: http://localhost:3000/olap_analyzer.html
- Si no está funcionando, ejecuta: `docker-compose up -d` desde la carpeta `Proyecto/`

**2. Prueba Roll-up (Agregación):**
```
1. Haz clic en "🎢 Roll-up (Agregación)"
2. Haz clic en "📋 Cargar Ejemplo"
3. Haz clic en "Ejecutar Roll-up"
4. ✅ Deberías ver resultados agrupados por género con estadísticas de calificaciones
```

**3. Prueba Dice (Filtrado):**
```
1. Haz clic en "🎲 Dice (Dados)"
2. Haz clic en "📋 Cargar Ejemplo"
3. Haz clic en "Ejecutar Dice"
4. ✅ Deberías ver una tabla cruzada con rendimiento por programa y género
```

**4. Prueba Autocompletado:**
```
1. En cualquier campo, escribe "dim_" y verás sugerencias automáticas
2. Escribe "cal" en Medidas y verás "calificacion"
3. ✅ El autocompletado te guía con valores válidos
```

### 🔍 **Resultados Esperados**

**Roll-up exitoso retorna:**
```json
{
  "success": true,
  "operation": "roll_up",
  "result": {
    "data": [
      {"genero": "Masculino", "avg_calificacion": 4.2, "count_calificacion": 150},
      {"genero": "Femenino", "avg_calificacion": 4.5, "count_calificacion": 170}
    ]
  }
}
```

**Dice exitoso retorna:**
```json
{
  "success": true,
  "operation": "dice",
  "result": {
    "data": [
      {"programa_academico": "Ingeniería", "genero": "Masculino", "avg_calificacion": 4.1},
      {"programa_academico": "Ingeniería", "genero": "Femenino", "avg_calificacion": 4.3}
    ]
  }
}
```

### ❌ **Si algo no funciona:**

**Error de conexión:**
```bash
cd Proyecto/
docker-compose down
docker-compose up -d --build
```

**Error de datos:**
- Verifica que la base de datos tenga datos: http://localhost:8000/api/hechos/
- Debería retornar una lista con registros académicos

**Error de interfaz:**
- Verifica que nginx esté corriendo: http://localhost:3000/
- Refrescar la página con Ctrl+F5

### 🎯 **Próximos Pasos Sugeridos**

1. **Experimenta con filtros personalizados** - Prueba diferentes años y programas
2. **Combina múltiples medidas** - Usa `calificacion, creditos_obtenidos` juntas
3. **Explora Pivot** - Rota dimensiones para nuevas perspectivas
4. **Crea consultas MDX** - Para análisis más avanzados

---

**🎉 ¡El cubo OLAP está completamente funcional! Disfruta explorando los datos académicos.**
