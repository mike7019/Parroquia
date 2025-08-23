// Ejemplo de creación de sectores con municipio obligatorio

console.log('📋 FORMATO PARA CREAR SECTORES');
console.log('=====================================\n');

const ejemploCreacionSector = {
  "nombre": "Sector Centro",
  "id_municipio": 1
};

const ejemploCreacionSectorCompleto = {
  "nombre": "Sector Norte",
  "id_municipio": 2
};

console.log('✅ FORMATO CORRECTO para POST /api/catalog/sectors:');
console.log(JSON.stringify(ejemploCreacionSector, null, 2));

console.log('\n📝 CAMPOS OBLIGATORIOS:');
console.log('• nombre: Nombre del sector (string, requerido)');
console.log('• id_municipio: ID del municipio (number, requerido)');

console.log('\n🔍 ENDPOINTS DISPONIBLES:');
console.log('• GET /api/catalog/sectors/municipios - Obtener lista de municipios disponibles');
console.log('• POST /api/catalog/sectors - Crear nuevo sector');
console.log('• GET /api/catalog/sectors - Obtener todos los sectores');
console.log('• GET /api/catalog/sectors/:id - Obtener sector por ID');
console.log('• PUT /api/catalog/sectors/:id - Actualizar sector');
console.log('• DELETE /api/catalog/sectors/:id - Eliminar sector');

console.log('\n📄 EJEMPLO DE RESPUESTA EXITOSA:');
const ejemploRespuesta = {
  "success": true,
  "message": "Sector creado exitosamente",
  "data": {
    "id_sector": 1,
    "nombre": "Sector Centro",
    "id_municipio": 1,
    "municipio": {
      "id_municipio": 1,
      "nombre_municipio": "Medellín"
    }
  },
  "timestamp": "2025-08-21T04:00:00.000Z"
};

console.log(JSON.stringify(ejemploRespuesta, null, 2));

console.log('\n❌ ERRORES POSIBLES:');
console.log('• 400: "El nombre del sector es obligatorio"');
console.log('• 400: "El municipio es obligatorio"');
console.log('• 400: "El ID del municipio debe ser un número válido"');
console.log('• 404: "El municipio especificado no existe"');
console.log('• 409: "Ya existe un sector con ese nombre"');
