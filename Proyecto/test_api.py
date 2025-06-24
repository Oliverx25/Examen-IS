#!/usr/bin/env python3
"""
Script de prueba para verificar el funcionamiento de las APIs del Data Warehouse
"""
import requests
import json
import time
import sys

API_BASE_URL = 'http://localhost:8000/api'

def test_endpoint(url, description):
    """Prueba un endpoint específico"""
    try:
        print(f"🔍 Probando: {description}")
        print(f"   URL: {url}")

        response = requests.get(url, timeout=10)

        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Éxito - Status: {response.status_code}")

            if isinstance(data, dict):
                if 'results' in data:
                    print(f"   📊 Registros encontrados: {len(data['results'])}")
                elif 'data' in data:
                    print(f"   📊 Registros encontrados: {len(data['data'])}")
                else:
                    print(f"   📊 Respuesta: {list(data.keys())}")
            elif isinstance(data, list):
                print(f"   📊 Registros encontrados: {len(data)}")

            return True
        else:
            print(f"   ❌ Error - Status: {response.status_code}")
            print(f"   📝 Respuesta: {response.text[:200]}...")
            return False

    except requests.exceptions.ConnectionError:
        print(f"   ❌ Error de conexión - ¿Está ejecutándose el servidor?")
        return False
    except requests.exceptions.Timeout:
        print(f"   ❌ Timeout - El servidor tardó más de 10 segundos en responder")
        return False
    except Exception as e:
        print(f"   ❌ Error inesperado: {str(e)}")
        return False

def main():
    print("🚀 Iniciando pruebas de la API del Data Warehouse")
    print("=" * 60)

    # Esperar a que el servidor esté listo
    print("⏳ Esperando a que el servidor esté disponible...")
    max_attempts = 30
    for attempt in range(max_attempts):
        try:
            response = requests.get(f"{API_BASE_URL}/", timeout=5)
            if response.status_code in [200, 404]:  # 404 es OK, significa que el servidor responde
                print("✅ Servidor disponible!")
                break
        except:
            if attempt < max_attempts - 1:
                time.sleep(2)
                print(f"   Intento {attempt + 1}/{max_attempts}...")
            else:
                print("❌ No se pudo conectar al servidor después de varios intentos")
                sys.exit(1)

    print("\n" + "=" * 60)

    # Lista de endpoints para probar
    endpoints = [
        # Dashboard
        (f"{API_BASE_URL}/analytics/dashboard/", "Dashboard - Resumen general"),

        # Analytics
        (f"{API_BASE_URL}/analytics/tasa-reprobacion/", "Analytics - Tasa de reprobación"),
        (f"{API_BASE_URL}/analytics/materias-sobresalientes/", "Analytics - Materias sobresalientes"),
        (f"{API_BASE_URL}/analytics/evolucion-promedio/", "Analytics - Evolución del promedio"),

        # Dimensiones
        (f"{API_BASE_URL}/dimension/estudiante/", "Dimensión - Estudiantes"),
        (f"{API_BASE_URL}/dimension/materia/", "Dimensión - Materias"),
        (f"{API_BASE_URL}/dimension/docente/", "Dimensión - Docentes"),
        (f"{API_BASE_URL}/dimension/tiempo/", "Dimensión - Tiempo"),
        (f"{API_BASE_URL}/dimension/programa/", "Dimensión - Programas"),
    ]

    # Ejecutar pruebas
    passed = 0
    total = len(endpoints)

    for url, description in endpoints:
        if test_endpoint(url, description):
            passed += 1
        print()  # Línea en blanco para separar pruebas

    # Resumen
    print("=" * 60)
    print(f"📋 RESUMEN DE PRUEBAS:")
    print(f"   ✅ Pruebas exitosas: {passed}/{total}")
    print(f"   ❌ Pruebas fallidas: {total - passed}/{total}")

    if passed == total:
        print("\n🎉 ¡Todas las pruebas pasaron! El Data Warehouse está funcionando correctamente.")
        return 0
    else:
        print(f"\n⚠️  {total - passed} prueba(s) fallaron. Revisa la configuración.")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
