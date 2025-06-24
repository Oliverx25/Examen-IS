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

    # Endpoints para actualizar dimensiones
    path('dimension/estudiante/<int:id_estudiante>/', views.EstudianteUpdateView.as_view(), name='estudiante-update'),
    path('dimension/materia/<int:id_materia>/', views.MateriaUpdateView.as_view(), name='materia-update'),
    path('dimension/docente/<int:id_docente>/', views.DocenteUpdateView.as_view(), name='docente-update'),
    path('dimension/programa/<int:id_programa>/', views.ProgramaUpdateView.as_view(), name='programa-update'),

    # Endpoints para listar dimensiones
    path('dimension/estudiante/', views.EstudianteListView.as_view(), name='estudiante-list'),
    path('dimension/materia/', views.MateriaListView.as_view(), name='materia-list'),
    path('dimension/docente/', views.DocenteListView.as_view(), name='docente-list'),
    path('dimension/programa/', views.ProgramaListView.as_view(), name='programa-list'),
    path('dimension/tiempo/', views.TiempoListView.as_view(), name='tiempo-list'),
]
