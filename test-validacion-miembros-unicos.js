/**
 * Script para probar la validación de miembros únicos
 * Este script prueba que no se puedan agregar miembros que ya pertenezcan a otra familia
 */

console.log('🧪 Iniciando prueba de validación de miembros únicos...');

// Caso 1: Miembros con identificaciones duplicadas en la misma familia
const encuestaConDuplicadosInternos = {
  informacionGeneral: {
    municipio: { id: 1, nombre: "Medellín" },
    parroquia: { id: 1, nombre: "San José" },
    sector: { id: 1, nombre: "Centro" },
    fecha: "2025-08-25",
    apellido_familiar: "Familia Duplicados Internos",
    direccion: "Calle Test 123",
    telefono: "3001111111",
    numero_contrato_epm: "11111111"
  },
  vivienda: {
    tipo_vivienda: { id: 1, nombre: "Casa" },
    disposicion_basuras: {
      recolector: true,
      quemada: false,
      enterrada: false,
      recicla: false,
      aire_libre: false,
      no_aplica: false
    }
  },
  servicios_agua: {
    sistema_acueducto: { id: 1, nombre: "Acueducto Público" }
  },
  observaciones: "Prueba de duplicados internos",
  familyMembers: [
    {
      nombres: "Juan Test Duplicado",
      numeroIdentificacion: "12345678", // DUPLICADO
      tipoIdentificacion: { id: 1, nombre: "Cédula de Ciudadanía" },
      fechaNacimiento: "1985-01-01",
      sexo: { id: 1, nombre: "Masculino" },
      telefono: "3001111111",
      situacionCivil: { id: 1, nombre: "Soltero" },
      estudio: { id: 1, nombre: "Universitario" },
      parentesco: { id: 1, nombre: "Jefe de Hogar" },
      comunidadCultural: { id: 1, nombre: "Ninguna" },
      enfermedad: { id: 1, nombre: "Ninguna" },
      "talla_camisa/blusa": "L",
      talla_pantalon: "32",
      talla_zapato: "42",
      profesion: { id: 1, nombre: "Ingeniero" }
    },
    {
      nombres: "María Test Duplicado",
      numeroIdentificacion: "12345678", // DUPLICADO - Mismo número
      tipoIdentificacion: { id: 1, nombre: "Cédula de Ciudadanía" },
      fechaNacimiento: "1990-01-01",
      sexo: { id: 2, nombre: "Femenino" },
      telefono: "3001111111",
      situacionCivil: { id: 1, nombre: "Soltera" },
      estudio: { id: 2, nombre: "Bachillerato" },
      parentesco: { id: 2, nombre: "Esposa" },
      comunidadCultural: { id: 1, nombre: "Ninguna" },
      enfermedad: { id: 1, nombre: "Ninguna" },
      "talla_camisa/blusa": "M",
      talla_pantalon: "30",
      talla_zapato: "38",
      profesion: { id: 2, nombre: "Ama de Casa" }
    }
  ],
  deceasedMembers: []
};

// Caso 2: Duplicado entre vivos y fallecidos
const encuestaConDuplicadosVivosFallecidos = {
  informacionGeneral: {
    municipio: { id: 1, nombre: "Medellín" },
    apellido_familiar: "Familia Duplicados Mixtos",
    direccion: "Calle Test 456",
    telefono: "3002222222",
    numero_contrato_epm: "22222222"
  },
  vivienda: {
    tipo_vivienda: { id: 1, nombre: "Casa" },
    disposicion_basuras: { recolector: true, quemada: false, enterrada: false, recicla: false, aire_libre: false, no_aplica: false }
  },
  servicios_agua: {
    sistema_acueducto: { id: 1, nombre: "Acueducto Público" }
  },
  observaciones: "Prueba de duplicados entre vivos y fallecidos",
  familyMembers: [
    {
      nombres: "Carlos Test Vivo",
      numeroIdentificacion: "87654321",
      tipoIdentificacion: { id: 1, nombre: "Cédula de Ciudadanía" },
      fechaNacimiento: "1985-01-01",
      sexo: { id: 1, nombre: "Masculino" },
      telefono: "3002222222",
      situacionCivil: { id: 1, nombre: "Soltero" },
      estudio: { id: 1, nombre: "Universitario" },
      parentesco: { id: 1, nombre: "Jefe de Hogar" },
      comunidadCultural: { id: 1, nombre: "Ninguna" },
      enfermedad: { id: 1, nombre: "Ninguna" },
      "talla_camisa/blusa": "L",
      talla_pantalon: "32",
      talla_zapato: "42",
      profesion: { id: 1, nombre: "Ingeniero" }
    }
  ],
  deceasedMembers: [
    {
      nombres: "Pedro Test Fallecido",
      numeroIdentificacion: "87654321", // DUPLICADO - Mismo número que el vivo
      fechaFallecimiento: "2020-01-01",
      sexo: { id: 1, nombre: "Masculino" },
      parentesco: { id: "PADRE", nombre: "Padre" },
      causaFallecimiento: "Enfermedad"
    }
  ]
};

// Caso 3: Familia válida sin duplicados
const encuestaValida = {
  informacionGeneral: {
    municipio: { id: 1, nombre: "Medellín" },
    apellido_familiar: "Familia Válida",
    direccion: "Calle Test 789",
    telefono: "3003333333",
    numero_contrato_epm: "33333333"
  },
  vivienda: {
    tipo_vivienda: { id: 1, nombre: "Casa" },
    disposicion_basuras: { recolector: true, quemada: false, enterrada: false, recicla: false, aire_libre: false, no_aplica: false }
  },
  servicios_agua: {
    sistema_acueducto: { id: 1, nombre: "Acueducto Público" }
  },
  observaciones: "Familia sin duplicados",
  familyMembers: [
    {
      nombres: "Ana Test Válida",
      numeroIdentificacion: "11111111", // ÚNICO
      tipoIdentificacion: { id: 1, nombre: "Cédula de Ciudadanía" },
      fechaNacimiento: "1985-01-01",
      sexo: { id: 2, nombre: "Femenino" },
      telefono: "3003333333",
      situacionCivil: { id: 1, nombre: "Soltera" },
      estudio: { id: 1, nombre: "Universitario" },
      parentesco: { id: 1, nombre: "Jefe de Hogar" },
      comunidadCultural: { id: 1, nombre: "Ninguna" },
      enfermedad: { id: 1, nombre: "Ninguna" },
      "talla_camisa/blusa": "M",
      talla_pantalon: "30",
      talla_zapato: "38",
      profesion: { id: 1, nombre: "Ingeniera" }
    }
  ],
  deceasedMembers: [
    {
      nombres: "José Test Válido Fallecido",
      numeroIdentificacion: "22222222", // ÚNICO
      fechaFallecimiento: "2020-01-01",
      sexo: { id: 1, nombre: "Masculino" },
      parentesco: { id: "PADRE", nombre: "Padre" },
      causaFallecimiento: "Enfermedad"
    }
  ]
};

// Función para validar duplicados internos
function validarDuplicadosInternos(encuesta) {
  console.log('\n🔍 Validando duplicados internos...');
  
  const familyMembers = encuesta.familyMembers || [];
  const deceasedMembers = encuesta.deceasedMembers || [];
  
  // Verificar duplicados en familyMembers
  const identificacionesVivos = familyMembers
    .map(m => m.numeroIdentificacion)
    .filter(id => id && id.trim());
  
  const duplicadosVivos = identificacionesVivos.filter((id, index) => 
    identificacionesVivos.indexOf(id) !== index
  );
  
  if (duplicadosVivos.length > 0) {
    console.log('❌ Duplicados en miembros vivos:', duplicadosVivos);
    return false;
  }
  
  // Verificar duplicados entre vivos y fallecidos
  const identificacionesFallecidos = deceasedMembers
    .map(m => m.numeroIdentificacion)
    .filter(id => id && id.trim());
  
  const todasLasIdentificaciones = [...identificacionesVivos, ...identificacionesFallecidos];
  const duplicadosGeneral = todasLasIdentificaciones.filter((id, index) => 
    todasLasIdentificaciones.indexOf(id) !== index
  );
  
  if (duplicadosGeneral.length > 0) {
    console.log('❌ Duplicados entre vivos y fallecidos:', duplicadosGeneral);
    return false;
  }
  
  console.log('✅ No hay duplicados internos');
  return true;
}

// Función para mostrar resumen de encuesta
function mostrarResumen(nombre, encuesta) {
  console.log(`\n📋 ${nombre}`);
  console.log('='*50);
  console.log(`Apellido: ${encuesta.informacionGeneral.apellido_familiar}`);
  console.log(`Miembros vivos: ${encuesta.familyMembers.length}`);
  console.log(`Miembros fallecidos: ${encuesta.deceasedMembers.length}`);
  
  const identificacionesVivos = encuesta.familyMembers.map(m => m.numeroIdentificacion).filter(Boolean);
  const identificacionesFallecidos = encuesta.deceasedMembers.map(m => m.numeroIdentificacion).filter(Boolean);
  
  console.log(`IDs vivos: [${identificacionesVivos.join(', ')}]`);
  console.log(`IDs fallecidos: [${identificacionesFallecidos.join(', ')}]`);
}

// Ejecutar pruebas
console.log('🎯 Ejecutando casos de prueba...');

// Caso 1: Duplicados internos
mostrarResumen('CASO 1: Duplicados en la misma familia', encuestaConDuplicadosInternos);
const caso1Valido = validarDuplicadosInternos(encuestaConDuplicadosInternos);

// Caso 2: Duplicados entre vivos y fallecidos
mostrarResumen('CASO 2: Duplicados entre vivos y fallecidos', encuestaConDuplicadosVivosFallecidos);
const caso2Valido = validarDuplicadosInternos(encuestaConDuplicadosVivosFallecidos);

// Caso 3: Familia válida
mostrarResumen('CASO 3: Familia válida (sin duplicados)', encuestaValida);
const caso3Valido = validarDuplicadosInternos(encuestaValida);

// Resumen final
console.log('\n🎉 RESUMEN DE PRUEBAS');
console.log('=====================');
console.log(`Caso 1 (duplicados internos): ${caso1Valido ? '✅ VÁLIDO' : '❌ INVÁLIDO'} (esperado: INVÁLIDO)`);
console.log(`Caso 2 (duplicados mixtos): ${caso2Valido ? '✅ VÁLIDO' : '❌ INVÁLIDO'} (esperado: INVÁLIDO)`);
console.log(`Caso 3 (familia válida): ${caso3Valido ? '✅ VÁLIDO' : '❌ INVÁLIDO'} (esperado: VÁLIDO)`);

const pruebasPasaron = !caso1Valido && !caso2Valido && caso3Valido;
console.log(`\n🏆 RESULTADO GENERAL: ${pruebasPasaron ? '✅ TODAS LAS PRUEBAS PASARON' : '❌ ALGUNAS PRUEBAS FALLARON'}`);

console.log('\n📝 PRÓXIMOS PASOS:');
console.log('1. Iniciar servidor: npm run dev');
console.log('2. Probar con endpoint real usando el script PowerShell');
console.log('3. Verificar que el error 409 se devuelva correctamente para duplicados');

export { encuestaConDuplicadosInternos, encuestaConDuplicadosVivosFallecidos, encuestaValida };
