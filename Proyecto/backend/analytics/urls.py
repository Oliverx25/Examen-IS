from django.urls import path
from . import views

app_name = 'analytics'

urlpatterns = [
    # Endpoints para cargar datos
    path('load-data/', views.load_data, name='load-data'),

    # Endpoints para análisis - Preguntas de negocio
    path('analytics/tasa-reprobacion/', views.tasa_reprobacion, name='tasa-reprobacion'),
    path('analytics/materias-sobresalientes/', views.materias_sobresalientes, name='materias-sobresalientes'),
    path('analytics/evolucion-promedio/', views.evolucion_promedio, name='evolucion-promedio'),
    path('analytics/dashboard/', views.dashboard_summary, name='dashboard-summary'),

    # ===========================
    # CRUD COMPLETO PARA DIMENSIONES
    # ===========================

    # CREATE y LIST endpoints (aceptan GET y POST en la misma ruta)
    path('dimension/estudiante/', views.EstudianteListView.as_view(), name='estudiante-list'),
    path('dimension/materia/', views.MateriaListView.as_view(), name='materia-list'),
    path('dimension/docente/', views.DocenteListView.as_view(), name='docente-list'),
    path('dimension/programa/', views.ProgramaListView.as_view(), name='programa-list'),
    path('dimension/tiempo/', views.TiempoListView.as_view(), name='tiempo-list'),

    # UPDATE endpoints
    path('dimension/estudiante/<int:id_estudiante>/', views.EstudianteUpdateView.as_view(), name='estudiante-update'),
    path('dimension/materia/<int:id_materia>/', views.MateriaUpdateView.as_view(), name='materia-update'),
    path('dimension/docente/<int:id_docente>/', views.DocenteUpdateView.as_view(), name='docente-update'),
    path('dimension/programa/<int:id_programa>/', views.ProgramaUpdateView.as_view(), name='programa-update'),
    path('dimension/tiempo/<int:id_tiempo>/', views.TiempoUpdateView.as_view(), name='tiempo-update'),

    # DELETE endpoints
    path('dimension/estudiante/<int:id_estudiante>/delete/', views.delete_estudiante, name='estudiante-delete'),
    path('dimension/materia/<int:id_materia>/delete/', views.delete_materia, name='materia-delete'),
    path('dimension/docente/<int:id_docente>/delete/', views.delete_docente, name='docente-delete'),
    path('dimension/programa/<int:id_programa>/delete/', views.delete_programa, name='programa-delete'),
    path('dimension/tiempo/<int:id_tiempo>/delete/', views.delete_tiempo, name='tiempo-delete'),

    # ===========================
    # CRUD PARA TABLA DE HECHOS
    # ===========================
    path('hechos/', views.HechosListView.as_view(), name='hechos-list'),
    path('hechos/create/', views.HechosCreateView.as_view(), name='hechos-create'),
    path('hechos/<int:id_hecho>/', views.HechosUpdateView.as_view(), name='hechos-update'),
    path('hechos/<int:id_hecho>/delete/', views.delete_hecho, name='hechos-delete'),
]
