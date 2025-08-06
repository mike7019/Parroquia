// Crear un endpoint de debug para probar el middleware
import express from 'express';
import AuthMiddleware from './src/middlewares/auth.js';

const app = express();
app.use(express.json());

// Endpoint de debug que simula exactamente el endpoint problemático
app.get('/debug/:id',
  AuthMiddleware.authenticateToken,
  (req, res, next) => {
    console.log('🔍 DEBUG: Datos del usuario autenticado:');
    console.log('- ID:', req.user.id);
    console.log('- Email:', req.user.email);
    console.log('- Role:', req.user.role);
    console.log('- Roles:', req.user.roles);
    console.log('- Tipo de role:', typeof req.user.role);
    
    console.log('\n🔍 DEBUG: Parámetros de la request:');
    console.log('- ID del parámetro:', req.params.id);
    console.log('- Tipo del parámetro:', typeof req.params.id);
    
    next();
  },
  AuthMiddleware.requireOwnershipOrAdmin('id'),
  (req, res) => {
    console.log('✅ DEBUG: Middleware completado exitosamente');
    res.json({
      status: 'success',
      message: 'Debug completado',
      user: {
        authenticated_user: req.user.id,
        target_user: req.params.id,
        role: req.user.role,
        is_admin: req.user.role === 'Administrador'
      }
    });
  }
);

// Error handler
app.use((error, req, res, next) => {
  console.error('❌ ERROR en debug:', error.message);
  res.status(500).json({
    status: 'error',
    message: error.message
  });
});

app.listen(3001, () => {
  console.log('🔍 Servidor de debug ejecutándose en puerto 3001');
  console.log('📋 Para probar: GET http://localhost:3001/debug/cd5938f7-2ec9-4f29-87df-5ecdb084e9f1');
  console.log('📋 Usa el token de autorización del otro servidor');
});
