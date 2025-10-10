// Script para verificar campos faltantes en la consulta de encuestas

const camposEnModelo = [
  // Campos básicos
  'id_personas',
  'primer_nombre',
  'segundo_nombre',
  'primer_apellido',
  'segundo_apellido',
  'id_tipo_identificacion_tipo_identificacion',
  'identificacion',
  'telefono',
  'correo_electronico',
  'fecha_nacimiento',
  'direccion',
  'id_familia_familias',
  'id_estado_civil_estado_civil',
  'estudios',
  'en_que_eres_lider',
  'necesidad_enfermo',
  // CAMPO FALTANTE #1
  'id_profesion',
  'id_sexo',
  'talla_camisa',
  'talla_pantalon',
  'talla_zapato',
  // CAMPOS FALTANTES #2-5
  'id_parentesco',
  'id_comunidad_cultural',
  'motivo_celebrar',
  'dia_celebrar',
  'mes_celebrar'
];

const camposEnConsulta = [
  'p.id_personas',
  'p.primer_nombre',
  'p.segundo_nombre',
  'p.primer_apellido',
  'p.segundo_apellido',
  'p.identificacion',
  'p.telefono',
  'p.correo_electronico',
  'p.fecha_nacimiento',
  'p.direccion',
  'p.estudios',
  'p.en_que_eres_lider',
  'p.talla_camisa',
  'p.talla_pantalon',
  'p.talla_zapato',
  'p.id_sexo',
  'p.id_tipo_identificacion_tipo_identificacion',
  'p.id_estado_civil_estado_civil'
];

console.log('🔍 ANÁLISIS DE CAMPOS FALTANTES EN CONSULTA DE ENCUESTAS\n');
console.log('='.repeat(70));

console.log('\n📋 CAMPOS FALTANTES EN LA CONSULTA:\n');

const camposFaltantes = [
  { campo: 'id_profesion', join: 'profesiones prof ON p.id_profesion = prof.id_profesion', select: 'prof.nombre as profesion_nombre' },
  { campo: 'id_parentesco', join: 'parentescos par ON p.id_parentesco = par.id_parentesco', select: 'par.nombre as parentesco_nombre' },
  { campo: 'id_comunidad_cultural', join: 'comunidades_culturales cc ON p.id_comunidad_cultural = cc.id_comunidad_cultural', select: 'cc.nombre as comunidad_cultural_nombre' },
  { campo: 'motivo_celebrar', join: null, select: 'p.motivo_celebrar' },
  { campo: 'dia_celebrar', join: null, select: 'p.dia_celebrar' },
  { campo: 'mes_celebrar', join: null, select: 'p.mes_celebrar' },
  { campo: 'necesidad_enfermo', join: null, select: 'p.necesidad_enfermo' }
];

camposFaltantes.forEach((item, index) => {
  console.log(`${index + 1}. Campo: ${item.campo}`);
  if (item.join) {
    console.log(`   JOIN requerido: LEFT JOIN ${item.join}`);
  }
  console.log(`   SELECT: ${item.select}\n`);
});

console.log('='.repeat(70));
console.log('\n💡 SOLUCIÓN: Agregar estos campos a la consulta en obtenerEncuestas()');
console.log('   Archivo: src/controllers/encuestaController.js');
console.log('   Línea aproximada: 622-642\n');
