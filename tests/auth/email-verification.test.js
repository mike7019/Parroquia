import request from 'supertest';
import app from '../../src/app.js';
import User from '../../src/models/User.js';
import crypto from 'crypto';

describe('Auth - Email Verification Tests', () => {
  let testUser;
  let verificationToken;
  
  beforeEach(async () => {
    // Limpiar tabla de usuarios antes de cada test
    await User.destroy({ where: {}, force: true });
    
    // Generar token de verificación
    verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Crear usuario no verificado para las pruebas
    testUser = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'SecurePassword123!',
      emailVerified: false,
      emailVerificationToken: verificationToken
    });
  });

  test('should verify email successfully with valid token', async () => {
    const response = await request(app)
      .get('/api/auth/verify-email')
      .query({ token: verificationToken })
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.message).toContain('verified');

    // Verificar que el usuario se marcó como verificado
    await testUser.reload();
    expect(testUser.emailVerified).toBe(true);
    expect(testUser.emailVerificationToken).toBeNull();
  });

  test('should fail with invalid token', async () => {
    const response = await request(app)
      .get('/api/auth/verify-email')
      .query({ token: 'invalid-token-123' })
      .expect(400);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toContain('Validation');
  });

  test('should fail with missing token', async () => {
    const response = await request(app)
      .get('/api/auth/verify-email')
      .query({})
      .expect(400);

    expect(response.body.status).toBe('error');
  });

  test('should fail with already verified user', async () => {
    // Verificar usuario manualmente
    await testUser.update({
      emailVerified: true,
      emailVerificationToken: null
    });

    const response = await request(app)
      .get('/api/auth/verify-email')
      .query({ token: verificationToken })
      .expect(401);

    expect(response.body.status).toBe('fail');
  });

  test('should resend verification email for unverified user', async () => {
    const response = await request(app)
      .post('/api/auth/resend-verification-public')
      .send({ email: testUser.email })
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.message).toContain('sent');

    // Verificar que se generó un nuevo token
    await testUser.reload();
    expect(testUser.emailVerificationToken).toBeDefined();
    expect(testUser.emailVerificationToken).not.toBe(verificationToken);
  });

  test('should fail to resend for verified user', async () => {
    // Verificar usuario manualmente
    await testUser.update({
      emailVerified: true,
      emailVerificationToken: null
    });

    const response = await request(app)
      .post('/api/auth/resend-verification-public')
      .send({ email: testUser.email })
      .expect(409);

    expect(response.body.status).toBe('fail');
    expect(response.body.message).toContain('already verified');
  });

  test('should fail to resend for non-existent user', async () => {
    const response = await request(app)
      .post('/api/auth/resend-verification-public')
      .send({ email: 'nonexistent@example.com' })
      .expect(404);

    expect(response.body.status).toBe('fail');
  });

  test('should fail resend with missing email', async () => {
    const response = await request(app)
      .post('/api/auth/resend-verification-public')
      .send({})
      .expect(400);

    expect(response.body.status).toBe('error');
  });

  test('should fail resend with invalid email format', async () => {
    const response = await request(app)
      .post('/api/auth/resend-verification-public')
      .send({ email: 'invalid-email' })
      .expect(400);

    expect(response.body.status).toBe('error');
  });
});
