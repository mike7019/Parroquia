import request from 'supertest';
import app from '../../src/app.js';
import { 
  cleanDatabase, 
  createTestUser,
  createVerifiedUser,
  generateRandomUser,
  validateSuccessResponse, 
  validateErrorResponse,
  validateTokenResponse
} from '../helpers/testHelpers.js';

describe('Auth - Login Endpoint', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('POST /api/auth/login', () => {
    test('should login successfully with verified user', async () => {
      const userData = generateRandomUser();
      const user = await createVerifiedUser(userData);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      validateTokenResponse(response.body);
      expect(response.body.message).toContain('successful');
      expect(response.body.data.user.id).toBe(user.id);
      expect(response.body.data.user.email).toBe(user.email);
      
      // Verificar que lastLoginAt se actualizó
      expect(response.body.data.user.lastLoginAt).toBeTruthy();
    });

    test('should fail with unverified email', async () => {
      const userData = generateRandomUser();
      await createTestUser(userData); // Usuario sin verificar

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(401);

      validateErrorResponse(response.body, 'EMAIL_NOT_VERIFIED');
      expect(response.body.message).toContain('verification required');
    });

    test('should fail with invalid email', async () => {
      const userData = generateRandomUser();
      await createVerifiedUser(userData);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: userData.password
        })
        .expect(401);

      validateErrorResponse(response.body, 'AUTH_FAILED');
      expect(response.body.message).toContain('Invalid email or password');
    });

    test('should fail with invalid password', async () => {
      const userData = generateRandomUser();
      await createVerifiedUser(userData);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: 'WrongPassword123!'
        })
        .expect(401);

      validateErrorResponse(response.body, 'AUTH_FAILED');
      expect(response.body.message).toContain('Invalid email or password');
    });

    test('should fail with inactive user', async () => {
      const userData = generateRandomUser();
      await createVerifiedUser({ ...userData, isActive: false });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(401);

      validateErrorResponse(response.body, 'ACCOUNT_DEACTIVATED');
      expect(response.body.message).toContain('deactivated');
    });

    test('should fail with missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'TestPassword123!'
        })
        .expect(400);

      validateErrorResponse(response.body);
      expect(response.body.message).toContain('validation');
    });

    test('should fail with missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com'
        })
        .expect(400);

      validateErrorResponse(response.body);
      expect(response.body.message).toContain('validation');
    });

    test('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'TestPassword123!'
        })
        .expect(400);

      validateErrorResponse(response.body);
    });

    test('should fail with empty request body', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      validateErrorResponse(response.body);
    });

    test('should update lastLoginAt on successful login', async () => {
      const userData = generateRandomUser();
      const user = await createVerifiedUser(userData);
      
      expect(user.lastLoginAt).toBeNull();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(response.body.data.user.lastLoginAt).toBeTruthy();
      
      // Verificar que la fecha es reciente (dentro de los últimos 10 segundos)
      const lastLogin = new Date(response.body.data.user.lastLoginAt);
      const now = new Date();
      const diffInSeconds = (now - lastLogin) / 1000;
      expect(diffInSeconds).toBeLessThan(10);
    });

    test('should login admin user successfully', async () => {
      const adminData = generateRandomUser({ role: 'admin' });
      await createVerifiedUser(adminData);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: adminData.email,
          password: adminData.password
        })
        .expect(200);

      validateTokenResponse(response.body);
      expect(response.body.data.user.role).toBe('admin');
    });

    test('should login moderator user successfully', async () => {
      const moderatorData = generateRandomUser({ role: 'moderator' });
      await createVerifiedUser(moderatorData);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: moderatorData.email,
          password: moderatorData.password
        })
        .expect(200);

      validateTokenResponse(response.body);
      expect(response.body.data.user.role).toBe('moderator');
    });
  });
});
