Aplicación web desarrollada con Angular (frontend) y Node.js + MySQL (backend) que implementa autenticación de usuarios mediante login 

En este proyecto se desarrolló una aplicación que implementa:

- Login
- Operaciones CRUD 

El usuario debe iniciar sesión para acceder a la sección protegida donde se gestionan los usuarios.

Funciones

- Inicio de sesión con validación de credenciales
- Listado de usuarios
- Creación de usuarios
- Edición de usuarios
- Eliminación de usuarios
- Cierre de sesión

Frontend

- Angular
- TypeScript
- HTML
- CSS

Backend
- Node.js
- Express
- MySQL
- JWT (jsonwebtoken)
- bcryptjs


Cómo ejecutar el proyecto

Iniciar Backend:

cd backend
npm install

crear .env:

PORT=3000
JWT_SECRET=clave
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=clave
DB_NAME=nombredb
DB_PORT=3306

npm run dev

Iniciar Frontend: 

cd frontend
npm install
ng serve

Autor: 
David Carvajal
Estudiante de Ingeniería de Software