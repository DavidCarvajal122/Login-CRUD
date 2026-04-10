// Importa ApplicationConfig para configurar la app
import { ApplicationConfig } from '@angular/core';

// Importa provideRouter para registrar las rutas
import { provideRouter } from '@angular/router';

// Importa provideHttpClient para habilitar peticiones HTTP
import { provideHttpClient } from '@angular/common/http';

// Importa las rutas definidas en app.routes
import { routes } from './app.routes';

// Exporta la configuración principal de Angular
export const appConfig: ApplicationConfig = {
  providers: [
    // Registra las rutas de la app
    provideRouter(routes),

    // Habilita HttpClient en toda la aplicación
    provideHttpClient()
  ]
};