# Selector de Planes

Aplicación web desarrollada con Angular (frontend) y Node.js + MySQL (backend) que implementa autenticación de usuarios y un panel de administración MVC para gestionar el core del sistema de recomendación de planes.

---

## Descripción

El sistema permite a un administrador gestionar los datos que alimentan el core de recomendación de planes. Un usuario debe iniciar sesión para acceder al panel protegido donde puede administrar planes, categorías y usuarios.


Funcionalidades

Autenticación
- Inicio de sesión con validación de credenciales
- Protección de rutas mediante JWT
- Cierre de sesión

Administración de Usuarios
- Listado de usuarios registrados
- Creación de usuarios con contraseña hasheada (bcrypt)
- Edición y eliminación de usuarios
- Validación de correo único en backend (**dato sensible**)

Administración de Planes 

- Creación de planes con:
  - Nombre y descripción
  - Presupuesto mínimo y máximo
  - Categoría (dropdown)
  - Tipo de compañía (dropdown)
  - Ubicación con **dropdowns en cascada**: País → Provincia → Ciudad
  - Privacidad y estado
- Edición y eliminación de planes

- Validaciones en backend:
  - Presupuesto mínimo no puede ser negativo
  - Presupuesto máximo debe ser mayor o igual al mínimo
  - Los IDs de categoría, tipo y ciudad deben existir en BD antes de guardar

Tecnologías

Frontend
- Angular 21 · TypeScript · HTML · CSS
- Angular Router con guards para rutas protegidas

Backend
- Node.js · Express · MySQL (mysql2)
- JWT · bcryptjs · dotenv

Endpoints principales

Auth

POST /api/auth/login
POST /api/auth/register 

Planes

GET  /api/planes
POST /api/planes
PUT /api/planes/:id
DELETE /api/planes/:id

Ubicaciones
GET /api/ubicaciones/paises
GET /api/ubicaciones/provincias/:paisId
GET /api/ubicaciones/ciudades/:provinciaId

Cómo ejecutar el proyecto

Backend

cd backend
npm install


Crear .env en la carpeta backend:

PORT=3000
JWT_SECRET=clave
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=selector_planes


Frontend

cd frontend
npm install
ng serve

Abrir http://localhost:4200

Autor

David Carvajal 
Estudiante de Ingeniería de Software                      