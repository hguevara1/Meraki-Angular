# Imagen base
FROM node:20

# Crear directorio de trabajo
WORKDIR /usr/src/app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install --production

# Copiar el resto del backend
COPY . .

# Exponer puerto
EXPOSE 5000

# Comando de inicio
CMD ["node", "server.js"]
