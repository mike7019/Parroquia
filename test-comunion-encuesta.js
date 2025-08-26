/**
 * Script para probar el campo comunionEnCasa en el endpoint de encuestas
 */

console.log('🧪 Iniciando prueba del campo comunionEnCasa...');

// JSON de prueba con el nuevo campo
const encuestaTestComunion = {
  informacionGeneral: {
    municipio: { id: 1, nombre: "Medellín" },
    parroquia: { id: 1, nombre: "San José" },
    sector: { id: 1, nombre: "Centro" },
    vereda: { id: 1, nombre: "La Macarena" },
    fecha: "2025-08-25",
    apellido_familiar: "García Comunión",
    direccion: "Carrera 50 # 30-80",
    telefono: "3009876543",
    numero_contrato_epm: "87654321",
    comunionEnCasa: true  // 🔧 NUEVO CAMPO
  },
  vivienda: {
    tipo_vivienda: { id: 1, nombre: "Casa" },
    disposicion_basuras: {
      recolector: true,
      quemada: false,
      enterrada: false,
      recicla: true,
      aire_libre: false,
      no_aplica: false
    }
  },
  servicios_agua: {
    sistema_acueducto: { id: 1, nombre: "Acueducto Público" },
    aguas_residuales: { id: 1, nombre: "Alcantarillado" }
  },
  observaciones: "Familia que realiza comunión en casa - PRUEBA",
  familyMembers: [
    {
      nombres: "Carlos Comunión García",
      numeroIdentificacion: "98765432",
      tipoIdentificacion: { id: 1, nombre: "Cédula de Ciudadanía" },
      fechaNacimiento: "1985-03-15",
      sexo: { id: 1, nombre: "Masculino" },
      telefono: "3009876543",
      situacionCivil: { id: 1, nombre: "Casado Civil" },
      estudio: { id: 1, nombre: "Universitario" },
      parentesco: { id: 1, nombre: "Jefe de Hogar" },
      comunidadCultural: { id: 1, nombre: "Ninguna" },
      enfermedad: { id: 1, nombre: "Ninguna" },
      "talla_camisa/blusa": "L",
      talla_pantalon: "32",
      talla_zapato: "42",
      profesion: { id: 1, nombre: "Ingeniero" },
      motivoFechaCelebrar: {
        motivo: "Cumpleaños",
        dia: "15",
        mes: "03"
      }
    }
  ],
  deceasedMembers: []
};

console.log('📋 JSON de prueba generado:');
console.log('✅ Campo comunionEnCasa:', encuestaTestComunion.informacionGeneral.comunionEnCasa);
console.log('✅ Apellido familia:', encuestaTestComunion.informacionGeneral.apellido_familiar);
console.log('✅ Total miembros:', encuestaTestComunion.familyMembers.length);
console.log('✅ Observaciones:', encuestaTestComunion.observaciones);

// Validar estructura requerida
const camposRequeridos = [
  'informacionGeneral',
  'vivienda', 
  'servicios_agua',
  'observaciones',
  'familyMembers'
];

console.log('\n🔍 Validando estructura requerida...');
const faltantes = [];

camposRequeridos.forEach(campo => {
  if (!encuestaTestComunion.hasOwnProperty(campo)) {
    faltantes.push(campo);
  } else {
    console.log(`✅ ${campo}: presente`);
  }
});

if (faltantes.length > 0) {
  console.log('❌ Campos faltantes:', faltantes);
} else {
  console.log('✅ Todos los campos requeridos están presentes');
}

// Validar campo específico
console.log('\n🆕 Validando nuevo campo comunionEnCasa...');
if (encuestaTestComunion.informacionGeneral.hasOwnProperty('comunionEnCasa')) {
  const valor = encuestaTestComunion.informacionGeneral.comunionEnCasa;
  console.log(`✅ comunionEnCasa: ${valor} (tipo: ${typeof valor})`);
  
  if (typeof valor === 'boolean') {
    console.log('✅ Tipo correcto: boolean');
  } else {
    console.log('⚠️ Tipo incorrecto: esperado boolean');
  }
} else {
  console.log('❌ Campo comunionEnCasa no encontrado');
}

console.log('\n🧪 Prueba completada exitosamente');
console.log('📝 Para probar el endpoint completo, usar:');
console.log('   1. Iniciar servidor: npm run dev');
console.log('   2. Obtener JWT token');
console.log('   3. Usar PowerShell script: .\\test-comunion-endpoint.ps1');

export { encuestaTestComunion };
