#!/bin/bash

echo "Esperando a que PostgreSQL esté listo..."
while ! pg_isready -h db -p 5432 -U postgres; do
    sleep 1
done
echo "PostgreSQL está listo!"

echo "Ejecutando migraciones..."
python manage.py makemigrations
python manage.py migrate

echo "Verificando si ya existen suficientes datos..."
RECORD_COUNT=$(python manage.py shell -c "
try:
    from analytics.models import HechosRendimientoAcademico
    print(HechosRendimientoAcademico.objects.count())
except Exception as e:
    print('0')
" 2>/dev/null | tail -1 | tr -d '\r\n' | grep -o '[0-9]*')

# Verificar si necesitamos poblar más datos (objetivo: 5000+ registros)
if [ -z "$RECORD_COUNT" ] || [ "$RECORD_COUNT" -lt 5000 ]; then
    echo "Se encontraron $RECORD_COUNT registros. Poblando base de datos hasta 5000+ registros..."
    python manage.py populate_data
else
    echo "La base de datos ya contiene $RECORD_COUNT registros."
fi

echo "Creando superusuario si no existe..."
python manage.py shell -c "
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superusuario creado: admin/admin123')
else:
    print('Superusuario ya existe')
"

echo "Iniciando servidor Django..."
python manage.py runserver 0.0.0.0:8000
