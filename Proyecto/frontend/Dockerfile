FROM nginx:alpine

# Copiar archivos estáticos al directorio de nginx
COPY . /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 3000
EXPOSE 3000

# Comando por defecto (nginx se ejecuta automáticamente)
CMD ["nginx", "-g", "daemon off;"]
