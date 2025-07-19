import request from 'supertest';
import app from '../../src/app.js';
import User from '../../src/models/User.js';

describe('Auth - Protected Endpoints Tests', () => {
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

  describe('GET /api/auth/profile', () => {
    test('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.firstName).toBe(testUser.firstName);
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data.user).not.toHaveProperty('passwordResetToken');
    });

    test('should fail without authentication token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.status).toBe('fail');
    });

    test('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.status).toBe('fail');
    });

    test('should fail with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expect(response.body.status).toBe('fail');
    });
  });

  describe('POST /api/auth/change-password', () => {
    test('should change password successfully', async () => {
      const newPassword = 'NewSecurePassword123!';

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'SecurePassword123!',
          newPassword: newPassword
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('changed');

      // Verificar que puede hacer login con la nueva contraseña
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: newPassword
        })
        .expect(200);

      expect(loginResponse.body.status).toBe('success');
    });

    test('should fail with incorrect current password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewSecurePassword123!'
        })
        .expect(401);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('incorrect');
    });

    test('should fail with weak new password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'SecurePassword123!',
          newPassword: 'weak'
        })
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .send({
          currentPassword: 'SecurePassword123!',
          newPassword: 'NewSecurePassword123!'
        })
        .expect(401);

      expect(response.body.status).toBe('fail');
    });

    test('should fail with missing current password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          newPassword: 'NewSecurePassword123!'
        })
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    test('should fail with missing new password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'SecurePassword123!'
        })
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    test('should fail when new password equals current password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'SecurePassword123!',
          newPassword: 'SecurePassword123!'
        })
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('different');
    });
  });

  describe('POST /api/auth/logout', () => {
    test('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('successful');

      // Verificar que el refresh token fue eliminado
      await testUser.reload();
      expect(testUser.refreshToken).toBeNull();
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.status).toBe('fail');
    });

    test('should fail with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.status).toBe('fail');
    });

    test('should invalidate access token after logout', async () => {
      // Hacer logout
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Intentar usar el access token en un endpoint protegido
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);

      expect(response.body.status).toBe('fail');
    });

    test('should invalidate refresh token after logout', async () => {
      // Hacer logout
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Intentar usar el refresh token
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken })
        .expect(401);

      expect(response.body.status).toBe('fail');
    });
  });
});
