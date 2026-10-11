# **Meraki - MEAN Stack Application**

Aplicación web completa para la gestión de pastelería, desarrollada con el stack **MEAN** (MongoDB, Express.js, Angular, Node.js). Incluye integración con **Google OAuth 2.0** para autenticación y un sistema completo de gestión de ingredientes, subrecetas, tortas y presupuestos.

---

## 🚀 **Tecnologías**

* **Frontend:** Angular 18+ (standalone components) + Angular Material
* **Backend:** Node.js + Express.js
* **Base de datos:** MongoDB Atlas (cloud)
* **Autenticación:** Google OAuth 2.0 + JWT
* **UI/UX:** Diseño responsive con componentes reutilizables
* **Contenedores:** Docker + Docker Compose
* **Testing:** Jasmine + Karma + GitHub Actions CI/CD
* **Entorno:** Desarrollo containerizado

---

## ✅ **Características principales**

* ✅ **Login tradicional (email/contraseña)**
* ✅ **Autenticación con Google OAuth 2.0** (`passport-google-oauth20`)
* ✅ **Protección de rutas con `AuthGuard` en Angular**
* ✅ **Gestión reactiva del estado de sesión con `BehaviorSubject`**
* ✅ **Verificación automática de expiración del token JWT**
* ✅ **Redirección segura mediante `APP_INITIALIZER`**
* ✅ **Dashboard unificado con métricas y navegación**
* ✅ **Sistema completo de gestión de ingredientes**
* ✅ **Creación y edición de subrecetas con costos automáticos**
* ✅ **Constructor de tortas con múltiples subrecetas**
* ✅ **Generador de presupuestos con márgenes configurables**
* ✅ **Interfaz responsive y consistente en todas las vistas**
* ✅ **Componente de encabezado reutilizable con cierre de sesión**
* ✅ **Sistema completo de testing con 191+ pruebas automatizadas**
* ✅ **CI/CD integrado con GitHub Actions**

---

## 📋 **Módulos de la Aplicación**

### **Dashboard**
- Vista principal con métricas resumidas
- Accesos rápidos a todas las funcionalidades
- Navegación lateral organizada por categorías

### **Gestión de Ingredientes**
- CRUD completo de ingredientes
- Campos: nombre, precio, medida, unidad
- Validación de datos y cálculos automáticos

### **Subrecetas**
- Creación de preparaciones con múltiples ingredientes
- Cálculo automático de costos
- Factor de multiplicación ajustable

### **Tortas**
- Constructor de tortas con subrecetas
- Sistema de presupuestos con márgenes configurables
- Vista previa de costos y precios de venta

### **Presupuestos**
- Generador de presupuestos detallados
- Configuración de porcentajes de gastos y ganancia
- Impresión y exportación de presupuestos

---

## 🧪 **Sistema de Testing**

### **Cobertura de Tests**
- **✅ 198 pruebas automatizadas** ejecutándose en CI/CD
- **✅ 0 fallos** - Todas las pruebas pasan correctamente
- **✅ Cobertura completa** de servicios y componentes críticos

### **Servicios Testeados**
- **AuthService** - Autenticación, tokens, gestión de sesión
- **LanguageService** - Internacionalización y manejo de idiomas
- **ThemeService** - Sistema de temas claro/oscuro
- **VideoModalComponent** - Componente de modal para videos

### **Características de Testing**
- ✅ Tests unitarios y de integración
- ✅ Mocks de servicios y dependencias
- ✅ Pruebas de autenticación y autorización
- ✅ Validación de formularios y comportamientos UI
- ✅ CI/CD integrado con GitHub Actions
- ✅ Ejecución en entorno headless para CI

---

## 🛠️ **Instalación**

### **1. Clonar el repositorio**

```bash
git clone https://github.com/hguevara1/Meraki-Angular.git
cd Meraki-Angular
````

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
### 🖥️ Notas de Desarrollo Local (Docker)

El frontend está configurado de forma dinámica en `src/index.html` para detectar el entorno de ejecución:
* Si accedes desde `localhost`, las peticiones de la API se redirigen automáticamente a `http://localhost:5000/api`.
* En entornos de staging/producción containerizados, se mantiene la resolución interna a `http://backend:5000/api`.

No es necesario modificar el archivo `environment.docker.ts` ni el archivo `hosts` del sistema operativo para realizar pruebas locales.

---

## 🧪 **Ejecución de Tests**

### **Ejecutar todos los tests**

```bash
cd app/frontend
npm test
```

### **Ejecutar tests específicos**

```bash
# Solo tests de servicios
npm run test -- --include='**/*.service.spec.ts'

# Tests de AuthService
npm run test -- --include='**/auth.service.spec.ts'

# Tests con cobertura
npm run test:ci
```

### **Tests en CI/CD**

Los tests se ejecutan automáticamente en cada push y pull request mediante GitHub Actions, incluyendo:

* ✅ Tests del backend en contenedor Docker
* ✅ Tests del frontend con ChromeHeadless
* ✅ Verificación de conectividad entre servicios
* ✅ Generación de reportes de cobertura

---

## 🔐 **Flujo de Autenticación y Rutas**

Este diagrama muestra **qué rutas son públicas y cuáles requieren token JWT**:

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as Frontend (Angular)
    participant BE as Backend (Express)
    participant G as Google OAuth

    %% Login tradicional
    U->>FE: POST /api/users/login (email/password)
    FE->>BE: Enviar credenciales
    BE-->>FE: 200 OK + JWT (si válido)
    FE->>FE: Guardar token en localStorage
    FE->>U: Usuario autenticado

    %% Registro de usuario
    U->>FE: POST /api/users/register
    FE->>BE: Enviar datos registro
    BE-->>FE: 201 Created + JWT
    FE->>FE: Guardar token
    FE->>U: Usuario registrado y autenticado

    %% Google OAuth
    U->>FE: Click en "Login con Google"
    FE->>BE: GET /api/auth/google
    BE->>G: Redirige a Google OAuth
    G->>U: Solicita permisos y autenticación
    U->>G: Proporciona credenciales
    G->>BE: Devuelve profile/email
    BE->>BE: Genera JWT
    BE->>FE: Redirige a FE con token
    FE->>FE: Guarda token y userData

    %% Rutas protegidas (requieren JWT)
    FE->>BE: GET /api/users (listar usuarios)
    FE->>BE: GET /api/ingredientes
    FE->>BE: GET /api/subrecetas
    FE->>BE: GET /api/tortas
    BE->>FE: Devuelve datos solo si token válido

    %% Logout
    U->>FE: Click Logout
    FE->>FE: Borrar token/localStorage
    FE->>BE: GET /api/auth/logout
    BE->>FE: Sesión cerrada
```

---

## 🎨 **Interfaz de Usuario**

### **Características de UI/UX**

* **Diseño consistente** en todas las vistas
* **Encabezado reutilizable** con botón de cierre de sesión
* **Navegación intuitiva** con breadcrumbs y botones de retroceso
* **Tablas responsivas** con scroll interno y headers fijos
* **Formularios validados** con mensajes de error claros
* **Estados vacíos** informativos con llamadas a la acción
* **Temas claros/oscuros** con toggle de tema

### **Componentes Reutilizables**

* `HeaderComponent` - Encabezado con logo, usuario y cierre de sesión
* `ThemeToggleComponent` - Selector de tema claro/oscuro
* Tablas responsivas con paginación y ordenamiento
* Formularios con validación y mensajes de error

---

## 📁 **Estructura del Proyecto**

```
Meraki-Angular/
├── app/
│   ├── backend/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── ingredientes.js
│   │   │   ├── subrecetas.js
│   │   │   ├── tortas.js
│   │   │   └── presupuestos.js
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── passport.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Ingrediente.js
│   │   │   ├── Subreceta.js
│   │   │   ├── Torta.js
│   │   │   └── Presupuesto.js
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── services/
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   └── api.service.ts
│   │   │   │   ├── guards/
│   │   │   │   │   └── auth.guard.ts
│   │   │   │   ├── components/
│   │   │   │   │   ├── header/
│   │   │   │   │   └── theme-toggle/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── login/
│   │   │   │   │   ├── auth-callback/
│   │   │   │   │   ├── ingredientes/
│   │   │   │   │   ├── subrecetas/
│   │   │   │   │   ├── tortas/
│   │   │   │   │   └── presupuestos/
│   │   │   │   └── app.config.ts
│   │   ├── package.json
│   │   └── angular.json
│   └── Dockerfile
├── .github/workflows/
│   └── docker-test.yml          # CI/CD con GitHub Actions
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

# Reiniciar contenedores específicos
docker-compose restart frontend
```

---

## 📊 **Endpoints de la API**

### **Autenticación**

* `GET /api/auth/google` - Iniciar autenticación Google
* `GET /api/auth/google/callback` - Callback de Google OAuth
* `GET /api/auth/logout` - Cerrar sesión
* `GET /api/auth/status` - Verificar estado de autenticación

### **Usuarios**

* `POST /api/users/register` - Crear usuario (pública)
* `POST /api/users/login` - Login (pública)
* `GET /api/users` - Listar usuarios (protegida)
* `GET /api/users/:id` - Obtener usuario (protegida)
* `PUT /api/users/:id` - Actualizar usuario (protegida)
* `DELETE /api/users/:id` - Eliminar usuario (protegida)

### **Ingredientes**

* `GET /api/ingredientes` - Listar todos los ingredientes
* `POST /api/ingredientes` - Crear nuevo ingrediente
* `PUT /api/ingredientes/:id` - Actualizar ingrediente
* `DELETE /api/ingredientes/:id` - Eliminar ingrediente

### **Subrecetas**

* `GET /api/subrecetas` - Listar todas las subrecetas
* `POST /api/subrecetas` - Crear nueva subreceta
* `PUT /api/subrecetas/:id` - Actualizar subreceta
* `DELETE /api/subrecetas/:id` - Eliminar subreceta

### **Tortas**

* `GET /api/tortas` - Listar todas las tortas
* `POST /api/tortas` - Crear nueva torta
* `PUT /api/tortas/:id` - Actualizar torta
* `DELETE /api/tortas/:id` - Eliminar torta

### **Presupuestos**

* `GET /api/presupuestos` - Listar presupuestos
* `POST /api/presupuestos` - Crear nuevo presupuesto
* `GET /api/presupuestos/:id` - Obtener presupuesto específico

---

## 🚀 **Próximas Características**

* [ ] Exportación de presupuestos a PDF
* [ ] Inventario y control de stock
* [ ] Historial de precios de ingredientes
* [ ] Múltiples usuarios y permisos
* [ ] Modo offline con sincronización
* [ ] App móvil con Ionic/Capacitor
* [ ] Más pruebas de integración y E2E

---

## 📝 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 🤝 **Contribución**

Las contribuciones son bienvenidas. Por favor, lee las guías de contribución antes de enviar un pull request.

---

## 📞 **Soporte**

Si tienes preguntas o problemas, por favor abre un issue en el repositorio o contacta al equipo de desarrollo.

---

**Meraki** - Hecho con 💙 para pasteleros y reposteros

```
