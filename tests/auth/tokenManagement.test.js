import request from 'supertest';
import app from '../../src/app.js';
import jwt from 'jsonwebtoken';
import { 
  cleanDatabase, 
  createVerifiedUser,
  loginUser,
  generateRandomUser,
  validateSuccessResponse, 
  validateErrorResponse,
  validateTokenResponse
} from '../helpers/testHelpers.js';

describe('Auth - Token Management', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('POST /api/auth/refresh-token', () => {
    test('should refresh token successfully with valid refresh token', async () => {
      const userData = generateRandomUser();
      await createVerifiedUser(userData);
      
      // Login para obtener tokens
      const loginResponse = await loginUser(userData.email, userData.password);

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: loginResponse.refreshToken })
        .expect(200);

      validateTokenResponse(response.body);
      expect(response.body.message).toContain('refreshed');
      
      // El nuevo access token debe ser diferente al anterior
      expect(response.body.data.accessToken).not.toBe(loginResponse.accessToken);
      
      // Debe incluir información del usuario
      expect(response.body.data.user.email).toBe(userData.email);
    });

    test('should fail with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'invalid_token' })
        .expect(401);

      validateErrorResponse(response.body, 'INVALID_TOKEN');
      expect(response.body.message).toContain('Invalid refresh token');
    });

    test('should fail with expired refresh token', async () => {
      // Crear un token expirado
      const expiredToken = jwt.sign(
        { userId: 999, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: expiredToken })
        .expect(401);

      validateErrorResponse(response.body, 'INVALID_TOKEN');
    });

    test('should fail with access token instead of refresh token', async () => {
      const userData = generateRandomUser();
      await createVerifiedUser(userData);
      
      const loginResponse = await loginUser(userData.email, userData.password);

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: loginResponse.accessToken }) // Usar access token
        .expect(401);

      validateErrorResponse(response.body, 'INVALID_TOKEN');
    });

    test('should fail with missing refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({})
        .expect(400);

      validateErrorResponse(response.body);
      expect(response.body.message).toContain('validation');
    });

    test('should fail with refresh token of non-existent user', async () => {
      // Crear token para usuario inexistente
      const fakeToken = jwt.sign(
        { userId: 99999, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: fakeToken })
        .expect(401);

      validateErrorResponse(response.body, 'INVALID_TOKEN');
    });

    test('should fail with refresh token from inactive user', async () => {
      const userData = generateRandomUser();
      const user = await createVerifiedUser(userData);
      
      const loginResponse = await loginUser(userData.email, userData.password);
      
      // Desactivar usuario
      await user.update({ isActive: false });

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: loginResponse.refreshToken })
        .expect(401);

      validateErrorResponse(response.body, 'ACCOUNT_DEACTIVATED');
    });

    test('should update refresh token in database', async () => {
      const userData = generateRandomUser();
      const user = await createVerifiedUser(userData);
      
      const loginResponse = await loginUser(userData.email, userData.password);
      const oldRefreshToken = loginResponse.refreshToken;

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: oldRefreshToken })
        .expect(200);

      const newRefreshToken = response.body.data.refreshToken;
      expect(newRefreshToken).not.toBe(oldRefreshToken);
      
      // Verificar que el usuario fue actualizado en la BD
      await user.reload();
      expect(user.refreshToken).toBe(newRefreshToken);
    });

    test('should generate tokens with correct payload', async () => {
      const userData = generateRandomUser();
      const user = await createVerifiedUser(userData);
      
      const loginResponse = await loginUser(userData.email, userData.password);

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: loginResponse.refreshToken })
        .expect(200);

      // Verificar payload del access token
      const accessTokenPayload = jwt.verify(
        response.body.data.accessToken,
        process.env.JWT_SECRET
      );
      
      expect(accessTokenPayload.userId).toBe(user.id);
      expect(accessTokenPayload.type).toBe('access');
      expect(accessTokenPayload.iat).toBeTruthy();
      expect(accessTokenPayload.exp).toBeTruthy();

      // Verificar payload del refresh token
      const refreshTokenPayload = jwt.verify(
        response.body.data.refreshToken,
        process.env.JWT_REFRESH_SECRET
      );
      
      expect(refreshTokenPayload.userId).toBe(user.id);
      expect(refreshTokenPayload.type).toBe('refresh');
    });
  });
});
