/**
 * Test Completo de Encuesta V2.0 con Autenticación
 * Primero hace login, luego ejecuta el test con múltiples celebraciones y enfermedades
 */

const API_BASE_URL = 'http://localhost:3000/api';

// Payload V2.0 completo con múltiples celebraciones y enfermedades
const payloadV2 = {
  "informacionGeneral": {
    "municipio": { "id": "1", "nombre": "Abejorral" },
    "parroquia": { "id": "4", "nombre": "Parroquia San Diego" },
    "sector": { "id": "28", "nombre": "CENTRAL 3" },
    "vereda": { "id": "26", "nombre": "El Alamo" },
    "corregimiento": { "id": "1", "nombre": "Corregimiento El Centro" },
    "fecha": "2025-10-29",
    "apellido_familiar": "Familia Test Múltiples Celebraciones",
    "direccion": "Calle Test Tablas Intermedias #123",
    "telefono": "3001234567",
    "numero_contrato_epm": "TEST-MULTI-001"
  },
  "vivienda": {
    "tipo_vivienda": { "id": "1", "nombre": "Casa" },
    "disposicion_basuras": [
      { "id": "1", "nombre": "Recolección Pública", "seleccionado": true },
      { "id": "4", "nombre": "Reciclaje", "seleccionado": true }
    ]
  },
  "servicios_agua": {
    "sistema_acueducto": { "id": "1", "nombre": "Acueducto Público" },
    "aguas_residuales": [
      { "id": "1", "nombre": "Alcantarillado Público", "seleccionado": true }
    ]
  },
  "observaciones": {
    "sustento_familia": "Test de múltiples celebraciones y enfermedades",
    "observaciones_encuestador": "Validando tablas intermedias persona_celebracion y persona_enfermedad",
    "autorizacion_datos": true
  },
  "familyMembers": [
    {
      "nombres": "María Test Múltiple",
      "fechaNacimiento": "1985-03-15T05:00:00.000Z",
      "numeroIdentificacion": "TEST-MULTI-001",
      "tipoIdentificacion": { "id": "1", "nombre": "Cédula de Ciudadanía" },
      "telefono": "300-111-2222",
      "correoElectronico": "maria.multiple@test.com",
      "sexo": { "id": "3", "nombre": "Femenino" },
      "parentesco": { "id": "2", "nombre": "Jefa de Hogar" },
      "situacionCivil": { "id": "1", "nombre": "Casado Civil" },
      "estudio": { "id": "6", "nombre": "Bachillerato Completo" },
      
      // ⭐ MÚLTIPLES CELEBRACIONES (3 en total)
      "profesionMotivoFechaCelebrar": {
        "profesion": { "id": "1", "nombre": "Ingeniero" },
        "celebraciones": [
          { "id": "cel-001", "motivo": "Cumpleaños", "dia": "15", "mes": "3" },
          { "id": "cel-002", "motivo": "Santo (Santa María)", "dia": "1", "mes": "1" },
          { "id": "cel-003", "motivo": "Aniversario de Bautizo", "dia": "20", "mes": "4" }
        ]
      },
      
      "comunidadCultural": { "id": "5", "nombre": "Otra" },
      
      // ⭐ MÚLTIPLES ENFERMEDADES (4 en total)
      "enfermedades": [
        { "id": 1, "nombre": "Diabetes" },
        { "id": 2, "nombre": "Hipertensión" },
        { "id": 3, "nombre": "Artritis" },
        { "id": 4, "nombre": "Obesidad" }
      ],
      
      // ⭐ NECESIDADES MÉDICAS
      "necesidadesEnfermo": [
        "Medicamentos controlados",
        "Control médico mensual",
        "Dieta especializada"
      ],
      
      // ⭐ LIDERAZGOS
      "enQueEresLider": [
        "Madre comunitaria",
        "Líder del comedor",
        "Catequista"
      ],
      
      "solicitudComunionCasa": true,
      "talla_camisa": "M",
      "talla_pantalon": "30",
      "talla_zapato": "38",
      "habilidades": [
        { "id": 8, "nombre": "Mecánica", "nivel": "Avanzado" }
      ],
      "destrezas": [
        { "id": 32, "nombre": "Cocina" }
      ]
    },
    {
      "nombres": "Pedro Test Múltiple",
      "fechaNacimiento": "1982-07-20T05:00:00.000Z",
      "numeroIdentificacion": "TEST-MULTI-002",
      "tipoIdentificacion": { "id": "1", "nombre": "Cédula de Ciudadanía" },
      "telefono": "300-333-4444",
      "correoElectronico": "pedro.multiple@test.com",
      "sexo": { "id": "1", "nombre": "Masculino" },
      "parentesco": { "id": "1", "nombre": "Jefe de Hogar" },
      "situacionCivil": { "id": "1", "nombre": "Casado Civil" },
      "estudio": { "id": "7", "nombre": "Universitario" },
      
      // ⭐ MÚLTIPLES CELEBRACIONES (2 en total)
      "profesionMotivoFechaCelebrar": {
        "profesion": { "id": "1", "nombre": "Ingeniero" },
        "celebraciones": [
          { "id": "cel-004", "motivo": "Cumpleaños", "dia": "20", "mes": "7" },
          { "id": "cel-005", "motivo": "Santo (San Pedro)", "dia": "29", "mes": "6" }
        ]
      },
      
      "comunidadCultural": { "id": "5", "nombre": "Otra" },
      
      // ⭐ MÚLTIPLES ENFERMEDADES (2 en total)
      "enfermedades": [
        { "id": 5, "nombre": "Asma" },
        { "id": 2, "nombre": "Hipertensión" }
      ],
      
      "necesidadesEnfermo": [
        "Inhalador",
        "Control presión arterial"
      ],
      
      "enQueEresLider": [
        "Líder comunitario",
        "Acólito"
      ],
      
      "solicitudComunionCasa": false,
      "talla_camisa": "L",
      "talla_pantalon": "34",
      "talla_zapato": "42",
      "habilidades": [
        { "id": 1, "nombre": "Carpintería", "nivel": "Avanzado" }
      ],
      "destrezas": [
        { "id": 34, "nombre": "Carpintería" }
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

/**
 * Hacer login y obtener token
 */
async function login() {
  console.log('🔐 Autenticando...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        correo_electronico: 'admin@parroquia.com',
        contrasena: 'Admin123!'
      })
    });

    const data = await response.json();
    
    console.log('📋 Respuesta de login - Status:', data.status);

    if (response.ok && (data.status === 'success' || data.exito)) {
      console.log('✅ Login exitoso');
      return data.data?.accessToken || data.datos?.token || data.token;
    } else {
      console.error('❌ Login fallido:', data.mensaje || data.message);
      return null;
    }
  } catch (error) {
    console.error('💥 Error en login:', error.message);
    console.error('   Stack:', error.stack);
    return null;
  }
}

/**
 * Test principal de encuesta V2.0
 */
async function testEncuestaV2WithAuth() {
  console.log('\n🧪 TEST DE ENCUESTA V2.0 CON MÚLTIPLES CELEBRACIONES Y ENFERMEDADES');
  console.log('='.repeat(80));
  
  // 1. Obtener token
  const token = await login();
  if (!token) {
    console.error('❌ No se pudo obtener token de autenticación');
    process.exit(1);
  }

  console.log('\n📤 Enviando payload V2.0...');
  console.log(`   - Familia: ${payloadV2.informacionGeneral.apellido_familiar}`);
  console.log(`   - Miembros: ${payloadV2.familyMembers.length}`);
  console.log(`   - Celebraciones totales: ${payloadV2.familyMembers.reduce((sum, m) => sum + (m.profesionMotivoFechaCelebrar?.celebraciones?.length || 0), 0)}`);
  console.log(`   - Enfermedades totales: ${payloadV2.familyMembers.reduce((sum, m) => sum + (m.enfermedades?.length || 0), 0)}`);

  try {
    const response = await fetch(`${API_BASE_URL}/encuesta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payloadV2)
    });

    const result = await response.json();

    console.log('\n📊 Respuesta del servidor:');
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      console.log('\n✅ TEST EXITOSO');
      console.log('\n📋 Datos de la encuesta creada:');
      console.log(`   Familia ID: ${result.data?.familia_id || result.datos?.familia_id}`);
      console.log(`   Código Familia: ${result.data?.codigo_familia || result.datos?.codigo_familia}`);
      console.log(`   Personas creadas: ${result.data?.personas_creadas || result.datos?.personas_creadas}`);
      
      const familiaId = result.data?.familia_id || result.datos?.familia_id;
      
      if (familiaId) {
        console.log('\n🔍 Ahora validando que las celebraciones y enfermedades se guardaron...');
        await validarDatosGuardados(familiaId, token);
      }
      
      return true;
    } else {
      console.log('\n❌ TEST FALLIDO');
      console.log(`   Error: ${result.message || result.mensaje}`);
      console.log('   Respuesta completa:', JSON.stringify(result, null, 2));
      if (result.errors || result.errores) {
        console.log('   Detalles:');
        const errors = result.errors || result.errores;
        errors.forEach(err => {
          console.log(`     - ${err.field || err.campo}: ${err.message || err.mensaje}`);
        });
      }
      return false;
    }
  } catch (error) {
    console.log('\n💥 ERROR DE CONEXIÓN');
    console.log(`   ${error.message}`);
    return false;
  }
}

/**
 * Validar que los datos se guardaron correctamente en las tablas intermedias
 */
async function validarDatosGuardados(familiaId, token) {
  console.log('\n📊 VALIDACIÓN DE DATOS EN TABLAS INTERMEDIAS');
  console.log('='.repeat(80));
  
  // Aquí haríamos queries a la BD, pero por ahora solo mostramos el ID
  console.log(`✅ Familia creada con ID: ${familiaId}`);
  console.log('\n💡 Para validar manualmente, ejecutar:');
  console.log(`
-- Ver celebraciones guardadas
SELECT p.primer_nombre, p.primer_apellido, pc.motivo, pc.dia, pc.mes
FROM personas p
INNER JOIN persona_celebracion pc ON pc.id_persona = p.id_personas
WHERE p.id_familia_familias = ${familiaId}
ORDER BY p.id_personas, pc.mes, pc.dia;

-- Ver enfermedades guardadas
SELECT p.primer_nombre, p.primer_apellido, e.nombre, pe.notas, pe.activo
FROM personas p
INNER JOIN persona_enfermedad pe ON pe.id_persona = p.id_personas
INNER JOIN enfermedades e ON e.id = pe.id_enfermedad
WHERE p.id_familia_familias = ${familiaId}
ORDER BY p.id_personas;
  `);
}

// Ejecutar test con autenticación
testEncuestaV2WithAuth().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});
