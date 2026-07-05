const request = require('supertest');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = require('../src/app');

/**
 * PRUEBA FUNCIONAL 2
 * Verifica el endpoint del core: /api/recomendaciones.
 * Genera un token válido manualmente (mismo JWT_SECRET del .env)
 * para no depender del endpoint de login en esta prueba.
 */
describe('POST /api/recomendaciones', () => {
  const token = jwt.sign(
    { id: 2, rol: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  it('debe devolver los planes ordenados de mayor a menor puntaje', async () => {
    const res = await request(app)
      .post('/api/recomendaciones')
      .set('Authorization', `Bearer ${token}`)
      .send({
        presupuesto_min: 10,
        presupuesto_max: 100,
        id_tipo_compania: 3,
        categorias: [3],
        privacidad: false,
        origen: 'todos'
      });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.recomendaciones)).toBe(true);

    const puntajes = res.body.recomendaciones.map(r => r.puntaje_total);
    const ordenadoDescendente = [...puntajes].sort((a, b) => b - a);
    expect(puntajes).toEqual(ordenadoDescendente);
  });

  it('debe rechazar un presupuesto máximo menor al mínimo con error 400', async () => {
    const res = await request(app)
      .post('/api/recomendaciones')
      .set('Authorization', `Bearer ${token}`)
      .send({ presupuesto_min: 100, presupuesto_max: 10 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/mayor o igual/i);
  });
});
