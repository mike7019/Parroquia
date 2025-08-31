import jwt from 'jsonwebtoken';
import 'dotenv/config';

// Crear un token de ejemplo usando la misma lógica del servidor
const testUserId = '123';
const token = jwt.sign(
  { userId: testUserId, type: 'access' },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
);

console.log('=== ANALISIS DEL TOKEN ===');
console.log('JWT_EXPIRES_IN configurado:', process.env.JWT_EXPIRES_IN);

// Decodificar el token para ver su información
const decoded = jwt.decode(token, { complete: true });
console.log('Token decodificado:');
console.log('- Issued at (iat):', new Date(decoded.payload.iat * 1000).toISOString());
console.log('- Expires at (exp):', new Date(decoded.payload.exp * 1000).toISOString());

const now = Math.floor(Date.now() / 1000);
const timeUntilExpiry = decoded.payload.exp - now;
const hoursUntilExpiry = timeUntilExpiry / 3600;

console.log('- Tiempo actual:', new Date().toISOString());
console.log('- Tiempo hasta expiración:', Math.floor(hoursUntilExpiry), 'horas', Math.floor((timeUntilExpiry % 3600) / 60), 'minutos');

process.exit(0);
