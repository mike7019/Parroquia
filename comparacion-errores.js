/**
 * Comparación de mensajes de error: ANTES vs DESPUÉS
 */

console.log('📊 COMPARACIÓN DE MENSAJES DE ERROR: ANTES vs DESPUÉS');

console.log('\n❌ ANTES (genérico e inútil):');
console.log('   {');
console.log('     "status": "error",');
console.log('     "message": "Errores de validación"');
console.log('   }');

console.log('\n✅ DESPUÉS (específico y útil):');

const ejemplosErrores = [
  {
    caso: 'Nombre vacío',
    error: {
      status: 'error',
      message: 'Se encontraron 1 error(es) de validación: El nombre de la situación civil es obligatorio',
      errors: [
        {
          field: 'nombre',
          message: 'El nombre de la situación civil es obligatorio'
        }
      ]
    }
  },
  {
    caso: 'Nombre muy corto',
    error: {
      status: 'error',
      message: 'Se encontraron 1 error(es) de validación: El nombre debe tener al menos 2 caracteres',
      errors: [
        {
          field: 'nombre',
          message: 'El nombre debe tener al menos 2 caracteres'
        }
      ]
    }
  },
  {
    caso: 'Nombre duplicado',
    error: {
      status: 'error',
      message: 'Se encontraron 1 error(es) de validación: Ya existe una situación civil con el nombre "Soltero"',
      errors: [
        {
          field: 'nombre',
          message: 'Ya existe una situación civil con el nombre "Soltero"'
        }
      ]
    }
  },
  {
    caso: 'Código duplicado',
    error: {
      status: 'error',
      message: 'Se encontraron 1 error(es) de validación: Ya existe una situación civil con el código "SOL"',
      errors: [
        {
          field: 'codigo',
          message: 'Ya existe una situación civil con el código "SOL"'
        }
      ]
    }
  },
  {
    caso: 'Descripción muy larga',
    error: {
      status: 'error',
      message: 'Se encontraron 1 error(es) de validación: La descripción no puede tener más de 500 caracteres',
      errors: [
        {
          field: 'descripcion',
          message: 'La descripción no puede tener más de 500 caracteres'
        }
      ]
    }
  },
  {
    caso: 'Orden negativo',
    error: {
      status: 'error',
      message: 'Se encontraron 1 error(es) de validación: El orden debe ser un número positivo (mayor o igual a 0)',
      errors: [
        {
          field: 'orden',
          message: 'El orden debe ser un número positivo (mayor o igual a 0)'
        }
      ]
    }
  }
];

ejemplosErrores.forEach((ejemplo, index) => {
  console.log(`\n   ${index + 1}. ${ejemplo.caso}:`);
  console.log('      {');
  console.log(`        "status": "${ejemplo.error.status}",`);
  console.log(`        "message": "${ejemplo.error.message}",`);
  console.log('        "errors": [');
  ejemplo.error.errors.forEach((err, i) => {
    console.log('          {');
    console.log(`            "field": "${err.field}",`);
    console.log(`            "message": "${err.message}"`);
    console.log(`          }${i < ejemplo.error.errors.length - 1 ? ',' : ''}`);
  });
  console.log('        ]');
  console.log('      }');
});

console.log('\n🎯 BENEFICIOS DE LOS NUEVOS MENSAJES:');
console.log('   ✅ Específicos: Dicen exactamente qué está mal');
console.log('   ✅ Accionables: El usuario sabe cómo corregir el error');
console.log('   ✅ Detallados: Incluyen el campo y valor problemático');
console.log('   ✅ Estructurados: Fáciles de procesar en el frontend');
console.log('   ✅ Múltiples: Pueden mostrar varios errores a la vez');
console.log('   ✅ Contextuales: Incluyen el valor que causó el problema');

console.log('\n🚀 AHORA TUS USUARIOS PUEDEN:');
console.log('   • Entender inmediatamente qué corregir');
console.log('   • Ver todos los errores de una vez');
console.log('   • Recibir sugerencias específicas');
console.log('   • Identificar el campo problemático');
console.log('   • Conocer los límites y restricciones');

process.exit(0);