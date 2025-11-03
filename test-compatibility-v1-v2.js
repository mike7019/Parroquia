/**
 * Test de Compatibilidad: Formato V1.0 vs V2.0
 * 
 * Este test valida que el controlador soporte ambos formatos simultáneamente
 */

// Payload formato V1.0 (formato anterior)
const payloadV1 = {
  "informacionGeneral": {
    "municipio": { "id": "1", "nombre": "Abejorral" },
    "parroquia": { "id": "4", "nombre": "Parroquia San Diego" },
    "sector": { "id": "28", "nombre": "CENTRAL 3" },
    "vereda": { "id": "26", "nombre": "El Alamo" },
    "corregimiento": { "id": "1", "nombre": "Corregimiento El Centro" },
    "fecha": "2025-10-29",
    "apellido_familiar": "Familia Test V1",
    "direccion": "Calle Test V1 #456",
    "telefono": "3009876543",
    "numero_contrato_epm": "TEST-V1-001",
    "comunionEnCasa": true
  },
  "vivienda": {
    "tipo_vivienda": { "id": "1", "nombre": "Casa" },
    // Formato V1.0: Objeto con booleanos
    "disposicion_basuras": {
      "recolector": true,
      "quemada": false,
      "enterrada": false,
      "recicla": true,
      "aire_libre": false,
      "no_aplica": false
    }
  },
  "servicios_agua": {
    "sistema_acueducto": { "id": "1", "nombre": "Acueducto Público" },
    // Formato V1.0: Objeto único
    "aguas_residuales": { "id": "1", "nombre": "Alcantarillado" },
    "pozo_septico": false,
    "letrina": false,
    "campo_abierto": false
  },
  "observaciones": {
    "sustento_familia": "Test formato V1.0",
    "observaciones_encuestador": "Validando compatibilidad",
    "autorizacion_datos": true
  },
  "familyMembers": [
    {
      "nombres": "Pedro Test V1",
      "fechaNacimiento": "1985-05-20T05:00:00.000Z",
      "numeroIdentificacion": "TEST-V1-001",
      "tipoIdentificacion": { "id": "CC", "nombre": "CC - Cédula de Ciudadanía" },
      "telefono": "300-111-2222",
      "correoElectronico": "pedrov1@gmail.com",
      "sexo": { "id": "1", "nombre": "Masculino" },
      "parentesco": { "id": "1", "nombre": "Jefe de Hogar" },
      "situacionCivil": { "id": "1", "nombre": "Casado Civil" },
      "estudio": { "id": "7", "nombre": "Universitario" },
      // Formato V1.0: Campos separados
      "profesion": { "id": "3", "nombre": "Ingeniero" },
      "motivoFechaCelebrar": {
        "motivo": "Cumpleaños",
        "dia": "20",
        "mes": "5"
      },
      "comunidadCultural": { "id": "18", "nombre": "Ninguna" },
      // Formato V1.0: Singular
      "enfermedad": { "id": "2", "nombre": "Diabetes" },
      // Formato V1.0: String
      "en_que_eres_lider": "Presidente junta de acción comunal",
      "talla_camisa/blusa": "L",
      "talla_pantalon": "34",
      "talla_zapato": "43",
      "habilidades": [
        { "id": 1, "nombre": "Liderazgo", "nivel": "Avanzado" }
      ],
      "destrezas": [
        { "id": 1, "nombre": "Carpintería" }
      ]
    }
  ],
  "deceasedMembers": [],
  "metadata": {
    "timestamp": "2025-10-29T15:00:00.000Z",
    "completed": true,
    "currentStage": 6
  },
  "version": "1.0"
};

// Payload formato V2.0 (formato nuevo)
const payloadV2 = {
  "informacionGeneral": {
    "municipio": { "id": "1", "nombre": "Abejorral" },
    "parroquia": { "id": "4", "nombre": "Parroquia San Diego" },
    "sector": { "id": "28", "nombre": "CENTRAL 3" },
    "vereda": { "id": "26", "nombre": "El Alamo" },
    "corregimiento": { "id": "1", "nombre": "Corregimiento El Centro" },
    "fecha": "2025-10-29",
    "apellido_familiar": "Familia Test V2 Compat",
    "direccion": "Calle Test V2 #789",
    "telefono": "3005554444",
    "numero_contrato_epm": "TEST-V2-002"
    // No comunionEnCasa aquí, viene del miembro
  },
  "vivienda": {
    "tipo_vivienda": { "id": "1", "nombre": "Casa" },
    // Formato V2.0: Array de objetos
    "disposicion_basuras": [
      { "id": "1", "nombre": "Recolección Pública", "seleccionado": true },
      { "id": "4", "nombre": "Reciclaje", "seleccionado": true },
      { "id": "2", "nombre": "Quema", "seleccionado": false }
    ]
  },
  "servicios_agua": {
    "sistema_acueducto": { "id": "1", "nombre": "Acueducto Público" },
    // Formato V2.0: Array con múltiples selecciones
    "aguas_residuales": [
      { "id": "1", "nombre": "Alcantarillado Público", "seleccionado": true },
      { "id": "2", "nombre": "Pozo Séptico", "seleccionado": false }
    ]
  },
  "observaciones": {
    "sustento_familia": "Test formato V2.0 compatibilidad",
    "observaciones_encuestador": "Validando retrocompatibilidad",
    "autorizacion_datos": true
  },
  "familyMembers": [
    {
      "nombres": "Ana Test V2",
      "fechaNacimiento": "1988-08-15T05:00:00.000Z",
      "numeroIdentificacion": "TEST-V2-003",
      "tipoIdentificacion": { "id": "CC", "nombre": "CC - Cédula de Ciudadanía" },
      "telefono": "300-333-4444",
      "correoElectronico": "anav2@gmail.com",
      "sexo": { "id": "2", "nombre": "Femenino" },
      "parentesco": { "id": "2", "nombre": "Jefa de Hogar" },
      "situacionCivil": { "id": "5", "nombre": "Unión Libre" },
      "estudio": { "id": "6", "nombre": "Bachillerato Completo" },
      // Formato V2.0: Anidado
      "profesionMotivoFechaCelebrar": {
        "profesion": { "id": "15", "nombre": "Ama de Casa" },
        "celebraciones": [
          { "id": "cel-001", "motivo": "Cumpleaños", "dia": "15", "mes": "8" }
        ]
      },
      "comunidadCultural": { "id": "18", "nombre": "Ninguna" },
      // Formato V2.0: Plural (array)
      "enfermedades": [
        { "id": "5", "nombre": "Obesidad" },
        { "id": "7", "nombre": "Hipertensión" }
      ],
      // Formato V2.0: Array de necesidades
      "necesidadesEnfermo": [
        "Control médico",
        "Medicamentos"
      ],
      // Formato V2.0: Array de liderazgos
      "enQueEresLider": [
        "Madre comunitaria",
        "Líder del comedor"
      ],
      // Formato V2.0: A nivel de miembro
      "solicitudComunionCasa": true,
      "talla_camisa": "M",
      "talla_pantalon": "30",
      "talla_zapato": "38",
      "habilidades": [
        { "id": 8, "nombre": "Creatividad", "nivel": "Avanzado" }
      ],
      "destrezas": [
        { "id": 8, "nombre": "Cocina" }
      ]
    }
  ],
  "deceasedMembers": [],
  "metadata": {
    "timestamp": "2025-10-29T15:00:00.000Z",
    "completed": true,
    "currentStage": 6
  },
  "version": "2.0"
};

// Función para ejecutar test de un formato
async function testFormato(nombre, payload) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 Testing Formato ${nombre}`);
  console.log('='.repeat(60));
  
  try {
    const response = await fetch('http://localhost:3000/api/encuesta', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Agregar token aquí si es necesario
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    console.log(`\n📊 Status: ${response.status}`);
    
    if (response.ok) {
      console.log(`✅ ${nombre} - EXITOSO`);
      console.log(`   Familia ID: ${result.data?.familia_id}`);
      console.log(`   Personas creadas: ${result.data?.personas_creadas}`);
      console.log(`   Código familia: ${result.data?.codigo_familia}`);
      return { success: true, data: result.data };
    } else {
      console.log(`❌ ${nombre} - FALLIDO`);
      console.log(`   Error: ${result.message}`);
      if (result.errors) {
        console.log('   Detalles:');
        result.errors.forEach(err => console.log(`     - ${err.field}: ${err.message}`));
      }
      return { success: false, error: result };
    }
  } catch (error) {
    console.error(`💥 ${nombre} - ERROR DE CONEXIÓN`);
    console.error(`   ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Función principal de test de compatibilidad
async function testCompatibilidad() {
  console.log('\n🎯 TEST DE COMPATIBILIDAD V1.0 vs V2.0');
  console.log('Objetivo: Verificar que ambos formatos funcionen simultáneamente\n');

  const resultados = {
    v1: await testFormato('V1.0 (Legacy)', payloadV1),
    v2: await testFormato('V2.0 (Nuevo)', payloadV2)
  };

  // Resumen final
  console.log('\n' + '='.repeat(60));
  console.log('📋 RESUMEN DE RESULTADOS');
  console.log('='.repeat(60));
  
  const ambosExitosos = resultados.v1.success && resultados.v2.success;
  
  console.log(`\nFormato V1.0: ${resultados.v1.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Formato V2.0: ${resultados.v2.success ? '✅ PASS' : '❌ FAIL'}`);
  
  if (ambosExitosos) {
    console.log('\n🎉 COMPATIBILIDAD VERIFICADA - Ambos formatos funcionan correctamente');
    console.log('\nCaracterísticas validadas:');
    console.log('  ✓ Formato V1.0 (objeto booleanos) - funciona');
    console.log('  ✓ Formato V2.0 (arrays con IDs) - funciona');
    console.log('  ✓ Auto-detección de formato - funciona');
    console.log('  ✓ Retrocompatibilidad - garantizada');
  } else {
    console.log('\n⚠️  PROBLEMAS DETECTADOS');
    if (!resultados.v1.success) {
      console.log('  ❌ Formato V1.0 no funciona - Se rompió la retrocompatibilidad');
    }
    if (!resultados.v2.success) {
      console.log('  ❌ Formato V2.0 no funciona - Nueva funcionalidad con errores');
    }
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  return {
    compatible: ambosExitosos,
    resultados
  };
}

// Ejecutar test
if (typeof window === 'undefined') {
  // Node.js
  testCompatibilidad().then(result => {
    process.exit(result.compatible ? 0 : 1);
  });
} else {
  // Browser
  console.log('Ejecutar testCompatibilidad() en la consola del navegador');
}

module.exports = { payloadV1, payloadV2, testCompatibilidad, testFormato };
