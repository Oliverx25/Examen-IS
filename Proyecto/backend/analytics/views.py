from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import connection
from .models import (
    DimEstudiante, DimMateria, DimDocente, DimTiempo,
    DimPrograma, HechosRendimientoAcademico
)
from .serializers import (
    DimEstudianteSerializer, DimMateriaSerializer, DimDocenteSerializer,
    DimTiempoSerializer, DimProgramaSerializer, HechosRendimientoAcademicoSerializer,
    LoadDataSerializer, TasaReprobacionSerializer, MateriasExcelentesSerializer,
    EvolucionPromedioSerializer
)
from rest_framework.pagination import PageNumberPagination

# ===========================
# ENDPOINTS PARA CARGAR DATOS
# ===========================

@api_view(['POST'])
def load_data(request):
    """
    POST /api/load-data/
    Cargar nuevos hechos al Data Warehouse
    """
    if request.method == 'POST':
        serializer = LoadDataSerializer(data=request.data)
        if serializer.is_valid():
            try:
                # Crear nuevo registro en la tabla de hechos
                nuevo_hecho = HechosRendimientoAcademico.objects.create(
                    id_estudiante_id=serializer.validated_data['id_estudiante'],
                    id_materia_id=serializer.validated_data['id_materia'],
                    id_docente_id=serializer.validated_data['id_docente'],
                    id_tiempo_id=serializer.validated_data['id_tiempo'],
                    id_programa_id=serializer.validated_data['id_programa'],
                    calificacion=serializer.validated_data['calificacion'],
                    estatus=serializer.validated_data['estatus'],
                    creditos_obtenidos=serializer.validated_data['creditos_obtenidos']
                )

                return Response({
                    'message': 'Datos cargados exitosamente',
                    'id_hecho': nuevo_hecho.id_hecho
                }, status=status.HTTP_201_CREATED)

            except Exception as e:
                return Response({
                    'error': f'Error al cargar datos: {str(e)}'
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ===========================
# ENDPOINTS PARA ANÁLISIS - PREGUNTAS DE NEGOCIO
# ===========================

@api_view(['GET'])
def tasa_reprobacion(request):
    """
    GET /api/analytics/tasa-reprobacion/
    ¿Cuál es la tasa de reprobación por materia y carrera en los últimos cinco semestres?
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
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
                WHERE t.anio >= 2020  -- Últimos 5 años
                GROUP BY m.nombre_materia, m.departamento, p.nombre_programa, t.periodo
                ORDER BY tasa_reprobacion DESC, t.periodo DESC
            """)

            results = []
            for row in cursor.fetchall():
                results.append({
                    'nombre_materia': row[0],
                    'departamento': row[1],
                    'nombre_programa': row[2],
                    'periodo': row[3],
                    'total_evaluaciones': row[4],
                    'reprobados': row[5],
                    'tasa_reprobacion': float(row[6]) if row[6] else 0.0
                })

        serializer = TasaReprobacionSerializer(results, many=True)
        return Response({
            'question': '¿Cuál es la tasa de reprobación por materia y carrera en los últimos cinco semestres?',
            'data': serializer.data,
            'total_records': len(results)
        })

    except Exception as e:
        return Response({
            'error': f'Error en consulta: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def materias_sobresalientes(request):
    """
    GET /api/analytics/materias-sobresalientes/
    ¿Qué asignaturas presentan mayor cantidad de alumnos con calificaciones sobresalientes?
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT
                    m.nombre_materia,
                    m.departamento,
                    COUNT(DISTINCT h.id_estudiante) as total_estudiantes,
                    COUNT(CASE WHEN h.calificacion >= 90 THEN 1 END) as estudiantes_sobresalientes,
                    ROUND(
                        (COUNT(CASE WHEN h.calificacion >= 90 THEN 1 END) * 100.0 /
                         COUNT(DISTINCT h.id_estudiante)), 2
                    ) as porcentaje_sobresalientes,
                    ROUND(AVG(h.calificacion), 2) as promedio_materia
                FROM hechos_rendimiento_academico h
                JOIN dim_materia m ON h.id_materia = m.id_materia
                GROUP BY m.nombre_materia, m.departamento
                HAVING COUNT(DISTINCT h.id_estudiante) >= 5  -- Al menos 5 estudiantes
                ORDER BY estudiantes_sobresalientes DESC, porcentaje_sobresalientes DESC
            """)

            results = []
            for row in cursor.fetchall():
                results.append({
                    'nombre_materia': row[0],
                    'departamento': row[1],
                    'total_estudiantes': row[2],
                    'estudiantes_sobresalientes': row[3],
                    'porcentaje_sobresalientes': float(row[4]) if row[4] else 0.0,
                    'promedio_materia': float(row[5]) if row[5] else 0.0
                })

        serializer = MateriasExcelentesSerializer(results, many=True)
        return Response({
            'question': '¿Qué asignaturas presentan mayor cantidad de alumnos con calificaciones sobresalientes?',
            'criteria': 'Calificaciones >= 90 puntos',
            'data': serializer.data,
            'total_records': len(results)
        })

    except Exception as e:
        return Response({
            'error': f'Error en consulta: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def evolucion_promedio(request):
    """
    GET /api/analytics/evolucion-promedio/
    ¿Cómo ha sido la evolución del promedio general por generación y programa académico?
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT
                    t.anio,
                    t.periodo,
                    p.nombre_programa,
                    p.nivel,
                    ROUND(AVG(h.calificacion), 2) as promedio_general,
                    COUNT(DISTINCT h.id_estudiante) as total_estudiantes,
                    COUNT(*) as total_evaluaciones
                FROM hechos_rendimiento_academico h
                JOIN dim_tiempo t ON h.id_tiempo = t.id_tiempo
                JOIN dim_programa p ON h.id_programa = p.id_programa
                GROUP BY t.anio, t.periodo, p.nombre_programa, p.nivel
                ORDER BY t.anio DESC, t.periodo DESC, p.nombre_programa
            """)

            results = []
            for row in cursor.fetchall():
                results.append({
                    'anio': row[0],
                    'periodo': row[1],
                    'nombre_programa': row[2],
                    'nivel': row[3],
                    'promedio_general': float(row[4]) if row[4] else 0.0,
                    'total_estudiantes': row[5],
                    'total_evaluaciones': row[6]
                })

        serializer = EvolucionPromedioSerializer(results, many=True)
        return Response({
            'question': '¿Cómo ha sido la evolución del promedio general por generación y programa académico?',
            'data': serializer.data,
            'total_records': len(results)
        })

    except Exception as e:
        return Response({
            'error': f'Error en consulta: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ===========================
# ENDPOINTS PARA ACTUALIZAR DIMENSIONES
# ===========================

class EstudianteUpdateView(generics.RetrieveUpdateAPIView):
    """
    PUT /api/dimension/estudiante/<id>/
    Actualizar registros en la dimensión de estudiantes
    """
    queryset = DimEstudiante.objects.all()
    serializer_class = DimEstudianteSerializer
    lookup_field = 'id_estudiante'


class MateriaUpdateView(generics.RetrieveUpdateAPIView):
    """
    PUT /api/dimension/materia/<id>/
    Actualizar registros en la dimensión de materias
    """
    queryset = DimMateria.objects.all()
    serializer_class = DimMateriaSerializer
    lookup_field = 'id_materia'


class DocenteUpdateView(generics.RetrieveUpdateAPIView):
    """
    PUT /api/dimension/docente/<id>/
    Actualizar registros en la dimensión de docentes
    """
    queryset = DimDocente.objects.all()
    serializer_class = DimDocenteSerializer
    lookup_field = 'id_docente'


class ProgramaUpdateView(generics.RetrieveUpdateAPIView):
    """
    PUT /api/dimension/programa/<id>/
    Actualizar registros en la dimensión de programas
    """
    queryset = DimPrograma.objects.all()
    serializer_class = DimProgramaSerializer
    lookup_field = 'id_programa'

# ===========================
# ENDPOINTS ADICIONALES PARA LISTADO
# ===========================

class CustomPagination(PageNumberPagination):
    """Paginación personalizada para las dimensiones"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class EstudianteListView(generics.ListAPIView):
    """GET /api/dimension/estudiante/ - Listar estudiantes"""
    queryset = DimEstudiante.objects.all().order_by('id_estudiante')
    serializer_class = DimEstudianteSerializer
    pagination_class = CustomPagination

class MateriaListView(generics.ListAPIView):
    """GET /api/dimension/materia/ - Listar materias"""
    queryset = DimMateria.objects.all().order_by('id_materia')
    serializer_class = DimMateriaSerializer
    pagination_class = CustomPagination

class DocenteListView(generics.ListAPIView):
    """GET /api/dimension/docente/ - Listar docentes"""
    queryset = DimDocente.objects.all().order_by('id_docente')
    serializer_class = DimDocenteSerializer
    pagination_class = CustomPagination

class ProgramaListView(generics.ListAPIView):
    """GET /api/dimension/programa/ - Listar programas"""
    queryset = DimPrograma.objects.all().order_by('id_programa')
    serializer_class = DimProgramaSerializer
    pagination_class = CustomPagination

class TiempoListView(generics.ListAPIView):
    """GET /api/dimension/tiempo/ - Listar periodos"""
    queryset = DimTiempo.objects.all().order_by('id_tiempo')
    serializer_class = DimTiempoSerializer
    pagination_class = CustomPagination

@api_view(['GET'])
def dashboard_summary(request):
    """
    GET /api/analytics/dashboard/
    Resumen general para el dashboard
    """
    try:
        with connection.cursor() as cursor:
            # Estadísticas generales
            cursor.execute("""
                SELECT
                    COUNT(*) as total_hechos,
                    COUNT(DISTINCT id_estudiante) as total_estudiantes,
                    COUNT(DISTINCT id_materia) as total_materias,
                    COUNT(DISTINCT id_docente) as total_docentes,
                    ROUND(AVG(calificacion), 2) as promedio_general,
                    COUNT(CASE WHEN estatus = 'Aprobado' THEN 1 END) as aprobados,
                    COUNT(CASE WHEN estatus = 'Reprobado' THEN 1 END) as reprobados
                FROM hechos_rendimiento_academico
            """)

            stats = cursor.fetchone()

            return Response({
                'resumen_general': {
                    'total_registros': stats[0],
                    'total_estudiantes': stats[1],
                    'total_materias': stats[2],
                    'total_docentes': stats[3],
                    'promedio_general': float(stats[4]) if stats[4] else 0.0,
                    'aprobados': stats[5],
                    'reprobados': stats[6],
                    'tasa_aprobacion': round((stats[5] * 100.0 / stats[0]), 2) if stats[0] > 0 else 0
                }
            })

    except Exception as e:
        return Response({
            'error': f'Error en consulta: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
