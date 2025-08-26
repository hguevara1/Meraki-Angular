# Usar la imagen base de Node.js
FROM node:18

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY frontend/package.json frontend/package-lock.json ./

# Instalar Angular CLI y dependencias con flag --legacy-peer-deps
RUN npm install -g @angular/cli
RUN npm install --legacy-peer-deps

# Copiar el resto de los archivos del frontend
COPY frontend/ ./

# ✅ SOLUCIÓN: Usar environment.docker.ts como environment.ts
RUN cp ./src/environments/environment.docker.ts ./src/environments/environment.ts

# Reinstalar dependencias para asegurar compatibilidad
RUN npm install --legacy-peer-deps

# Exponer el puerto 4200
EXPOSE 4200

# Comando para ejecutar ng serve
CMD ["ng", "serve", "--host", "0.0.0.0", "--disable-host-check", "--poll", "1000"]