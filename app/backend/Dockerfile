FROM node:18

WORKDIR /app

# ✅ Configurar npm para usar registry correcto y evitar problemas
RUN npm config set registry https://registry.npmjs.org/
RUN npm config set strict-ssl false
RUN npm config set fetch-retries 5
RUN npm config set fetch-retry-mintimeout 10000
RUN npm config set fetch-retry-maxtimeout 60000

COPY package*.json ./

# ✅ Usar --legacy-peer-deps para evitar problemas de compatibilidad
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE ${PORT}

# ✅ Usar index.js en lugar de server.js
CMD ["node", "index.js"]