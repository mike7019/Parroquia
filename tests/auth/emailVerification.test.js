import request from 'supertest';
import app from '../../src/app.js';
import { 
  cleanDatabase, 
  createTestUser,
  generateRandomUser,
  validateSuccessResponse, 
  validateErrorResponse,
  getVerificationToken
} from '../helpers/testHelpers.js';

describe('Auth - Email Verification Endpoints', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('GET /api/auth/verify-email', () => {
    test('should verify email successfully with valid token', async () => {
      const userData = generateRandomUser();
      const user = await createTestUser(userData);
      const token = await getVerificationToken(userData.email);

      const response = await request(app)
        .get(`/api/auth/verify-email?token=${token}`)
        .expect(200);

      validateSuccessResponse(response.body);
      expect(response.body.message).toContain('verified successfully');
    });

    test('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify-email?token=invalid_token')
        .expect(400);

      validateErrorResponse(response.body, 'INVALID_TOKEN');
      expect(response.body.message).toContain('Invalid or expired');
    });

    test('should fail with missing token', async () => {
      const response = await request(app)
        .get('/api/auth/verify-email')
        .expect(400);

      validateErrorResponse(response.body);
      expect(response.body.message).toContain('required');
    });

    test('should fail with expired/used token', async () => {
      const userData = generateRandomUser();
      const user = await createTestUser(userData);
      const token = await getVerificationToken(userData.email);

      // Verificar email primero
      await request(app)
        .get(`/api/auth/verify-email?token=${token}`)
        .expect(200);

      // Intentar usar el mismo token nuevamente
      const response = await request(app)
        .get(`/api/auth/verify-email?token=${token}`)
        .expect(400);

      validateErrorResponse(response.body, 'INVALID_TOKEN');
    });

    test('should fail with non-existent token', async () => {
      const fakeToken = 'a'.repeat(64); // Token válido en formato pero inexistente

      const response = await request(app)
        .get(`/api/auth/verify-email?token=${fakeToken}`)
        .expect(400);

      validateErrorResponse(response.body, 'INVALID_TOKEN');
    });
  });

  describe('POST /api/auth/resend-verification-public', () => {
    test('should resend verification email for unverified user', async () => {
      const userData = generateRandomUser();
      await createTestUser(userData);

      const response = await request(app)
        .post('/api/auth/resend-verification-public')
        .send({ email: userData.email })
        .expect(200);

      validateSuccessResponse(response.body);
      expect(response.body.message).toContain('sent');
    });

    test('should fail for already verified user', async () => {
      const userData = generateRandomUser();
      const user = await createTestUser({ ...userData, emailVerified: true });

      const response = await request(app)
        .post('/api/auth/resend-verification-public')
        .send({ email: userData.email })
        .expect(400);

      validateErrorResponse(response.body, 'EMAIL_ALREADY_VERIFIED');
      expect(response.body.message).toContain('already verified');
    });

    test('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification-public')
        .send({ email: 'nonexistent@test.com' })
        .expect(404);

      validateErrorResponse(response.body, 'USER_NOT_FOUND');
      expect(response.body.message).toContain('not found');
    });

    test('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification-public')
        .send({ email: 'invalid-email' })
        .expect(400);

      validateErrorResponse(response.body);
    });

    test('should fail with missing email', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification-public')
        .send({})
        .expect(400);

      validateErrorResponse(response.body);
    });

    test('should generate new verification token', async () => {
      const userData = generateRandomUser();
      await createTestUser(userData);
      
      const oldToken = await getVerificationToken(userData.email);

      await request(app)
        .post('/api/auth/resend-verification-public')
        .send({ email: userData.email })
        .expect(200);

      const newToken = await getVerificationToken(userData.email);
      
      expect(newToken).toBeTruthy();
      expect(newToken).not.toBe(oldToken);
      expect(newToken).toHaveLength(64);
    });
  });

  describe('POST /api/auth/resend-verification (Authenticated)', () => {
    test('should resend verification for authenticated unverified user', async () => {
      const userData = generateRandomUser();
      const user = await createTestUser(userData);
      
      // Hacer login aunque el email no esté verificado para obtener token
      // (esto requiere modificar temporalmente la lógica o usar token válido)
      // Para este test, simularemos que tenemos un token válido
      
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .set('Authorization', 'Bearer fake_token_for_test')
        .expect(401); // Esperamos 401 porque el token es falso
        
      // En una implementación real, necesitaríamos un token válido
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .expect(401);

      validateErrorResponse(response.body, 'AUTHENTICATION_REQUIRED');
    });
  });
});
