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

class CustomPagination(PageNumberPagination):
    """Paginación personalizada para las dimensiones"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

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
# ENDPOINTS PARA CRUD DE DIMENSIONES
# ===========================

# CREATE endpoints
class EstudianteCreateView(generics.CreateAPIView):
    """POST /api/dimension/estudiante/ - Crear nuevo estudiante"""
    queryset = DimEstudiante.objects.all()
    serializer_class = DimEstudianteSerializer

class MateriaCreateView(generics.CreateAPIView):
    """POST /api/dimension/materia/ - Crear nueva materia"""
    queryset = DimMateria.objects.all()
    serializer_class = DimMateriaSerializer

class DocenteCreateView(generics.CreateAPIView):
    """POST /api/dimension/docente/ - Crear nuevo docente"""
    queryset = DimDocente.objects.all()
    serializer_class = DimDocenteSerializer

class ProgramaCreateView(generics.CreateAPIView):
    """POST /api/dimension/programa/ - Crear nuevo programa"""
    queryset = DimPrograma.objects.all()
    serializer_class = DimProgramaSerializer

class TiempoCreateView(generics.CreateAPIView):
    """POST /api/dimension/tiempo/ - Crear nuevo periodo"""
    queryset = DimTiempo.objects.all()
    serializer_class = DimTiempoSerializer

# READ endpoints (ya existían, pero los organizo mejor)
class EstudianteListView(generics.ListCreateAPIView):
    """GET /api/dimension/estudiante/ - Listar estudiantes, POST - Crear estudiante"""
    queryset = DimEstudiante.objects.all().order_by('id_estudiante')
    serializer_class = DimEstudianteSerializer
    pagination_class = CustomPagination

class MateriaListView(generics.ListCreateAPIView):
    """GET /api/dimension/materia/ - Listar materias, POST - Crear materia"""
    queryset = DimMateria.objects.all().order_by('id_materia')
    serializer_class = DimMateriaSerializer
    pagination_class = CustomPagination

class DocenteListView(generics.ListCreateAPIView):
    """GET /api/dimension/docente/ - Listar docentes, POST - Crear docente"""
    queryset = DimDocente.objects.all().order_by('id_docente')
    serializer_class = DimDocenteSerializer
    pagination_class = CustomPagination

class ProgramaListView(generics.ListCreateAPIView):
    """GET /api/dimension/programa/ - Listar programas, POST - Crear programa"""
    queryset = DimPrograma.objects.all().order_by('id_programa')
    serializer_class = DimProgramaSerializer
    pagination_class = CustomPagination

class TiempoListView(generics.ListCreateAPIView):
    """GET /api/dimension/tiempo/ - Listar periodos, POST - Crear periodo"""
    queryset = DimTiempo.objects.all().order_by('id_tiempo')
    serializer_class = DimTiempoSerializer
    pagination_class = CustomPagination

# UPDATE endpoints (ya existían)
class EstudianteUpdateView(generics.RetrieveUpdateAPIView):
    """PUT /api/dimension/estudiante/<id>/ - Actualizar estudiante"""
    queryset = DimEstudiante.objects.all()
    serializer_class = DimEstudianteSerializer
    lookup_field = 'id_estudiante'

class MateriaUpdateView(generics.RetrieveUpdateAPIView):
    """PUT /api/dimension/materia/<id>/ - Actualizar materia"""
    queryset = DimMateria.objects.all()
    serializer_class = DimMateriaSerializer
    lookup_field = 'id_materia'

class DocenteUpdateView(generics.RetrieveUpdateAPIView):
    """PUT /api/dimension/docente/<id>/ - Actualizar docente"""
    queryset = DimDocente.objects.all()
    serializer_class = DimDocenteSerializer
    lookup_field = 'id_docente'

class ProgramaUpdateView(generics.RetrieveUpdateAPIView):
    """PUT /api/dimension/programa/<id>/ - Actualizar programa"""
    queryset = DimPrograma.objects.all()
    serializer_class = DimProgramaSerializer
    lookup_field = 'id_programa'

class TiempoUpdateView(generics.RetrieveUpdateAPIView):
    """PUT /api/dimension/tiempo/<id>/ - Actualizar periodo"""
    queryset = DimTiempo.objects.all()
    serializer_class = DimTiempoSerializer
    lookup_field = 'id_tiempo'

# DELETE endpoints
@api_view(['DELETE'])
def delete_estudiante(request, id_estudiante):
    """DELETE /api/dimension/estudiante/<id>/ - Eliminar estudiante"""
    try:
        estudiante = DimEstudiante.objects.get(id_estudiante=id_estudiante)
        estudiante.delete()
        return Response({'message': 'Estudiante eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)
    except DimEstudiante.DoesNotExist:
        return Response({'error': 'Estudiante no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Error al eliminar: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_materia(request, id_materia):
    """DELETE /api/dimension/materia/<id>/ - Eliminar materia"""
    try:
        materia = DimMateria.objects.get(id_materia=id_materia)
        materia.delete()
        return Response({'message': 'Materia eliminada correctamente'}, status=status.HTTP_204_NO_CONTENT)
    except DimMateria.DoesNotExist:
        return Response({'error': 'Materia no encontrada'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Error al eliminar: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_docente(request, id_docente):
    """DELETE /api/dimension/docente/<id>/ - Eliminar docente"""
    try:
        docente = DimDocente.objects.get(id_docente=id_docente)
        docente.delete()
        return Response({'message': 'Docente eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)
    except DimDocente.DoesNotExist:
        return Response({'error': 'Docente no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Error al eliminar: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_programa(request, id_programa):
    """DELETE /api/dimension/programa/<id>/ - Eliminar programa"""
    try:
        programa = DimPrograma.objects.get(id_programa=id_programa)
        programa.delete()
        return Response({'message': 'Programa eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)
    except DimPrograma.DoesNotExist:
        return Response({'error': 'Programa no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Error al eliminar: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_tiempo(request, id_tiempo):
    """DELETE /api/dimension/tiempo/<id>/ - Eliminar periodo"""
    try:
        tiempo = DimTiempo.objects.get(id_tiempo=id_tiempo)
        tiempo.delete()
        return Response({'message': 'Periodo eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)
    except DimTiempo.DoesNotExist:
        return Response({'error': 'Periodo no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Error al eliminar: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

# ===========================
# ENDPOINTS PARA TABLA DE HECHOS
# ===========================

class HechosListView(generics.ListAPIView):
    """GET /api/hechos/ - Listar tabla de hechos"""
    queryset = HechosRendimientoAcademico.objects.select_related(
        'id_estudiante', 'id_materia', 'id_docente', 'id_tiempo', 'id_programa'
    ).order_by('-id_hecho')
    serializer_class = HechosRendimientoAcademicoSerializer
    pagination_class = CustomPagination

class HechosCreateView(generics.CreateAPIView):
    """POST /api/hechos/ - Crear nuevo hecho"""
    queryset = HechosRendimientoAcademico.objects.all()
    serializer_class = HechosRendimientoAcademicoSerializer

class HechosUpdateView(generics.RetrieveUpdateAPIView):
    """PUT /api/hechos/<id>/ - Actualizar hecho"""
    queryset = HechosRendimientoAcademico.objects.select_related(
        'id_estudiante', 'id_materia', 'id_docente', 'id_tiempo', 'id_programa'
    ).all()
    serializer_class = HechosRendimientoAcademicoSerializer
    lookup_field = 'id_hecho'

@api_view(['DELETE'])
def delete_hecho(request, id_hecho):
    """DELETE /api/hechos/<id>/ - Eliminar hecho"""
    try:
        hecho = HechosRendimientoAcademico.objects.get(id_hecho=id_hecho)
        hecho.delete()
        return Response({'message': 'Hecho eliminado correctamente'}, status=status.HTTP_204_NO_CONTENT)
    except HechosRendimientoAcademico.DoesNotExist:
        return Response({'error': 'Hecho no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Error al eliminar: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

# ===========================
# ENDPOINTS ADICIONALES PARA LISTADO
# ===========================

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

# ===========================
# ENDPOINTS PARA AUTOCOMPLETE
# ===========================

@api_view(['GET'])
def get_generos(request):
    """GET /api/autocomplete/generos/ - Obtener géneros únicos"""
    try:
        generos = DimEstudiante.objects.values_list('genero', flat=True).distinct().order_by('genero')
        generos_list = [{'value': genero, 'label': genero} for genero in generos if genero]
        return Response(generos_list, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': f'Error al obtener géneros: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_semestres(request):
    """GET /api/autocomplete/semestres/ - Obtener semestres únicos"""
    try:
        semestres = DimEstudiante.objects.values_list('semestre_ingreso', flat=True).distinct().order_by('semestre_ingreso')
        semestres_list = [{'value': semestre, 'label': semestre} for semestre in semestres if semestre]
        return Response(semestres_list, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': f'Error al obtener semestres: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_departamentos(request):
    """GET /api/autocomplete/departamentos/ - Obtener departamentos únicos"""
    try:
        # Obtener departamentos de materias y docentes
        dept_materias = DimMateria.objects.values_list('departamento', flat=True).distinct()
        dept_docentes = DimDocente.objects.values_list('departamento_asignado', flat=True).distinct()

        # Combinar y eliminar duplicados
        departamentos = set(list(dept_materias) + list(dept_docentes))
        departamentos_list = [{'value': dept, 'label': dept} for dept in sorted(departamentos) if dept]
        return Response(departamentos_list, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': f'Error al obtener departamentos: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_niveles_materia(request):
    """GET /api/autocomplete/niveles-materia/ - Obtener niveles de materia únicos"""
    try:
        niveles = DimMateria.objects.values_list('nivel', flat=True).distinct().order_by('nivel')
        niveles_list = [{'value': nivel, 'label': nivel} for nivel in niveles if nivel]
        return Response(niveles_list, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': f'Error al obtener niveles de materia: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_grados_academicos(request):
    """GET /api/autocomplete/grados-academicos/ - Obtener grados académicos únicos"""
    try:
        grados = DimDocente.objects.values_list('grado_academico', flat=True).distinct().order_by('grado_academico')
        grados_list = [{'value': grado, 'label': grado} for grado in grados if grado]
        return Response(grados_list, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': f'Error al obtener grados académicos: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_niveles_programa(request):
    """GET /api/autocomplete/niveles-programa/ - Obtener niveles de programa únicos"""
    try:
        niveles = DimPrograma.objects.values_list('nivel', flat=True).distinct().order_by('nivel')
        niveles_list = [{'value': nivel, 'label': nivel} for nivel in niveles if nivel]
        return Response(niveles_list, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': f'Error al obtener niveles de programa: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_facultades(request):
    """GET /api/autocomplete/facultades/ - Obtener facultades únicas"""
    try:
        facultades = DimPrograma.objects.values_list('facultad', flat=True).distinct().order_by('facultad')
        facultades_list = [{'value': facultad, 'label': facultad} for facultad in facultades if facultad]
        return Response(facultades_list, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': f'Error al obtener facultades: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_coordinadores(request):
    """GET /api/autocomplete/coordinadores/ - Obtener coordinadores únicos"""
    try:
        coordinadores = DimPrograma.objects.values_list('coordinador', flat=True).distinct().order_by('coordinador')
        coordinadores_list = [{'value': coord, 'label': coord} for coord in coordinadores if coord]
        return Response(coordinadores_list, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': f'Error al obtener coordinadores: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

# =============================================================================
# ENDPOINTS OLAP - CUBO MULTIDIMENSIONAL Y CONSULTAS MDX
# =============================================================================

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'olap'))

@api_view(['POST'])
def olap_rollup(request):
    """
    Operación Roll-up: Agrega datos de un nivel detallado a uno más general

    Body: {
        "dimension": "estudiante",
        "from_level": "nombre_completo",
        "to_level": "genero",
        "measures": ["calificacion", "creditos_obtenidos"],
        "filters": {"dim_tiempo.anio": "2024"}
    }
    """
    try:
        from olap.mdx_engine import MDXEngine

        data = request.data

        # Validar parámetros requeridos
        required_fields = ['dimension', 'from_level', 'to_level', 'measures']
        for field in required_fields:
            if field not in data:
                return Response({
                    'error': f'Campo requerido: {field}'
                }, status=status.HTTP_400_BAD_REQUEST)

        # Crear motor MDX
        mdx_engine = MDXEngine(connection)

        # Ejecutar roll-up
        result = mdx_engine.roll_up(
            dimension=data['dimension'],
            from_level=data['from_level'],
            to_level=data['to_level'],
            measures=data['measures'],
            filters=data.get('filters')
        )

        if 'error' in result:
            return Response({
                'error': result['error']
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'success': True,
            'operation': 'roll_up',
            'result': result
        })

    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def olap_drilldown(request):
    """
    Operación Drill-down: Desagrega datos de un nivel general a uno más detallado

    Body: {
        "dimension": "materia",
        "from_level": "departamento",
        "to_level": "nombre_materia",
        "measures": ["calificacion"],
        "filters": {"dim_estudiante.genero": "Femenino"}
    }
    """
    try:
        from olap.mdx_engine import MDXEngine

        data = request.data

        required_fields = ['dimension', 'from_level', 'to_level', 'measures']
        for field in required_fields:
            if field not in data:
                return Response({
                    'error': f'Campo requerido: {field}'
                }, status=status.HTTP_400_BAD_REQUEST)

        mdx_engine = MDXEngine(connection)

        result = mdx_engine.drill_down(
            dimension=data['dimension'],
            from_level=data['from_level'],
            to_level=data['to_level'],
            measures=data['measures'],
            filters=data.get('filters')
        )

        if 'error' in result:
            return Response({
                'error': result['error']
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'success': True,
            'operation': 'drill_down',
            'result': result
        })

    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def olap_slice(request):
    """
    Operación Slice: Fija una dimensión en un valor específico

    Body: {
        "fixed_dimension": "tiempo",
        "fixed_value": "2024-1",
        "row_dimensions": ["estudiante", "materia"],
        "col_dimensions": ["docente"],
        "measures": ["calificacion", "creditos_obtenidos"]
    }
    """
    try:
        from olap.mdx_engine import MDXEngine

        data = request.data

        required_fields = ['fixed_dimension', 'fixed_value', 'row_dimensions', 'measures']
        for field in required_fields:
            if field not in data:
                return Response({
                    'error': f'Campo requerido: {field}'
                }, status=status.HTTP_400_BAD_REQUEST)

        mdx_engine = MDXEngine(connection)

        result = mdx_engine.slice_operation(
            fixed_dimension=data['fixed_dimension'],
            fixed_value=data['fixed_value'],
            row_dimensions=data['row_dimensions'],
            col_dimensions=data.get('col_dimensions', []),
            measures=data['measures']
        )

        if 'error' in result:
            return Response({
                'error': result['error']
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'success': True,
            'operation': 'slice',
            'result': result
        })

    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def olap_dice(request):
    """
    Operación Dice: Aplica múltiples filtros a varias dimensiones

    Body: {
        "filters": {
            "dim_estudiante.genero": "Masculino",
            "dim_tiempo.anio": "2024",
            "dim_materia.departamento": "Matemáticas"
        },
        "row_dimensions": ["estudiante", "materia"],
        "col_dimensions": ["docente"],
        "measures": ["calificacion"]
    }
    """
    try:
        from olap.mdx_engine import MDXEngine

        data = request.data

        required_fields = ['filters', 'row_dimensions', 'measures']
        for field in required_fields:
            if field not in data:
                return Response({
                    'error': f'Campo requerido: {field}'
                }, status=status.HTTP_400_BAD_REQUEST)

        mdx_engine = MDXEngine(connection)

        result = mdx_engine.dice_operation(
            filters=data['filters'],
            row_dimensions=data['row_dimensions'],
            col_dimensions=data.get('col_dimensions', []),
            measures=data['measures']
        )

        if 'error' in result:
            return Response({
                'error': result['error']
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'success': True,
            'operation': 'dice',
            'result': result
        })

    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def olap_pivot(request):
    """
    Operación Pivot: Rota las dimensiones entre filas y columnas

    Body: {
        "current_rows": ["estudiante", "materia"],
        "current_cols": ["docente"],
        "new_rows": ["docente", "tiempo"],
        "new_cols": ["estudiante"],
        "measures": ["calificacion", "creditos_obtenidos"],
        "filters": {"dim_tiempo.anio": "2024"}
    }
    """
    try:
        from olap.mdx_engine import MDXEngine

        data = request.data

        required_fields = ['new_rows', 'new_cols', 'measures']
        for field in required_fields:
            if field not in data:
                return Response({
                    'error': f'Campo requerido: {field}'
                }, status=status.HTTP_400_BAD_REQUEST)

        mdx_engine = MDXEngine(connection)

        result = mdx_engine.pivot_operation(
            current_rows=data.get('current_rows', []),
            current_cols=data.get('current_cols', []),
            new_rows=data['new_rows'],
            new_cols=data['new_cols'],
            measures=data['measures'],
            filters=data.get('filters')
        )

        if 'error' in result:
            return Response({
                'error': result['error']
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'success': True,
            'operation': 'pivot',
            'result': result
        })

    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def olap_cube_schema(request):
    """
    Obtiene el esquema del cubo OLAP con dimensiones, medidas y jerarquías
    """
    try:
        from olap.cube_schema import CubeSchema

        cube_schema = CubeSchema()
        schema = cube_schema.get_cube_definition()

        return Response({
            'success': True,
            'cube_schema': schema,
            'description': 'Esquema del cubo multidimensional académico'
        })

    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def olap_custom_mdx(request):
    """
    Ejecuta una consulta MDX personalizada

    Body: {
        "mdx_query": "SELECT {[Measures].[calificacion]} ON COLUMNS, {[estudiante].Members} ON ROWS FROM [cubo_academico]",
        "sql_equivalent": "SELECT AVG(calificacion) FROM hechos_rendimiento_academico JOIN dim_estudiante..."
    }
    """
    try:
        data = request.data

        if 'sql_equivalent' not in data:
            return Response({
                'error': 'Campo requerido: sql_equivalent'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Ejecutar la consulta SQL equivalente
        with connection.cursor() as cursor:
            cursor.execute(data['sql_equivalent'])
            results = cursor.fetchall()
            columns = [col[0] for col in cursor.description]

        # Convertir resultados a diccionarios
        data_results = []
        for row in results:
            data_results.append(dict(zip(columns, row)))

        return Response({
            'success': True,
            'operation': 'custom_mdx',
            'mdx_query': data.get('mdx_query', ''),
            'sql_query': data['sql_equivalent'],
            'result': {
                'data': data_results,
                'columns': columns,
                'row_count': len(data_results)
            }
        })

    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
