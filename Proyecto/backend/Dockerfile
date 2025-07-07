# Usar una imagen base de Python 3.11 (compatible con MacOS y Windows)
FROM python:3.11-slim

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY requirements.txt .

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Crear usuario no-root para seguridad
RUN adduser --disabled-password --gecos '' appuser

# Copiar el código fuente
COPY . .

# Dar permisos al usuario
RUN chown -R appuser:appuser /app
USER appuser

# Exponer el puerto
EXPOSE 8000

# Comando por defecto
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
