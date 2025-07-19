import request from 'supertest';
import app from '../../src/app.js';
import { 
  cleanDatabase, 
  createVerifiedUser,
  createUnverifiedUser,
  loginUser,
  getAuthHeaders,
  generateRandomUser,
  generateRandomEmail,
  validateSuccessResponse, 
  validateErrorResponse
} from '../helpers/testHelpers.js';
import models from '../../src/models/index.js';

describe('Auth - Security & Edge Cases', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('Rate Limiting & Security', () => {
    test('should handle multiple rapid registration attempts', async () => {
      const userData = generateRandomUser();
      
      const promises = Array.from({ length: 5 }, () =>
        request(app)
          .post('/api/auth/register')
          .send(userData)
      );

      const responses = await Promise.allSettled(promises);
      
      // Al menos una debería ser exitosa, las demás fallarán por email duplicado
      const successResponses = responses.filter(r => r.status === 'fulfilled' && r.value.status === 201);
      expect(successResponses.length).toBe(1);
    });

    test('should handle SQL injection attempts in login', async () => {
      const maliciousPayloads = [
        { email: "' OR '1'='1", password: 'password' },
        { email: "admin@test.com'; DROP TABLE users; --", password: 'password' },
        { email: "admin@test.com\" OR 1=1 --", password: 'password' }
      ];

      for (const payload of maliciousPayloads) {
        const response = await request(app)
          .post('/api/auth/login')
          .send(payload);

        // No debería causar errores del servidor
        expect(response.status).not.toBe(500);
        // Debería fallar la autenticación
        expect([400, 401]).toContain(response.status);
      }
    });

    test('should handle XSS attempts in registration', async () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        '"><script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src=x onerror=alert("xss")>'
      ];

      for (const payload of xssPayloads) {
        const userData = {
          ...generateRandomUser(),
          firstName: payload,
          lastName: payload
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData);

        if (response.status === 201) {
          // Si se registra, verificar que los datos estén sanitizados
          expect(response.body.data.user.firstName).not.toContain('<script>');
        } else {
          // O debería ser rechazado por validación
          expect([400, 422]).toContain(response.status);
        }
      }
    });

    test('should handle very long input strings', async () => {
      const longString = 'a'.repeat(1000);
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: longString,
          lastName: longString,
          email: 'test@example.com',
          password: 'Password123!'
        });

      // Debería fallar por validación de longitud
      expect([400, 422]).toContain(response.status);
    });

    test('should prevent timing attacks on email existence', async () => {
      const existingUser = generateRandomUser();
      await createVerifiedUser(existingUser);
      
      const nonExistentEmail = generateRandomEmail();
      
      // Medir tiempo para email existente
      const startExisting = Date.now();
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: existingUser.email });
      const timeExisting = Date.now() - startExisting;
      
      // Medir tiempo para email no existente  
      const startNonExistent = Date.now();
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: nonExistentEmail });
      const timeNonExistent = Date.now() - startNonExistent;
      
      // La diferencia no debería ser significativa (menos de 100ms)
      const timeDifference = Math.abs(timeExisting - timeNonExistent);
      expect(timeDifference).toBeLessThan(100);
    });
  });

  describe('Token Manipulation', () => {
    test('should reject malformed JWT tokens', async () => {
      const malformedTokens = [
        'invalid.token.format',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.malformed.signature',
        'header.payload',  // Missing signature
        '.payload.signature',  // Missing header
        'header..signature',  // Missing payload
      ];

      for (const token of malformedTokens) {
        const response = await request(app)
          .get('/api/auth/profile')
          .set(getAuthHeaders(token));

        expect(response.status).toBe(401);
        validateErrorResponse(response.body, 'INVALID_TOKEN');
      }
    });

    test('should reject tokens with wrong signature', async () => {
      const userData = generateRandomUser();
      await createVerifiedUser(userData);
      const loginData = await loginUser(userData.email, userData.password);
      
      // Modificar la signature del token
      const tokenParts = loginData.accessToken.split('.');
      const tamperedToken = `${tokenParts[0]}.${tokenParts[1]}.tamperedsignature`;
      
      const response = await request(app)
        .get('/api/auth/profile')
        .set(getAuthHeaders(tamperedToken))
        .expect(401);

      validateErrorResponse(response.body, 'INVALID_TOKEN');
    });

    test('should reject tokens for deleted user', async () => {
      const userData = generateRandomUser();
      const user = await createVerifiedUser(userData);
      const loginData = await loginUser(userData.email, userData.password);
      
      // Eliminar usuario
      await user.destroy();
      
      const response = await request(app)
        .get('/api/auth/profile')
        .set(getAuthHeaders(loginData.accessToken))
        .expect(401);

      validateErrorResponse(response.body, 'INVALID_TOKEN');
    });

    test('should reject refresh token after logout', async () => {
      const userData = generateRandomUser();
      await createVerifiedUser(userData);
      const loginData = await loginUser(userData.email, userData.password);
      
      // Hacer logout
      await request(app)
        .post('/api/auth/logout')
        .set(getAuthHeaders(loginData.accessToken))
        .expect(200);
      
      // Intentar usar refresh token
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: loginData.refreshToken })
        .expect(401);

      validateErrorResponse(response.body, 'INVALID_REFRESH_TOKEN');
    });
  });

  describe('Account States', () => {
    test('should prevent login for unverified user even with correct credentials', async () => {
      const userData = generateRandomUser();
      await createUnverifiedUser(userData);
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(401);

      validateErrorResponse(response.body, 'EMAIL_NOT_VERIFIED');
    });

    test('should handle concurrent login attempts', async () => {
      const userData = generateRandomUser();
      await createVerifiedUser(userData);
      
      const loginPromises = Array.from({ length: 5 }, () =>
        request(app)
          .post('/api/auth/login')
          .send({
            email: userData.email,
            password: userData.password
          })
      );

      const responses = await Promise.all(loginPromises);
      
      // Todas deberían ser exitosas
      responses.forEach(response => {
        expect(response.status).toBe(200);
        validateSuccessResponse(response.body, true);
      });
    });

    test('should handle password change after token issued', async () => {
      const userData = generateRandomUser();
      await createVerifiedUser(userData);
      const loginData = await loginUser(userData.email, userData.password);
      
      // Cambiar contraseña
      await request(app)
        .post('/api/auth/change-password')
        .set(getAuthHeaders(loginData.accessToken))
        .send({
          currentPassword: userData.password,
          newPassword: 'NewPassword123!'
        })
        .expect(200);
      
      // El token actual debería seguir siendo válido hasta que expire
      const response = await request(app)
        .get('/api/auth/profile')
        .set(getAuthHeaders(loginData.accessToken))
        .expect(200);

      validateSuccessResponse(response.body, true);
    });
  });

  describe('Input Validation Edge Cases', () => {
    test('should handle unicode characters in names', async () => {
      const userData = {
        firstName: 'José María',
        lastName: 'González-Rodríguez',
        email: 'jose@example.com',
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      validateSuccessResponse(response.body, true);
      expect(response.body.data.user.firstName).toBe(userData.firstName);
      expect(response.body.data.user.lastName).toBe(userData.lastName);
    });

    test('should handle email with special characters', async () => {
      const specialEmails = [
        'user+tag@example.com',
        'user.name@example.com', 
        'user_name@example.com',
        'user123@example-domain.com'
      ];

      for (const email of specialEmails) {
        const userData = {
          ...generateRandomUser(),
          email: email
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData);

        expect([201, 400]).toContain(response.status);
        if (response.status === 201) {
          expect(response.body.data.user.email).toBe(email.toLowerCase());
        }
      }
    });

    test('should normalize email case', async () => {
      const userData = generateRandomUser();
      userData.email = userData.email.toUpperCase();

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      validateSuccessResponse(response.body, true);
      expect(response.body.data.user.email).toBe(userData.email.toLowerCase());
    });

    test('should trim whitespace from inputs', async () => {
      const userData = {
        firstName: '  John  ',
        lastName: '  Doe  ',
        email: '  john.doe@example.com  ',
        password: 'Password123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      validateSuccessResponse(response.body, true);
      expect(response.body.data.user.firstName).toBe('John');
      expect(response.body.data.user.lastName).toBe('Doe');
      expect(response.body.data.user.email).toBe('john.doe@example.com');
    });
  });

  describe('Database Constraints', () => {
    test('should handle database connection issues gracefully', async () => {
      // Este test requeriría mockear la conexión a la base de datos
      // Por ahora verificamos que no se produzcan errores 500 inesperados
      
      const userData = generateRandomUser();
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      // No debería ser un error del servidor
      expect(response.status).not.toBe(500);
    });

    test('should handle unique constraint violations properly', async () => {
      const userData = generateRandomUser();
      
      // Primer registro exitoso
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Segundo registro con mismo email debería fallar
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      validateErrorResponse(response.body, 'EMAIL_EXISTS');
    });
  });
});
