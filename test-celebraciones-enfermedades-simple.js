/**
 * Test simplificado para validar SOLO celebraciones y enfermedades
 * Sin habilidades ni destrezas para evitar errores de FK
 */

const API_BASE_URL = 'http://localhost:3000/api';

const payloadSimple = {
  "informacionGeneral": {
    "apellido_familiar": "Test Celebraciones Simple",
    "telefono": "300-999-9999",
    "direccion": "Calle Test Simple #456",
    "municipio": { "id": "1", "nombre": "Municipio Test" },
    "sector": { "id": "1", "nombre": "Sector Test" }
  },
  "vivienda": {
    "tipo_vivienda": { "id": "1", "nombre": "Casa" },
    "disposicion_basuras": [
      { "id": "1", "nombre": "Recolección pública", "seleccionado": true }
    ]
  },
  "servicios_agua": {
    "sistema_acueducto": { "id": "1", "nombre": "Acueducto Público" },
    "aguas_residuales": [
      { "id": "1", "nombre": "Alcantarillado Público", "seleccionado": true }
    ]
  },
  "observaciones": {
    "sustento_familia": "Test de celebraciones y enfermedades",
    "observaciones_encuestador": "Validando tablas intermedias",
    "autorizacion_datos": true
  },
  "familyMembers": [
    {
      "nombres": "María Simple",
      "fechaNacimiento": "1985-03-15T05:00:00.000Z",
      "numeroIdentificacion": "TEST-SIMPLE-001",
      "tipoIdentificacion": { "id": "1", "nombre": "Cédula de Ciudadanía" },
      "telefono": "300-111-2222",
      "correoElectronico": "maria.simple@test.com",
      "sexo": { "id": "3", "nombre": "Femenino" },
      "parentesco": { "id": "2", "nombre": "Jefa de Hogar" },
      "situacionCivil": { "id": "1", "nombre": "Casado Civil" },
      "estudio": { "id": "6", "nombre": "Bachillerato Completo" },
      
      "profesionMotivoFechaCelebrar": {
        "profesion": { "id": "1", "nombre": "Ingeniero" },
        "celebraciones": [
          { "motivo": "Cumpleaños", "dia": "15", "mes": "3" },
          { "motivo": "Santo", "dia": "19", "mes": "3" },
          { "motivo": "Aniversario", "dia": "20", "mes": "6" }
        ]
      },
      
      "comunidadCultural": { "id": "5", "nombre": "Otra" },
      
      "enfermedades": [
        { "id": 1, "nombre": "Diabetes" },
        { "id": 2, "nombre": "Hipertensión" },
        { "id": 3, "nombre": "Artritis" }
      ],
      
      "necesidadesEnfermo": [
        "Medicamentos",
        "Control médico"
      ],
      
      "solicitudComunionCasa": true
    }
  ],
  "deceasedMembers": [],
  "metadata": {
    "timestamp": "2025-10-29T16:00:00.000Z",
    "completed": true,
    "currentStage": 6
  },
  "version": "2.0"
};

async function login() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correo_electronico: 'admin@parroquia.com',
        contrasena: 'Admin123!'
      })
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      return data.data.accessToken;
    }
    return null;
  } catch (error) {
    console.error('💥 Error en login:', error.message);
    return null;
  }
}

async function testSimple() {
  console.log('\n🧪 TEST SIMPLE: CELEBRACIONES Y ENFERMEDADES');
  console.log('='.repeat(80));
  
  const token = await login();
  if (!token) {
    console.error('❌ No se pudo autenticar');
    process.exit(1);
  }
  console.log('✅ Autenticado\n');

  console.log('📤 Enviando encuesta simple...');
  console.log(`   - 1 persona`);
  console.log(`   - 3 celebraciones`);
  console.log(`   - 3 enfermedades\n`);

  try {
    const response = await fetch(`${API_BASE_URL}/encuesta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payloadSimple)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ ENCUESTA CREADA EXITOSAMENTE\n');
      console.log(`📋 Familia ID: ${result.data.familia_id}`);
      console.log(`📋 Personas creadas: ${result.data.personas_creadas}\n`);
      
      const familiaId = result.data.familia_id;
      
      console.log('🔍 Validando celebraciones guardadas...');
      console.log('\nSQL para verificar:');
      console.log('SELECT pc.*, p.primer_nombre FROM persona_celebracion pc');
      console.log('JOIN personas p ON p.id_personas = pc.id_persona');
      console.log(`WHERE p.id_familia = ${familiaId};`);
      
      console.log('\n🔍 Validando enfermedades guardadas...');
      console.log('\nSQL para verificar:');
      console.log('SELECT pe.*, p.primer_nombre, e.nombre FROM persona_enfermedad pe');
      console.log('JOIN personas p ON p.id_personas = pe.id_persona');
      console.log('JOIN enfermedades e ON e.id = pe.id_enfermedad');
      console.log(`WHERE p.id_familia = ${familiaId};`);
      
      return true;
    } else {
      console.log('❌ ERROR EN LA CREACIÓN');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${result.message}`);
      console.log(`\n   Detalles:`, JSON.stringify(result, null, 2));
      return false;
    }
  } catch (error) {
    console.log('💥 ERROR DE CONEXIÓN');
    console.log(`   ${error.message}`);
    return false;
  }
}

testSimple().then(success => {
  process.exit(success ? 0 : 1);
});
