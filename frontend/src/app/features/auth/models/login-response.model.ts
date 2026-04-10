// Esta interfaz define cómo esperamos recibir la respuesta del backend al hacer login
export interface LoginResponse {
  // Mensaje de respuesta del servidor
  message: string;

  // Token JWT que devuelve el backend
  token: string;

  // Datos básicos del usuario autenticado
  user: {
    // ID del usuario
    id: number;

    // Nombre del usuario
    nombre: string;

    // Correo del usuario
    correo: string;
  };
}