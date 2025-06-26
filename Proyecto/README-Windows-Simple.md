# Solución Simple para Windows

## Problema
Si ves errores como:
```
/app/init.sh: line 2: $'\r': command not found
```

## 🚀 Solución Recomendada: WSL2

### ¿Por qué usar WSL2?
- ✅ **Sin problemas de terminadores de línea**
- ✅ **Mejor rendimiento con Docker**
- ✅ **Experiencia nativa de Linux**
- ✅ **Acceso desde Windows con localhost**

### Configuración WSL2:
1. **Instalar WSL2:**
   ```cmd
   wsl --install
   ```

2. **Configurar Docker Desktop:**
   - Settings → General → ✅ "Use the WSL 2 based engine"
   - Settings → Resources → WSL Integration → ✅ Habilitar tu distribución

3. **Clonar y ejecutar en WSL2:**
   ```bash
   # Abrir WSL2
   wsl

   # Clonar en WSL2 (IMPORTANTE: no en /mnt/c/)
   cd ~
   git clone [tu-repositorio]
   cd tu-proyecto/Proyecto

   # Ejecutar script automático
   chmod +x setup-wsl2.sh
   ./setup-wsl2.sh
   ```

4. **Acceder desde Windows:**
   - Frontend: http://localhost:3000 ✅
   - Backend: http://localhost:8000 ✅
   - Admin: http://localhost:8000/admin ✅

## 🔧 Alternativa: Solución Directa en Windows

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

## Cómo Funciona la Solución Windows

El `Dockerfile` incluye esta línea que limpia automáticamente los terminadores de línea:
```dockerfile
RUN sed -i 's/\r$//' /app/init.sh \
    && chmod +x /app/init.sh
```

## 📁 Acceso a Archivos

### Desde WSL2:
```bash
# Archivos en WSL2
~/mi-proyecto/
```

### Desde Windows:
```
# Explorador de Windows
\\wsl$\Ubuntu\home\usuario\mi-proyecto
```

## URLs del Proyecto

- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- Admin: http://localhost:8000/admin (admin/admin123)

## 💡 Recomendación

**Para desarrollo regular**: Usa WSL2 - es la mejor experiencia
**Para pruebas rápidas**: Usa el script de Windows - funciona automáticamente
