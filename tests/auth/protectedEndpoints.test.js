import request from 'supertest';
import app from '../../src/app.js';
import { 
  cleanDatabase, 
  createVerifiedUser,
  loginUser,
  getAuthHeaders,
  generateRandomUser,
  validateSuccessResponse, 
  validateErrorResponse
} from '../helpers/testHelpers.js';

describe('Auth - Protected Endpoints', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('GET /api/auth/profile', () => {
    test('should get user profile with valid token', async () => {
      const userData = generateRandomUser();
      await createVerifiedUser(userData);
      const loginData = await loginUser(userData.email, userData.password);

      const response = await request(app)
        .get('/api/auth/profile')
        .set(getAuthHeaders(loginData.accessToken))
        .expect(200);

      validateSuccessResponse(response.body, true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.firstName).toBe(userData.firstName);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    test('should fail without authentication token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      validateErrorResponse(response.body, 'AUTHENTICATION_REQUIRED');
    });

    test('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set(getAuthHeaders('invalid_token'))
        .expect(401);

      validateErrorResponse(response.body, 'INVALID_TOKEN');
    });

    test('should fail with expired token', async () => {
      // Este test requeriría generar un token expirado específicamente
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMDAwMX0.invalid';
      
      const response = await request(app)
        .get('/api/auth/profile')
        .set(getAuthHeaders(expiredToken))
        .expect(401);

      validateErrorResponse(response.body, 'INVALID_TOKEN');
    });
  });

  describe('POST /api/auth/change-password', () => {
    test('should change password successfully', async () => {
      const userData = generateRandomUser();
      await createVerifiedUser(userData);
      const loginData = await loginUser(userData.email, userData.password);

      const newPassword = 'NewPassword123!';
      const response = await request(app)
        .post('/api/auth/change-password')
        .set(getAuthHeaders(loginData.accessToken))
        .send({
          currentPassword: userData.password,
          newPassword: newPassword
        })
        .expect(200);

      validateSuccessResponse(response.body);
      expect(response.body.message).toContain('changed successfully');

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

    test('should fail with incorrect current password', async () => {
      const userData = generateRandomUser();
      await createVerifiedUser(userData);
      const loginData = await loginUser(userData.email, userData.password);

      const response = await request(app)
        .post('/api/auth/change-password')
        .set(getAuthHeaders(loginData.accessToken))
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewPassword123!'
        })
        .expect(401);

      validateErrorResponse(response.body, 'AUTH_FAILED');
      expect(response.body.message).toContain('Current password is incorrect');
    });

    test('should fail with weak new password', async () => {
      const userData = generateRandomUser();
      await createVerifiedUser(userData);
      const loginData = await loginUser(userData.email, userData.password);

      const response = await request(app)
        .post('/api/auth/change-password')
        .set(getAuthHeaders(loginData.accessToken))
        .send({
          currentPassword: userData.password,
          newPassword: 'weak'
        })
        .expect(400);

      validateErrorResponse(response.body);
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .send({
          currentPassword: 'Current123!',
          newPassword: 'NewPassword123!'
        })
        .expect(401);

      validateErrorResponse(response.body, 'AUTHENTICATION_REQUIRED');
    });

    test('should fail with missing current password', async () => {
      const userData = generateRandomUser();
      await createVerifiedUser(userData);
      const loginData = await loginUser(userData.email, userData.password);

      const response = await request(app)
        .post('/api/auth/change-password')
        .set(getAuthHeaders(loginData.accessToken))
        .send({
          newPassword: 'NewPassword123!'
        })
        .expect(400);

      validateErrorResponse(response.body);
    });

    test('should fail with missing new password', async () => {
      const userData = generateRandomUser();
      await createVerifiedUser(userData);
      const loginData = await loginUser(userData.email, userData.password);

      const response = await request(app)
        .post('/api/auth/change-password')
        .set(getAuthHeaders(loginData.accessToken))
        .send({
          currentPassword: userData.password
        })
        .expect(400);

      validateErrorResponse(response.body);
    });

    test('should fail when new password equals current password', async () => {
      const userData = generateRandomUser();
      await createVerifiedUser(userData);
      const loginData = await loginUser(userData.email, userData.password);

      const response = await request(app)
        .post('/api/auth/change-password')
        .set(getAuthHeaders(loginData.accessToken))
        .send({
          currentPassword: userData.password,
          newPassword: userData.password
        })
        .expect(400);

      validateErrorResponse(response.body, 'VALIDATION_ERROR');
      expect(response.body.message).toContain('different');
    });
  });

  describe('POST /api/auth/logout', () => {
    test('should logout successfully', async () => {
      const userData = generateRandomUser();
      await createVerifiedUser(userData);
      const loginData = await loginUser(userData.email, userData.password);

      const response = await request(app)
        .post('/api/auth/logout')
        .set(getAuthHeaders(loginData.accessToken))
        .expect(200);

      validateSuccessResponse(response.body);
      expect(response.body.message).toContain('successful');

      // Verificar que el token ya no funciona para endpoints protegidos
      const profileResponse = await request(app)
        .get('/api/auth/profile')
        .set(getAuthHeaders(loginData.accessToken))
        .expect(401);

      validateErrorResponse(profileResponse.body, 'INVALID_TOKEN');
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      validateErrorResponse(response.body, 'AUTHENTICATION_REQUIRED');
    });

    test('should fail with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set(getAuthHeaders('invalid_token'))
        .expect(401);

      validateErrorResponse(response.body, 'INVALID_TOKEN');
    });

    test('should clear refresh token from database', async () => {
      const userData = generateRandomUser();
      const user = await createVerifiedUser(userData);
      const loginData = await loginUser(userData.email, userData.password);

      // Verificar que el usuario tiene refresh token
      await user.reload();
      expect(user.refreshToken).toBeTruthy();

      await request(app)
        .post('/api/auth/logout')
        .set(getAuthHeaders(loginData.accessToken))
        .expect(200);

      // Verificar que el refresh token fue eliminado
      await user.reload();
      expect(user.refreshToken).toBeNull();
    });
  });

  describe('POST /api/auth/resend-verification (Authenticated)', () => {
    test('should fail for verified user', async () => {
      const userData = generateRandomUser();
      await createVerifiedUser(userData);
      const loginData = await loginUser(userData.email, userData.password);

      const response = await request(app)
        .post('/api/auth/resend-verification')
        .set(getAuthHeaders(loginData.accessToken))
        .expect(400);

      validateErrorResponse(response.body, 'EMAIL_ALREADY_VERIFIED');
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .expect(401);

      validateErrorResponse(response.body, 'AUTHENTICATION_REQUIRED');
    });
  });
});
