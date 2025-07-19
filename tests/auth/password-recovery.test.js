import request from 'supertest';
import app from '../../src/app.js';
import User from '../../src/models/User.js';
import crypto from 'crypto';

describe('Auth - Password Recovery Tests', () => {
  let testUser;
  
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
  });

  describe('Forgot Password', () => {
    test('should send password reset email for existing user', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('sent');

      // Verificar que se generó el token de reset
      await testUser.reload();
      expect(testUser.passwordResetToken).toBeDefined();
      expect(testUser.passwordResetExpires).toBeDefined();
      expect(new Date(testUser.passwordResetExpires) > new Date()).toBe(true);
    });

    test('should handle non-existent email gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      // Por seguridad, siempre devuelve éxito
      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('sent');
    });

    test('should fail with missing email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({})
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    test('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    test('should generate different tokens for multiple requests', async () => {
      // Primera solicitud
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      await testUser.reload();
      const firstToken = testUser.passwordResetToken;

      // Segunda solicitud
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      await testUser.reload();
      const secondToken = testUser.passwordResetToken;

      expect(firstToken).not.toBe(secondToken);
    });
  });

  describe('Reset Password', () => {
    let resetToken;

    beforeEach(async () => {
      // Generar token de reset
      resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      await testUser.update({
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires
      });
    });

    test('should reset password successfully with valid token', async () => {
      const newPassword = 'NewSecurePassword123!';

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: newPassword
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('reset');

      // Verificar que se limpió el token de reset
      await testUser.reload();
      expect(testUser.passwordResetToken).toBeNull();
      expect(testUser.passwordResetExpires).toBeNull();

      // Verificar que se puede hacer login con la nueva contraseña
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: newPassword
        })
        .expect(200);

      expect(loginResponse.body.status).toBe('success');
    });

    test('should fail with invalid reset token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token-123',
          newPassword: 'NewSecurePassword123!'
        })
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('invalid');
    });

    test('should fail with expired reset token', async () => {
      // Hacer que el token expire
      await testUser.update({
        passwordResetExpires: new Date(Date.now() - 1000) // Expirado
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'NewSecurePassword123!'
        })
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('expired');
    });

    test('should fail with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'weak'
        })
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    test('should fail with missing token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          newPassword: 'NewSecurePassword123!'
        })
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    test('should fail with missing password', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken
        })
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    test('should not allow reuse of reset token', async () => {
      const newPassword = 'NewSecurePassword123!';

      // Primer uso del token
      await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: newPassword
        })
        .expect(200);

      // Intentar usar el mismo token de nuevo
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'AnotherPassword123!'
        })
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('invalid');
    });

    test('should invalidate all existing sessions after password reset', async () => {
      // Hacer login para obtener un access token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'SecurePassword123!'
        })
        .expect(200);

      const accessToken = loginResponse.body.data.accessToken;

      // Resetear contraseña
      await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'NewSecurePassword123!'
        })
        .expect(200);

      // El access token anterior debería estar invalidado (refresh token removido)
      await testUser.reload();
      expect(testUser.refreshToken).toBeNull();
    });
  });
});
