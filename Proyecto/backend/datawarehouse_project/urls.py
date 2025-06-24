"""
URL Configuration for datawarehouse_project
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root(request):
    """Endpoint raíz de la API que proporciona información básica"""
    return JsonResponse({
        'message': 'API del Data Warehouse - Análisis de Rendimiento Académico',
        'version': '1.0',
        'endpoints': {
            'analytics': '/api/analytics/',
            'load_data': '/api/load-data/',
            'dimensions': '/api/dimension/',
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api-root'),
    path('api/', include('analytics.urls')),
]
