// Esta interfaz define la estructura de los datos que enviaremos al backend al iniciar sesión
export interface LoginRequest {
  // Correo del usuario
  correo: string;

  // Contraseña del usuario
  contrasena: string;
}