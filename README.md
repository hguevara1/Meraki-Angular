# Meraki - MEAN Stack Application

Este es un proyecto para gestionar una aplicación web completa utilizando el stack MEAN (MongoDB, Express.js, Angular, Node.js) con Docker.

## 🚀 Tecnologías

- **Frontend:** Angular 18+
- **Backend:** Node.js + Express.js
- **Base de datos:** MongoDB Atlas (cloud)
- **Contenedores:** Docker + Docker Compose
- **Entorno:** Desarrollo containerizado

## 📋 Requisitos

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+ (solo para desarrollo local opcional)

## 🛠️ Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/hguevara1/Meraki-Angular.git
   cd Meraki-Angular
   ```

2. Configura las variables de entorno:
   ```bash
    # Copia el archivo de ejemplo y configura tus variables
    cp .env.example .env
   ```
Edita el archivo .env con tus configuraciones:

```bash
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/meraki
JWT_SECRET=tu_jwt_secret_super_seguro
PORT=5000
```
## 🐳 Uso con Docker (Recomendado)
1. Construye y levanta los contenedores:

```bash
docker-compose up --build
```
2. Accede a las aplicaciones:

* Frontend Angular: http://localhost:4200

* Backend API: http://localhost:5000

* MongoDB: En la nube (Atlas)

3. Para ejecutar en segundo plano:

```bash
docker-compose up -d
```

## 🐳 Uso con Docker Compose (Opcional)
1. Configura el archivo `docker-compose.yml` con tus configuraciones.
2. Ejecuta `docker-compose up --build` para construir y levantar los contenedores.
3. Accede a las aplicaciones:
   * Frontend Angular: http://localhost:4200
   * Backend API: http://localhost:5000
   * MongoDB: En la nube (Atlas)

## 📁 Estructura del Proyecto
Meraki-Angular/
├── app/
│   ├── backend/
│   │   ├── src/
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── frontend/
│   │   ├── src/
│   │   ├── package.json
│   │   └── angular.json
│   └── Dockerfile (frontend)
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md

## 🔧 Comandos Docker Útiles
```bash
# Ver logs en tiempo real
docker-compose logs -f

# Detener contenedores
docker-compose down

# Reconstruir imágenes
docker-compose build

# Ejecutar comando específico en un contenedor
docker-compose exec backend npm test
```
## En construcción