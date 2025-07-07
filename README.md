# Data Warehouse Universitario - Sistema de Análisis de Rendimiento Académico

## 📋 Descripción del Proyecto

El **Data Warehouse Universitario** es una solución integral para el análisis del rendimiento académico que permite a las instituciones educativas tomar decisiones basadas en datos. El sistema implementa un modelo de datos multidimensional que facilita la consulta y análisis de información académica desde múltiples perspectivas.

### 🎯 Objetivos

- **Centralizar** la información académica en un repositorio unificado
- **Facilitar** el análisis multidimensional del rendimiento estudiantil
- **Proporcionar** respuestas a preguntas de negocio críticas sobre el desempeño académico
- **Optimizar** la toma de decisiones académicas mediante análisis de datos

## 🏗️ Arquitectura de la Solución

### Modelo Dimensional

El sistema implementa un **modelo de estrella** con las siguientes dimensiones:

#### 🎓 Dimensiones

1. **Dim_Estudiante**
   - `id_estudiante` (PK)
   - `nombre`
   - `genero`
   - `programa_academico`
   - `semestre_ingreso`
   - `fecha_nacimiento`

2. **Dim_Materia**
   - `id_materia` (PK)
   - `nombre_materia`
   - `creditos`
   - `departamento`
   - `nivel`

3. **Dim_Docente**
   - `id_docente` (PK)
   - `nombre_docente`
   - `grado_academico`
   - `departamento_asignado`
   - `email`

4. **Dim_Programa**
   - `id_programa` (PK)
   - `nombre_programa`
   - `nivel`
   - `coordinador`
   - `facultad`

5. **Dim_Tiempo**
   - `id_tiempo` (PK)
   - `anio`
   - `periodo`
   - `descripcion`

#### 📊 Tabla de Hechos

**Fact_RendimientoAcademico**
- `id_rendimiento` (PK)
- `id_estudiante` (FK)
- `id_materia` (FK)
- `id_docente` (FK)
- `id_programa` (FK)
- `id_tiempo` (FK)
- `calificacion`
- `estatus`
- `creditos_obtenidos`

### 🏛️ Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Base de       │
│   (JavaScript)  │◄──►│   (Django RF)   │◄──►│   Datos         │
│   - Dashboard   │    │   - APIs REST   │    │   (PostgreSQL)  │
│   - Analytics   │    │   - Análisis    │    │   - Modelo      │
│   - CRUD        │    │   - CRUD        │    │     Dimensional │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **Django 4.2+** - Framework web principal
- **Django REST Framework** - APIs REST
- **PostgreSQL 15+** - Base de datos
- **Python 3.9+** - Lenguaje de programación

### Frontend
- **HTML5** - Estructura
- **CSS3** - Estilos y diseño responsivo
- **JavaScript (ES6+)** - Lógica del cliente
- **Font Awesome** - Iconografía

### Infraestructura
- **Docker** - Containerización
- **Docker Compose** - Orquestación de servicios
- **Nginx** - Servidor web para frontend

## ⚙️ Funcionalidades Implementadas

### 📈 Dashboard Principal
- **Estadísticas generales** del sistema
- **Métricas clave** de rendimiento académico
- **Visualización** en tiempo real de datos

### 🔍 Módulo de Análisis
Responde a tres preguntas de negocio fundamentales:

1. **Tasas de Reprobación**
   - Análisis por materia y carrera
   - Identificación de materias problemáticas
   - Tendencias por periodo académico

2. **Materias Sobresalientes**
   - Asignaturas con mayor cantidad de calificaciones excelentes
   - Análisis de factores de éxito
   - Ranking por programa académico

3. **Evolución del Promedio**
   - Tendencias por generación y programa
   - Análisis temporal del rendimiento
   - Comparativa entre niveles académicos

### 📝 Gestión de Datos
- **Carga de nuevos registros** de rendimiento académico
- **Validación** automática de datos
- **Formularios dinámicos** con selección inteligente

### 🗄️ Administración de Dimensiones
- **Visualización** paginada de todas las dimensiones
- **Edición** en línea de registros

## 🧊 Sistema OLAP Multidimensional *(NUEVO)*

### 📊 Cubo OLAP Completo
Se ha implementado un **sistema OLAP (Online Analytical Processing) completo** que permite realizar análisis multidimensionales avanzados sobre el Data Warehouse académico. Esta funcionalidad proporciona capacidades de inteligencia de negocios de nivel empresarial.

#### ✨ Características Principales
- **🎢 Roll-up**: Agregación jerárquica de datos (ej: estudiantes → género → programa)
- **🔍 Drill-down**: Desagregación detallada (ej: departamento → materia específica)
- **✂️ Slice**: Cortes unidimensionales (ej: análisis solo para 2024)
- **🎲 Dice**: Filtrado multidimensional avanzado
- **🔄 Pivot**: Rotación de dimensiones para nuevas perspectivas
- **🧠 Autocompletado Inteligente**: Sugerencias automáticas en todos los campos
- **📋 Ejemplos Predefinidos**: Botones para cargar configuraciones válidas automáticamente

#### 🚀 Acceso Rápido
- **Interfaz OLAP**: http://localhost:3000/olap_analyzer.html
- **Motor MDX personalizado** con sintaxis SQL y MDX
- **API REST completa** para operaciones OLAP programáticas

#### 📖 Documentación Detallada
Para información completa sobre el uso del sistema OLAP, ejemplos específicos, guías paso a paso y troubleshooting, consulta:

**👉 [📖 README_OLAP.md - Documentación Completa del Sistema OLAP](./README_OLAP.md)**

*Incluye: instalación, configuración, ejemplos exactos para cada operación, esquema del cubo, casos de uso reales y guía de solución de problemas.*

---

### 🔧 Características Técnicas

#### Paginación Inteligente
- **10 registros por página** en análisis
- **20 registros por página** en dimensiones
- **Navegación numérica** con controles avanzados
- **Información contextual** de página actual

#### Interfaz de Usuario
- **Diseño responsivo** para todos los dispositivos
- **Navegación intuitiva** por pestañas
- **Notificaciones** en tiempo real (toasts)
- **Modales** para edición de datos
- **Loading spinners** para mejor experiencia

#### APIs REST
- **Endpoints RESTful** completos
- **Paginación** automática
- **Serialización** optimizada
- **Manejo de errores** robusto

## 🚀 Instalación y Configuración

### Prerrequisitos

```bash
- Docker 20.10+
- Docker Compose 2.0+
- Git
```

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd Proyecto
```

2. **Ejecutar el sistema completo**
```bash
# Construir y ejecutar todos los servicios
docker-compose up -d --build
```

Este comando único:
- Construye todas las imágenes necesarias
- Crea y ejecuta los contenedores
- Configura la red entre servicios
- Ejecuta las migraciones automáticamente
- Deja el sistema listo para usar

3. **Verificar que los servicios estén corriendo**
```bash
docker-compose ps
```

4. **Acceder a la aplicación**
```bash
# Frontend
http://localhost:3000

# Backend Admin (opcional)
http://localhost:8000/admin

# API Documentation
http://localhost:8000/api/
```

### Configuración Adicional (Opcional)

Si deseas crear un superusuario para acceder al panel de administración:
```bash
docker-compose exec backend python manage.py createsuperuser
```

### Detener el Sistema

```bash
# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (limpieza completa)
docker-compose down -v
```

## 📚 Uso del Sistema

### Navegación Principal

1. **Dashboard** - Vista general del sistema
2. **Análisis** - Ejecución de análisis multidimensionales
3. **Cargar Datos** - Ingreso de nuevos registros
4. **Dimensiones** - Gestión de datos maestros
5. **🆕 OLAP Analyzer** - Análisis multidimensional avanzado (http://localhost:3000/olap_analyzer.html)

### Flujo de Trabajo Típico

1. **Cargar datos** iniciales a través del módulo "Cargar Datos"
2. **Verificar información** en las dimensiones
3. **Ejecutar análisis** desde el módulo "Análisis"
4. **🆕 Realizar análisis OLAP** avanzados con el OLAP Analyzer (Roll-up, Drill-down, Slice, Dice, Pivot)
5. **Revisar métricas** en el Dashboard
6. **Editar registros** según sea necesario

## 🔗 Endpoints de la API

### Analytics
```
GET /api/analytics/dashboard/ - Estadísticas generales
GET /api/analytics/tasa-reprobacion/ - Análisis de reprobación
GET /api/analytics/materias-sobresalientes/ - Materias destacadas
GET /api/analytics/evolucion-promedio/ - Evolución temporal
```

### OLAP Operations *(NUEVO)*
```
POST /api/olap/rollup/ - Operación Roll-up (agregación jerárquica)
POST /api/olap/drilldown/ - Operación Drill-down (desagregación)
POST /api/olap/slice/ - Operación Slice (corte unidimensional)
POST /api/olap/dice/ - Operación Dice (filtrado multidimensional)
POST /api/olap/pivot/ - Operación Pivot (rotación de dimensiones)
GET /api/olap/schema/ - Esquema del cubo multidimensional
POST /api/olap/custom-mdx/ - Consultas MDX personalizadas
```

### Dimensiones
```
GET /api/dimension/{dimension}/ - Listar registros
GET /api/dimension/{dimension}/{id}/ - Obtener registro específico
PUT /api/dimension/{dimension}/{id}/ - Actualizar registro
```

### Carga de Datos
```
POST /api/load-data/ - Insertar nuevo registro de rendimiento
```

## 🏗️ Estructura del Proyecto

```
Proyecto/
├── backend/
│   ├── datawarehouse/          # Configuración principal
│   ├── analytics/              # Módulo de análisis
│   │   ├── views.py           # + Endpoints OLAP
│   │   └── urls.py            # + Rutas OLAP
│   ├── dimensions/             # Gestión de dimensiones
│   ├── data_loading/           # Carga de datos
│   ├── requirements.txt        # Dependencias Python
│   └── Dockerfile             # Imagen del backend
├── frontend/
│   ├── index.html             # Página principal
│   ├── olap_analyzer.html     # 🆕 Interfaz OLAP
│   ├── olap_analyzer.js       # 🆕 Lógica OLAP + Autocompletado
│   ├── script.js              # Lógica JavaScript
│   ├── styles.css             # Estilos CSS
│   └── Dockerfile             # Imagen del frontend
├── olap/                      # 🆕 Motor OLAP
│   ├── __init__.py            # Módulo OLAP
│   ├── cube_schema.py         # Esquema del cubo multidimensional
│   └── mdx_engine.py          # Motor de consultas MDX
├── docker-compose.yml         # Orquestación de servicios
├── README.md                  # Documentación principal
└── README_OLAP.md            # 🆕 Documentación completa OLAP
```
