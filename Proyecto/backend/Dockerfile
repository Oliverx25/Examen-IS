FROM python:3.11-slim

# Configurar variables de entorno
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
        netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de dependencias
COPY requirements.txt /app/

# Instalar dependencias de Python
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

# Copiar código de la aplicación
COPY . /app/

# Crear directorio para archivos estáticos
RUN mkdir -p /app/staticfiles

# Dar permisos de ejecución al script de inicialización
# Lo movemos después de COPY para asegurar que el archivo existe
RUN chmod +x /app/init.sh

# Exponer puerto
EXPOSE 8000

# Comando por defecto - usar bash explícitamente
CMD ["bash", "/app/init.sh"]
