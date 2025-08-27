# **Meraki - MEAN Stack Application**

Aplicación web para la gestión de recetas y costos, desarrollada con el stack **MEAN** (MongoDB, Express.js, Angular, Node.js). Incluye integración con **Google OAuth 2.0** para autenticación y un flujo seguro de inicio de sesión.

---

## 🚀 **Tecnologías**

* **Frontend:** Angular 18+ (standalone components)
* **Backend:** Node.js + Express.js
* **Base de datos:** MongoDB Atlas (cloud)
* **Autenticación:** Google OAuth 2.0 + JWT
* **Contenedores:** Docker + Docker Compose
* **Entorno:** Desarrollo containerizado

---

## ✅ **Características principales**

* ✅ **Login tradicional (email/contraseña)**
* ✅ **Autenticación con Google OAuth 2.0** (`passport-google-oauth20`)
* ✅ **Protección de rutas con `AuthGuard` en Angular**
* ✅ **Gestión reactiva del estado de sesión con `BehaviorSubject` en `AuthService`**
* ✅ **Verificación automática de expiración del token JWT**
* ✅ **Redirección segura mediante `APP_INITIALIZER`**

---

## 📋 **Requisitos**

* **Docker:** 20.10+
* **Docker Compose:** 2.0+
* **Node.js:** 18+ (solo para desarrollo local)
* Cuenta de **Google Cloud** para credenciales OAuth (Client ID y Secret)

---

## 🛠️ **Instalación**

### **1. Clonar el repositorio**

```bash
git clone https://github.com/hguevara1/Meraki-Angular.git
cd Meraki-Angular
```

### **2. Configurar variables de entorno**

Copia el archivo `.env.example` y edítalo:

```bash
cp .env.example .env
```

Contenido mínimo:

```env
# MongoDB
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/meraki

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro

# Puerto backend
PORT=5000

# Google OAuth
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret

# URLs
FRONTEND_URL=http://localhost:4200
BACKEND_URL=http://localhost:5000
```

---

## 🐳 **Ejecución con Docker (Recomendado)**

### **1. Construir y levantar contenedores**

```bash
docker-compose up --build
```

### **2. Acceder a las aplicaciones**

* **Frontend Angular:** [http://localhost:4200](http://localhost:4200)
* **Backend API:** [http://localhost:5000](http://localhost:5000)
* **MongoDB:** Cloud (MongoDB Atlas)

### **3. Ejecutar en segundo plano**

```bash
docker-compose up -d
```

---

## 🔐 **Flujo de Autenticación**

Este es el flujo implementado para **Google OAuth 2.0 + JWT + Angular Hash Location**:

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as Frontend (Angular)
    participant BE as Backend (Express + Passport)
    participant G as Google OAuth

    U->>FE: Click en "Login con Google"
    FE->>BE: GET /api/auth/google
    BE->>G: Redirige a Google OAuth
    G->>U: Solicita permisos y autenticación
    U->>G: Proporciona credenciales Google
    G->>BE: Devuelve datos del usuario (profile, email)
    BE->>BE: Genera JWT con datos del usuario
    BE->>FE: Redirige a http://localhost:4200/#/auth-callback?token=JWT&success=true
    FE->>FE: APP_INITIALIZER guarda token y userData en localStorage
    FE->>FE: AuthCallback navega a /dashboard
    FE->>U: Usuario autenticado y en panel principal
```

---

## 📁 **Estructura del Proyecto**

```
Meraki-Angular/
├── app/
│   ├── backend/
│   │   ├── routes/
│   │   ├── config/
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── services/auth.service.ts
│   │   │   │   ├── guards/auth.guard.ts
│   │   │   │   ├── pages/auth-callback/
│   │   │   │   └── pages/login/
│   │   ├── package.json
│   │   └── angular.json
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🔧 **Comandos Docker útiles**

```bash
# Ver logs
docker-compose logs -f

# Detener contenedores
docker-compose down

# Reconstruir imágenes
docker-compose build

# Ejecutar comando dentro del backend
docker-compose exec backend npm test
```

