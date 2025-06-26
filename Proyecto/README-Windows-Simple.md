# Solución Simple para Windows

## Problema
Si ves errores como:
```
/app/init.sh: line 2: $'\r': command not found
```

## Solución Rápida

### Opción 1: Script Automático
```powershell
.\fix-windows-simple.ps1
```

### Opción 2: Manual
1. Configurar Git:
   ```bash
   git config core.autocrlf false
   git config core.eol lf
   ```

2. Reconstruir contenedores:
   ```bash
   docker-compose down
   docker-compose up --build -d
   ```

## Cómo Funciona

El `Dockerfile` ahora incluye esta línea que limpia automáticamente los terminadores de línea:
```dockerfile
RUN sed -i 's/\r$//' /app/init.sh \
    && chmod +x /app/init.sh
```

Esto elimina los caracteres `\r` (retorno de carro) que Windows agrega automáticamente.

## URLs del Proyecto

- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- Admin: http://localhost:8000/admin (admin/admin123)

## Nota

Esta solución funciona automáticamente cada vez que construyes la imagen Docker, sin necesidad de configuraciones adicionales.
