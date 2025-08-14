/**
 * Script para diagnosticar problemas de JWT
 */
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

async function diagnoseJWT() {
  console.log('🔍 Diagnóstico de JWT Token...\n');
  
  // 1. Verificar configuración
  console.log('📋 Configuración JWT:');
  console.log(`  JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Configurado' : '❌ No configurado'}`);
  console.log(`  JWT_REFRESH_SECRET: ${process.env.JWT_REFRESH_SECRET ? '✅ Configurado' : '❌ No configurado'}`);
  console.log(`  JWT_EXPIRES_IN: ${process.env.JWT_EXPIRES_IN || 'No configurado'}`);
  console.log(`  JWT_REFRESH_EXPIRES_IN: ${process.env.JWT_REFRESH_EXPIRES_IN || 'No configurado'}\n`);
  
  // 2. Generar token de prueba
  console.log('🔧 Generando token de prueba...');
  const testPayload = {
    id: 'test-id',
    email: 'test@example.com',
    type: 'access',
    iat: Math.floor(Date.now() / 1000)
  };
  
  try {
    const testToken = jwt.sign(testPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '12h'
    });
    
    console.log(`✅ Token generado: ${testToken.substring(0, 50)}...`);
    
    // 3. Verificar el token
    console.log('\n🔍 Verificando token...');
    const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
    console.log('✅ Token verificado correctamente');
    console.log('📋 Contenido del token:');
    console.log(`  ID: ${decoded.id}`);
    console.log(`  Email: ${decoded.email}`);
    console.log(`  Tipo: ${decoded.type}`);
    console.log(`  Emitido: ${new Date(decoded.iat * 1000).toISOString()}`);
    console.log(`  Expira: ${new Date(decoded.exp * 1000).toISOString()}`);
    
  } catch (error) {
    console.error('❌ Error con JWT:', error.message);
  }
  
  // 4. Probar con token inválido
  console.log('\n🧪 Probando token inválido...');
  try {
    const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNjkzNTU1NTU1fQ.invalid_signature';
    jwt.verify(invalidToken, process.env.JWT_SECRET);
    console.log('⚠️ Token inválido fue aceptado (problema de seguridad)');
  } catch (error) {
    console.log('✅ Token inválido rechazado correctamente:', error.message);
  }
  
  // 5. Sugerencias
  console.log('\n💡 Sugerencias para resolver problemas de JWT:');
  console.log('  1. Verificar que JWT_SECRET sea el mismo en todos los entornos');
  console.log('  2. Limpiar tokens almacenados en localStorage/cookies del frontend');
  console.log('  3. Hacer logout y login nuevamente');
  console.log('  4. Verificar que los tokens no hayan expirado');
  console.log('  5. En producción, usar un JWT_SECRET más seguro');
  
  // 6. Generar nuevo JWT_SECRET sugerido
  console.log('\n🔑 JWT_SECRET sugerido para producción:');
  const secureSecret = require('crypto').randomBytes(64).toString('hex');
  console.log(`JWT_SECRET=${secureSecret}`);
}

diagnoseJWT().catch(console.error);
