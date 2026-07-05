const request = require('supertest');
const app = require('../src/app');

/**
 * PRUEBA FUNCIONAL 1
 * Verifica el endpoint de autenticación: login exitoso y login fallido.
 * IMPORTANTE: usa la base de datos configurada en tu .env local,
 * por lo que el usuario de prueba debe existir en tu tabla `usuarios`.
 */
describe('POST /api/auth/login', () => {
  it('debe devolver un token cuando las credenciales son correctas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ correo: 'davidtest@gmail.com', contrasena: '123456' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('rol');
  });

  it('debe devolver 401 cuando la contraseña es incorrecta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ correo: 'davidtest@gmail.com', contrasena: 'clave_incorrecta' });

    expect(res.statusCode).toBe(401);
  });
});
