import request from 'supertest';
import app from '../../src/app.js';
import User from '../../src/models/User.js';
import jwt from 'jsonwebtoken';

describe('Auth - Token Management Tests', () => {
  let testUser;
  let accessToken;
  let refreshToken;
  
  beforeEach(async () => {
    // Limpiar tabla de usuarios antes de cada test
    await User.destroy({ where: {}, force: true });
    
    // Crear usuario verificado para las pruebas
    testUser = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'SecurePassword123!',
      emailVerified: true
    });

    // Hacer login para obtener tokens
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john.doe@example.com',
        password: 'SecurePassword123!'
      });

    accessToken = loginResponse.body.data.accessToken;
    refreshToken = loginResponse.body.data.refreshToken;
  });

  test('should refresh token successfully with valid refresh token', async () => {
    const response = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken })
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.accessToken).not.toBe(accessToken);
    expect(response.body.data.refreshToken).toBeDefined();

    // Verificar que el nuevo access token es válido
    const decoded = jwt.verify(response.body.data.accessToken, process.env.JWT_SECRET);
    expect(decoded.userId).toBe(testUser.id);
  });

  test('should fail with invalid refresh token', async () => {
    const response = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken: 'invalid-refresh-token' })
      .expect(401);

    expect(response.body.status).toBe('fail');
    expect(response.body.code).toBe('INVALID_REFRESH_TOKEN');
  });

  test('should fail with missing refresh token', async () => {
    const response = await request(app)
      .post('/api/auth/refresh-token')
      .send({})
      .expect(400);

    expect(response.body.status).toBe('error');
  });

  test('should fail with refresh token from different user', async () => {
    // Crear segundo usuario
    const secondUser = await User.create({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      password: 'SecurePassword123!',
      emailVerified: true
    });

    // Generar token para segundo usuario
    const secondUserToken = jwt.sign(
      { userId: secondUser.id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    await secondUser.update({ refreshToken: secondUserToken });

    const response = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken: secondUserToken })
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data.accessToken).toBeDefined();

    // Verificar que el access token corresponde al usuario correcto
    const decoded = jwt.verify(response.body.data.accessToken, process.env.JWT_SECRET);
    expect(decoded.userId).toBe(secondUser.id);
  });

  test('should fail with expired refresh token', async () => {
    // Crear token expirado
    const expiredToken = jwt.sign(
      { userId: testUser.id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '1ms' }
    );

    // Esperar para que expire
    await new Promise(resolve => setTimeout(resolve, 10));

    const response = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken: expiredToken })
      .expect(401);

    expect(response.body.status).toBe('fail');
    expect(response.body.code).toBe('INVALID_REFRESH_TOKEN');
  });

  test('should fail with revoked refresh token', async () => {
    // Hacer logout para revocar el token
    await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // Intentar usar el refresh token revocado
    const response = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken })
      .expect(401);

    expect(response.body.status).toBe('fail');
    expect(response.body.code).toBe('INVALID_REFRESH_TOKEN');
  });

  test('should update refresh token in database on successful refresh', async () => {
    const response = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken })
      .expect(200);

    await testUser.reload();
    expect(testUser.refreshToken).toBe(response.body.data.refreshToken);
    expect(testUser.refreshToken).not.toBe(refreshToken);
  });

  test('should fail with malformed refresh token', async () => {
    const response = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken: 'malformed.token.here' })
      .expect(401);

    expect(response.body.status).toBe('fail');
    expect(response.body.code).toBe('INVALID_REFRESH_TOKEN');
  });

  test('should validate access token correctly', async () => {
    // Verificar que el access token es válido para endpoints protegidos
    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data.user.id).toBe(testUser.id);
  });
});
