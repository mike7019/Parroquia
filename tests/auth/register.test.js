import request from 'supertest';
import app from '../../src/app.js';
import { 
  cleanDatabase, 
  generateRandomUser, 
  validateSuccessResponse, 
  validateErrorResponse,
  validateUserStructure,
  getVerificationToken
} from '../helpers/testHelpers.js';

describe('Auth - Register Endpoint', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const userData = generateRandomUser();

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      validateSuccessResponse(response.body, true);
      expect(response.body.message).toContain('registered successfully');
      
      // Validar estructura del usuario
      validateUserStructure(response.body.data.user);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.firstName).toBe(userData.firstName);
      expect(response.body.data.user.lastName).toBe(userData.lastName);
      expect(response.body.data.user.role).toBe(userData.role);
      expect(response.body.data.user.emailVerified).toBe(false);
      
      // Validar tokens
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    test('should register an admin user successfully', async () => {
      const adminData = generateRandomUser({ 
        role: 'admin',
        email: 'admin@test.com' 
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(adminData)
        .expect(201);

      validateSuccessResponse(response.body, true);
      expect(response.body.data.user.role).toBe('admin');
    });

    test('should fail with invalid email format', async () => {
      const userData = generateRandomUser({ email: 'invalid-email' });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      validateErrorResponse(response.body);
      expect(response.body.message).toContain('validation');
    });

    test('should fail with weak password', async () => {
      const userData = generateRandomUser({ password: '123' });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      validateErrorResponse(response.body);
      expect(response.body.message).toContain('validation');
    });

    test('should fail with duplicate email', async () => {
      const userData = generateRandomUser();

      // Registrar primer usuario
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Intentar registrar usuario con el mismo email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      validateErrorResponse(response.body, 'USER_ALREADY_EXISTS');
      expect(response.body.message).toContain('already exists');
    });

    test('should fail with missing required fields', async () => {
      const incompleteData = { email: 'test@test.com' };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData)
        .expect(400);

      validateErrorResponse(response.body);
      expect(response.body.message).toContain('validation');
    });

    test('should fail with invalid role', async () => {
      const userData = generateRandomUser({ role: 'invalid_role' });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      validateErrorResponse(response.body);
    });

    test('should fail with short firstName', async () => {
      const userData = generateRandomUser({ firstName: 'A' });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      validateErrorResponse(response.body);
    });

    test('should fail with short lastName', async () => {
      const userData = generateRandomUser({ lastName: 'B' });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      validateErrorResponse(response.body);
    });

    test('should fail with password without uppercase', async () => {
      const userData = generateRandomUser({ password: 'weakpassword123!' });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      validateErrorResponse(response.body);
    });

    test('should fail with password without numbers', async () => {
      const userData = generateRandomUser({ password: 'WeakPassword!' });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      validateErrorResponse(response.body);
    });

    test('should fail with password without special characters', async () => {
      const userData = generateRandomUser({ password: 'WeakPassword123' });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      validateErrorResponse(response.body);
    });

    test('should create user with verification token', async () => {
      const userData = generateRandomUser();

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Verificar que se generó el token de verificación
      const verificationToken = await getVerificationToken(userData.email);
      expect(verificationToken).toBeTruthy();
      expect(verificationToken).toHaveLength(64); // 32 bytes en hex = 64 caracteres
    });
  });
});
