from django.urls import path
from . import views

app_name = 'analytics'

urlpatterns = [
    # ===========================
    # ENDPOINTS PARA DASHBOARD
    # ===========================
    path('analytics/dashboard/', views.dashboard_summary, name='dashboard-stats'),

    # ===========================
    # ENDPOINTS PARA ANÁLISIS
    # ===========================
    path('analytics/tasa-reprobacion/', views.tasa_reprobacion, name='tasa-reprobacion'),
    path('analytics/materias-sobresalientes/', views.materias_sobresalientes, name='materias-sobresalientes'),
    path('analytics/evolucion-promedio/', views.evolucion_promedio, name='evolucion-promedio'),

    # ===========================
    # ENDPOINTS PARA AUTOCOMPLETE
    # ===========================
    path('autocomplete/generos/', views.get_generos, name='autocomplete-generos'),
    path('autocomplete/semestres/', views.get_semestres, name='autocomplete-semestres'),
    path('autocomplete/departamentos/', views.get_departamentos, name='autocomplete-departamentos'),
    path('autocomplete/niveles-materia/', views.get_niveles_materia, name='autocomplete-niveles-materia'),
    path('autocomplete/grados-academicos/', views.get_grados_academicos, name='autocomplete-grados-academicos'),
    path('autocomplete/niveles-programa/', views.get_niveles_programa, name='autocomplete-niveles-programa'),
    path('autocomplete/facultades/', views.get_facultades, name='autocomplete-facultades'),
    path('autocomplete/coordinadores/', views.get_coordinadores, name='autocomplete-coordinadores'),

    # ===========================
    # ENDPOINT PARA CARGA DE DATOS
    # ===========================
    path('load-data/', views.load_data, name='load-data'),

    # ===========================
    # CRUD PARA DIMENSIONES
    # ===========================
    path('dimension/estudiante/', views.EstudianteListView.as_view(), name='estudiante-list'),
    path('dimension/estudiante/<int:id_estudiante>/', views.EstudianteUpdateView.as_view(), name='estudiante-update'),
    path('dimension/estudiante/<int:id_estudiante>/delete/', views.delete_estudiante, name='estudiante-delete'),

    path('dimension/materia/', views.MateriaListView.as_view(), name='materia-list'),
    path('dimension/materia/<int:id_materia>/', views.MateriaUpdateView.as_view(), name='materia-update'),
    path('dimension/materia/<int:id_materia>/delete/', views.delete_materia, name='materia-delete'),

    path('dimension/docente/', views.DocenteListView.as_view(), name='docente-list'),
    path('dimension/docente/<int:id_docente>/', views.DocenteUpdateView.as_view(), name='docente-update'),
    path('dimension/docente/<int:id_docente>/delete/', views.delete_docente, name='docente-delete'),

    path('dimension/programa/', views.ProgramaListView.as_view(), name='programa-list'),
    path('dimension/programa/<int:id_programa>/', views.ProgramaUpdateView.as_view(), name='programa-update'),
    path('dimension/programa/<int:id_programa>/delete/', views.delete_programa, name='programa-delete'),

    path('dimension/tiempo/', views.TiempoListView.as_view(), name='tiempo-list'),
    path('dimension/tiempo/<int:id_tiempo>/', views.TiempoUpdateView.as_view(), name='tiempo-update'),
    path('dimension/tiempo/<int:id_tiempo>/delete/', views.delete_tiempo, name='tiempo-delete'),

    # ===========================
    # CRUD PARA TABLA DE HECHOS
    # ===========================
    path('hechos/', views.HechosListView.as_view(), name='hechos-list'),
    path('hechos/create/', views.HechosCreateView.as_view(), name='hechos-create'),
    path('hechos/<int:id_hecho>/', views.HechosUpdateView.as_view(), name='hechos-update'),
    path('hechos/<int:id_hecho>/delete/', views.delete_hecho, name='hechos-delete'),

    # Endpoints para obtener valores únicos para autocomplete
    path('get-generos/', views.get_generos, name='get-generos'),
    path('get-semestres/', views.get_semestres, name='get-semestres'),
    path('get-departamentos/', views.get_departamentos, name='get-departamentos'),
    path('get-niveles-materia/', views.get_niveles_materia, name='get-niveles-materia'),
    path('get-grados-academicos/', views.get_grados_academicos, name='get-grados-academicos'),
    path('get-niveles-programa/', views.get_niveles_programa, name='get-niveles-programa'),
    path('get-facultades/', views.get_facultades, name='get-facultades'),
    path('get-coordinadores/', views.get_coordinadores, name='get-coordinadores'),

    # =============================================================================
    # RUTAS OLAP - CUBO MULTIDIMENSIONAL Y CONSULTAS MDX
    # =============================================================================

    # Operaciones básicas del cubo OLAP
    path('olap/rollup/', views.olap_rollup, name='olap-rollup'),
    path('olap/drilldown/', views.olap_drilldown, name='olap-drilldown'),
    path('olap/slice/', views.olap_slice, name='olap-slice'),
    path('olap/dice/', views.olap_dice, name='olap-dice'),
    path('olap/pivot/', views.olap_pivot, name='olap-pivot'),

    # Esquema del cubo y consultas personalizadas
    path('olap/schema/', views.olap_cube_schema, name='olap-cube-schema'),
    path('olap/custom-mdx/', views.olap_custom_mdx, name='olap-custom-mdx'),
]
