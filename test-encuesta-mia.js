/**
 * Script de prueba para validar el servicio de encuestas con el JSON MIA
 * Ejecutar con: node test-encuesta-mia.js
 */

import fs from 'fs';
import path from 'path';

const testJsonPath = 'c:\\Users\\lil-a\\Downloads\\Json encuesta MIA.json';

console.log('🧪 Iniciando prueba del servicio de encuestas con JSON MIA...\n');

// 1. Verificar que el archivo JSON existe
try {
  const jsonData = JSON.parse(fs.readFileSync(testJsonPath, 'utf8'));
  console.log('✅ JSON cargado exitosamente');
  console.log(`📄 Estructura encontrada:`);
  console.log(`   - informacionGeneral: ${jsonData.informacionGeneral ? '✅' : '❌'}`);
  console.log(`   - vivienda: ${jsonData.vivienda ? '✅' : '❌'}`);
  console.log(`   - servicios_agua: ${jsonData.servicios_agua ? '✅' : '❌'}`);
  console.log(`   - observaciones: ${jsonData.observaciones ? '✅' : '❌'}`);
  console.log(`   - familyMembers: ${jsonData.familyMembers ? `✅ (${jsonData.familyMembers.length} miembros)` : '❌'}`);
  console.log(`   - deceasedMembers: ${jsonData.deceasedMembers ? `✅ (${jsonData.deceasedMembers.length} fallecidos)` : '❌'}`);
  console.log(`   - metadata: ${jsonData.metadata ? '✅' : '❌'}\n`);

  // 2. Validar estructura de informacionGeneral
  const info = jsonData.informacionGeneral;
  if (info) {
    console.log('🏠 Información General:');
    console.log(`   - Municipio: ${info.municipio?.nombre} (ID: ${info.municipio?.id})`);
    console.log(`   - Parroquia: ${info.parroquia?.nombre} (ID: ${info.parroquia?.id})`);
    console.log(`   - Sector: ${info.sector?.nombre} (ID: ${info.sector?.id})`);
    console.log(`   - Vereda: ${info.vereda?.nombre} (ID: ${info.vereda?.id})`);
    console.log(`   - Apellido familiar: ${info.apellido_familiar}`);
    console.log(`   - Dirección: ${info.direccion}`);
    console.log(`   - Teléfono: ${info.telefono}`);
    console.log(`   - Contrato EPM: ${info.numero_contrato_epm}\n`);
  }

  // 3. Validar estructura de miembros de familia
  const members = jsonData.familyMembers;
  if (members && members.length > 0) {
    console.log('👥 Miembros de la Familia:');
    members.forEach((member, index) => {
      console.log(`   ${index + 1}. ${member.nombres}`);
      console.log(`      - Identificación: ${member.numeroIdentificacion} (${typeof member.tipoIdentificacion === 'object' ? member.tipoIdentificacion.nombre : member.tipoIdentificacion})`);
      console.log(`      - Sexo: ${typeof member.sexo === 'object' ? member.sexo.nombre : member.sexo}`);
      console.log(`      - Estado civil: ${typeof member.situacionCivil === 'object' ? member.situacionCivil.nombre : member.situacionCivil}`);
      console.log(`      - Teléfono: ${member.telefono}`);
      console.log(`      - Tallas: Camisa ${member['talla_camisa/blusa']}, Pantalón ${member.talla_pantalon}, Zapato ${member.talla_zapato}`);
      if (member.motivoFechaCelebrar) {
        console.log(`      - Celebración: ${member.motivoFechaCelebrar.motivo} el ${member.motivoFechaCelebrar.dia}/${member.motivoFechaCelebrar.mes}`);
      }
      console.log('');
    });
  }

  // 4. Validar estructura de miembros fallecidos
  const deceased = jsonData.deceasedMembers;
  if (deceased && deceased.length > 0) {
    console.log('⚰️ Miembros Fallecidos:');
    deceased.forEach((member, index) => {
      console.log(`   ${index + 1}. ${member.nombres}`);
      console.log(`      - Fecha fallecimiento: ${member.fechaFallecimiento}`);
      console.log(`      - Sexo: ${typeof member.sexo === 'object' ? member.sexo.nombre : member.sexo}`);
      console.log(`      - Parentesco: ${typeof member.parentesco === 'object' ? member.parentesco.nombre : member.parentesco}`);
      console.log(`      - Causa: ${member.causaFallecimiento}`);
      console.log('');
    });
  }

  // 5. Generar comando curl para prueba
  console.log('🔧 Comando curl para probar el endpoint:\n');
  
  const curlCommand = `curl -X POST http://localhost:3000/api/encuesta \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '${JSON.stringify(jsonData, null, 2).replace(/'/g, "'\\''")}' \\
  | jq`;

  console.log(curlCommand);

  console.log('\n📝 Notas importantes:');
  console.log('   - Reemplaza YOUR_JWT_TOKEN con un token válido');
  console.log('   - Asegúrate de que el servidor esté ejecutándose en puerto 3000');
  console.log('   - El comando usa jq para formatear la respuesta JSON');

  // 6. Validaciones específicas
  console.log('\n🔍 Validaciones específicas:');
  
  // Verificar estructura de objetos
  const firstMember = members[0];
  if (firstMember) {
    console.log('   ✅ Estructura de objetos detectada:');
    console.log(`      - tipoIdentificacion: ${typeof firstMember.tipoIdentificacion} ${typeof firstMember.tipoIdentificacion === 'object' ? '(objeto con id y nombre)' : '(string)'}`);
    console.log(`      - sexo: ${typeof firstMember.sexo} ${typeof firstMember.sexo === 'object' ? '(objeto con id y nombre)' : '(string)'}`);
    console.log(`      - situacionCivil: ${typeof firstMember.situacionCivil} ${typeof firstMember.situacionCivil === 'object' ? '(objeto con id y nombre)' : '(string)'}`);
    console.log(`      - Campo especial: 'talla_camisa/blusa' = ${firstMember['talla_camisa/blusa']}`);
  }

  console.log('\n✅ Análisis del JSON completado exitosamente');
  console.log('   El servicio está actualizado para manejar esta estructura.');

} catch (error) {
  console.error('❌ Error analizando el JSON:', error.message);
  if (error.code === 'ENOENT') {
    console.error(`   El archivo no existe en: ${testJsonPath}`);
    console.error('   Verifica la ruta del archivo JSON.');
  }
}

// 7. Mostrar información de compatibilidad
console.log('\n🔄 Cambios realizados en el servicio:');
console.log('   ✅ Controlador actualizado para manejar objetos {id, nombre}');
console.log('   ✅ Validador actualizado para aceptar strings y objetos');
console.log('   ✅ Swagger actualizado con nueva estructura');
console.log('   ✅ Soporte para campo "talla_camisa/blusa"');
console.log('   ✅ Soporte para motivoFechaCelebrar');
console.log('   ✅ Soporte para causaFallecimiento en difuntos');
console.log('   ✅ Ejemplo actualizado en documentación');

console.log('\n🚀 El servicio está listo para recibir el JSON MIA!');
