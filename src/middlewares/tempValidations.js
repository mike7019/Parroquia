// Validaciones temporales simplificadas
import { body } from 'express-validator';

const tempValidations = {
  register: [
    body('correo_electronico').isEmail().withMessage('Email inválido'),
    body('contrasena').isLength({ min: 6 }).withMessage('Contraseña muy corta'),
    body('primer_nombre').notEmpty().withMessage('Primer nombre requerido'),
    body('primer_apellido').notEmpty().withMessage('Primer apellido requerido'),
    (req, res, next) => {
      console.log('✅ Validación pasada');
      next();
    }
  ]
};

export default tempValidations;
