import request from 'supertest';
import app from '../../src/app.js';
import { 
  cleanDatabase, 
  createVerifiedUser,
  generateRandomUser,
  generatePasswordResetToken,
  validateSuccessResponse, 
  validateErrorResponse
} from '../helpers/testHelpers.js';
import User from '../../src/models/User.js';

describe('Auth - Password Recovery', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('POST /api/auth/forgot-password', () => {
    test('should send password reset email for valid user', async () => {
      const userData = generateRandomUser();
      await createVerifiedUser(userData);

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: userData.email })
        .expect(200);

      validateSuccessResponse(response.body);
      expect(response.body.message).toContain('reset email sent');
    });

    test('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@test.com' })
        .expect(404);

      validateErrorResponse(response.body, 'USER_NOT_FOUND');
      expect(response.body.message).toContain('not found');
    });

    test('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);

      validateErrorResponse(response.body);
    });

    test('should fail with missing email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({})
        .expect(400);

      validateErrorResponse(response.body);
    });

    test('should generate password reset token', async () => {
      const userData = generateRandomUser();
      const user = await createVerifiedUser(userData);

      expect(user.passwordResetToken).toBeNull();
      expect(user.passwordResetExpires).toBeNull();

      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: userData.email })
        .expect(200);

      await user.reload();
      expect(user.passwordResetToken).toBeTruthy();
      expect(user.passwordResetExpires).toBeTruthy();
      expect(user.passwordResetToken).toHaveLength(64); // 32 bytes hex
    });

    test('should set token expiration time', async () => {
      const userData = generateRandomUser();
      const user = await createVerifiedUser(userData);

      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: userData.email })
        .expect(200);

      await user.reload();
      const expirationTime = new Date(user.passwordResetExpires);
      const now = new Date();
      const diffInHours = (expirationTime - now) / (1000 * 60 * 60);
      
      expect(diffInHours).toBeGreaterThan(0.9); // Casi 1 hora
      expect(diffInHours).toBeLessThan(1.1); // Menos de 1.1 horas
    });

    test('should work for inactive user (password reset allowed)', async () => {
      const userData = generateRandomUser();
      await createVerifiedUser({ ...userData, isActive: false });

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: userData.email })
        .expect(200);

      validateSuccessResponse(response.body);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    test('should reset password successfully with valid token', async () => {
      const userData = generateRandomUser();
      const user = await createVerifiedUser(userData);
      const resetToken = await generatePasswordResetToken(userData.email);
      
      const newPassword = 'NewPassword123!';

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: newPassword
        })
        .expect(200);

      validateSuccessResponse(response.body);
      expect(response.body.message).toContain('reset successfully');

      // Verificar que puede hacer login con la nueva contraseña
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: newPassword
        })
        .expect(200);

      expect(loginResponse.body.status).toBe('success');
    });

    test('should fail with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid_token',
          newPassword: 'NewPassword123!'
        })
        .expect(400);

      validateErrorResponse(response.body, 'INVALID_TOKEN');
      expect(response.body.message).toContain('Invalid or expired');
    });

    test('should fail with expired token', async () => {
      const userData = generateRandomUser();
      const user = await createVerifiedUser(userData);
      
      // Crear token expirado
      const expiredToken = 'expired_token_123';
      await user.update({
        passwordResetToken: expiredToken,
        passwordResetExpires: new Date(Date.now() - 3600000) // Expirado hace 1 hora
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: expiredToken,
          newPassword: 'NewPassword123!'
        })
        .expect(400);

      validateErrorResponse(response.body, 'INVALID_TOKEN');
    });

    test('should fail with weak password', async () => {
      const userData = generateRandomUser();
      const user = await createVerifiedUser(userData);
      const resetToken = await generatePasswordResetToken(userData.email);

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'weak'
        })
        .expect(400);

      validateErrorResponse(response.body);
      expect(response.body.message).toContain('validation');
    });

    test('should fail with missing token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          newPassword: 'NewPassword123!'
        })
        .expect(400);

      validateErrorResponse(response.body);
    });

    test('should fail with missing password', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'some_token'
        })
        .expect(400);

      validateErrorResponse(response.body);
    });

    test('should clear reset token after successful reset', async () => {
      const userData = generateRandomUser();
      const user = await createVerifiedUser(userData);
      const resetToken = await generatePasswordResetToken(userData.email);

      await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'NewPassword123!'
        })
        .expect(200);

      await user.reload();
      expect(user.passwordResetToken).toBeNull();
      expect(user.passwordResetExpires).toBeNull();
    });

    test('should not allow reuse of reset token', async () => {
      const userData = generateRandomUser();
      const user = await createVerifiedUser(userData);
      const resetToken = await generatePasswordResetToken(userData.email);

      // Primer uso del token
      await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'NewPassword123!'
        })
        .expect(200);

      // Segundo uso del mismo token
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'AnotherPassword123!'
        })
        .expect(400);

      validateErrorResponse(response.body, 'INVALID_TOKEN');
    });

    test('should validate password strength requirements', async () => {
      const userData = generateRandomUser();
      const user = await createVerifiedUser(userData);
      const resetToken = await generatePasswordResetToken(userData.email);

      // Sin mayúscula
      let response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'newpassword123!'
        })
        .expect(400);
      validateErrorResponse(response.body);

      // Sin número
      response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'NewPassword!'
        })
        .expect(400);
      validateErrorResponse(response.body);

      // Sin carácter especial
      response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'NewPassword123'
        })
        .expect(400);
      validateErrorResponse(response.body);

      // Muy corta
      response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'New1!'
        })
        .expect(400);
      validateErrorResponse(response.body);
    });
  });
});
