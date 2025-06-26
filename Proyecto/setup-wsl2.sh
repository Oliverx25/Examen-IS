#!/bin/bash

echo "🐧 Configurando proyecto en WSL2..."

# Verificar que estamos en WSL2
if [[ ! -f /proc/version ]] || ! grep -q "microsoft" /proc/version; then
    echo "❌ Este script debe ejecutarse en WSL2"
    exit 1
fi

# Verificar que Docker esté disponible
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está disponible. Configura Docker Desktop con integración WSL2"
    exit 1
fi

# Configurar Git si no está configurado
if [[ -z $(git config --global user.name) ]]; then
    echo "⚙️  Configurando Git..."
    read -p "Ingresa tu nombre: " git_name
    read -p "Ingresa tu email: " git_email
    git config --global user.name "$git_name"
    git config --global user.email "$git_email"
    git config --global core.autocrlf false
    echo "✅ Git configurado"
fi

# Verificar que estamos en la carpeta correcta
if [[ ! -f "docker-compose.yml" ]]; then
    echo "❌ Ejecuta este script desde la carpeta raíz del proyecto"
    exit 1
fi

echo "🛑 Deteniendo contenedores existentes..."
docker-compose down 2>/dev/null

echo "🏗️  Construyendo e iniciando contenedores..."
docker-compose up --build -d

if [[ $? -eq 0 ]]; then
    echo "🎉 ¡Proyecto iniciado correctamente en WSL2!"
    echo ""
    echo "🌐 URLs disponibles desde Windows:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend: http://localhost:8000"
    echo "   Admin: http://localhost:8000/admin (admin/admin123)"
    echo ""
    echo "📋 Para ver logs: docker-compose logs -f backend"
    echo "🔧 Para acceder al contenedor: docker-compose exec backend bash"
    echo ""
    echo "✨ Ventaja: Sin problemas de terminadores de línea en WSL2!"
else
    echo "❌ Error al iniciar contenedores"
    docker-compose logs backend --tail=20
fi
