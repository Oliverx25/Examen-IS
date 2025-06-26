# Script simple para solucionar problemas de terminadores de línea en Windows
# Ejecutar desde PowerShell en la carpeta raíz del proyecto

Write-Host "🔧 Solucionando problemas de terminadores de línea..." -ForegroundColor Green

# Verificar si estamos en la carpeta correcta
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "❌ Error: Ejecuta este script desde la carpeta raíz del proyecto" -ForegroundColor Red
    exit 1
}

# Configurar Git para proyectos Docker
Write-Host "⚙️  Configurando Git..." -ForegroundColor Cyan
if (Get-Command git -ErrorAction SilentlyContinue) {
    git config core.autocrlf false
    git config core.eol lf
    Write-Host "✅ Git configurado correctamente" -ForegroundColor Green
} else {
    Write-Host "⚠️  Git no encontrado" -ForegroundColor Yellow
}

# Detener contenedores
Write-Host "🛑 Deteniendo contenedores..." -ForegroundColor Cyan
docker-compose down 2>$null

# Reconstruir con la solución integrada en el Dockerfile
Write-Host "🏗️  Reconstruyendo contenedores..." -ForegroundColor Cyan
docker-compose up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 ¡Contenedores iniciados correctamente!" -ForegroundColor Green
    Start-Sleep -Seconds 8

    Write-Host "📋 Verificando logs del backend:" -ForegroundColor Cyan
    docker-compose logs backend --tail=20

    Write-Host "`n🌐 URLs disponibles:" -ForegroundColor Green
    Write-Host "   Backend: http://localhost:8000" -ForegroundColor White
    Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "   Admin: http://localhost:8000/admin (admin/admin123)" -ForegroundColor White
} else {
    Write-Host "❌ Error al iniciar contenedores:" -ForegroundColor Red
    docker-compose logs backend --tail=30
}

Write-Host "`n✨ El Dockerfile ahora incluye limpieza automática de terminadores de línea" -ForegroundColor Green
