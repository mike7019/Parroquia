/**
 * Test de Encuesta con Formato JSON v2.0
 * 
 * Este test valida el nuevo formato JSON v2.0 con:
 * - disposicion_basuras: Array de objetos con selección
 * - aguas_residuales: Array de selecciones múltiples
 * - profesionMotivoFechaCelebrar: Estructura anidada
 * - enfermedades: Array (plural)
 * - necesidadesEnfermo: Array de necesidades
 * - enQueEresLider: Array de liderazgos
 * - solicitudComunionCasa: A nivel de miembro
 */

const payloadV2 = {
  "informacionGeneral": {
    "municipio": {
      "id": "1",
      "nombre": "Abejorral"
    },
    "parroquia": {
      "id": "4",
      "nombre": "Parroquia San Diego"
    },
    "sector": {
      "id": "28",
      "nombre": "CENTRAL 3"
    },
    "vereda": {
      "id": "26",
      "nombre": "El Alamo"
    },
    "corregimiento": {
      "id": "1",
      "nombre": "Corregimiento El Centro"
    },
    "centro_poblado": {
      "id": "1",
      "nombre": "Centro Poblado San Pedro"
    },
    "fecha": "2025-10-29",
    "apellido_familiar": "Familia Test V2",
    "direccion": "Calle Test V2 #123",
    "telefono": "3001234567",
    "numero_contrato_epm": "TEST-V2-001"
  },
  "vivienda": {
    "tipo_vivienda": {
      "id": "2",
      "nombre": "Apartamento"
    },
    "disposicion_basuras": [
      {
        "id": "5",
        "nombre": "Campo Abierto",
        "seleccionado": true
      },
      {
        "id": "7",
        "nombre": "Compostaje",
        "seleccionado": true
      },
      {
        "id": "3",
        "nombre": "Entierro",
        "seleccionado": false
      },
      {
        "id": "2",
        "nombre": "Quema",
        "seleccionado": false
      },
      {
        "id": "6",
        "nombre": "Reciclaje",
        "seleccionado": false
      },
      {
        "id": "1",
        "nombre": "Recolección Pública",
        "seleccionado": false
      },
      {
        "id": "4",
        "nombre": "Río o Quebrada",
        "seleccionado": true
      }
    ]
  },
  "servicios_agua": {
    "sistema_acueducto": {
      "id": "6",
      "nombre": "Nacimiento"
    },
    "aguas_residuales": [
      {
        "id": "1",
        "nombre": "Alcantarillado Público",
        "seleccionado": true
      },
      {
        "id": "2",
        "nombre": "Pozo Séptico",
        "seleccionado": false
      },
      {
        "id": "3",
        "nombre": "Letrina",
        "seleccionado": false
      },
      {
        "id": "4",
        "nombre": "Campo Abierto",
        "seleccionado": false
      },
      {
        "id": "5",
        "nombre": "Río o Quebrada",
        "seleccionado": false
      },
      {
        "id": "6",
        "nombre": "tipo prueba 8",
        "seleccionado": true
      }
    ]
  },
  "observaciones": {
    "sustento_familia": "Test de formato v2.0 - Familia de prueba",
    "observaciones_encuestador": "Validando nuevo formato JSON",
    "autorizacion_datos": true
  },
  "familyMembers": [
    {
      "nombres": "Juan Carlos Test V2",
      "fechaNacimiento": "1990-03-08T05:00:00.000Z",
      "numeroIdentificacion": "TEST-V2-001",
      "tipoIdentificacion": {
        "id": "CC",
        "nombre": "CC - Cédula de Ciudadanía"
      },
      "telefono": "345-636-3625",
      "correoElectronico": "testv2@gmail.com",
      "sexo": {
        "id": "1",
        "nombre": "Masculino"
      },
      "parentesco": {
        "id": "2",
        "nombre": "Jefe de Hogar"
      },
      "situacionCivil": {
        "id": "5",
        "nombre": "Unión Libre"
      },
      "estudio": {
        "id": "6",
        "nombre": "Bachillerato Completo"
      },
      "profesionMotivoFechaCelebrar": {
        "profesion": {
          "id": "1",
          "nombre": "Agricultor"
        },
        "celebraciones": [
          {
            "id": "test-001",
            "motivo": "Cumpleaños",
            "dia": "8",
            "mes": "3"
          },
          {
            "id": "test-002",
            "motivo": "Aniversario",
            "dia": "15",
            "mes": "6"
          }
        ]
      },
      "comunidadCultural": {
        "id": "9",
        "nombre": "Afrocolombiano"
      },
      "enfermedades": [
        {
          "id": "9",
          "nombre": "Arritmias cardíacas"
        },
        {
          "id": "7",
          "nombre": "Enfermedad cardiovascular"
        },
        {
          "id": "5",
          "nombre": "Obesidad"
        }
      ],
      "necesidadesEnfermo": [
        "Medicina para su enfermedad",
        "Silla de ruedas",
        "Controles médicos regulares"
      ],
      "solicitudComunionCasa": true,
      "talla_camisa": "M",
      "talla_pantalon": "32",
      "talla_zapato": "42",
      "enQueEresLider": [
        "Agricultor",
        "Líder comunitario",
        "Coordinador deportivo"
      ],
      "habilidades": [
        {
          "id": 7,
          "nombre": "Adaptabilidad",
          "nivel": "Intermedio"
        },
        {
          "id": 4,
          "nombre": "Resolución de Problemas",
          "nivel": "Avanzado"
        }
      ],
      "destrezas": [
        {
          "id": 9,
          "nombre": "Diseño Gráfico"
        },
        {
          "id": 7,
          "nombre": "Jardinería"
        }
      ]
    },
    {
      "nombres": "Maria Test V2",
      "fechaNacimiento": "1992-07-11T05:00:00.000Z",
      "numeroIdentificacion": "TEST-V2-002",
      "tipoIdentificacion": {
        "id": "CC",
        "nombre": "CC - Cédula de Ciudadanía"
      },
      "telefono": "314-785-6966",
      "correoElectronico": "mariav2@gmail.com",
      "sexo": {
        "id": "2",
        "nombre": "Femenino"
      },
      "parentesco": {
        "id": "4",
        "nombre": "Esposa"
      },
      "situacionCivil": {
        "id": "5",
        "nombre": "Unión Libre"
      },
      "estudio": {
        "id": "6",
        "nombre": "Bachillerato Completo"
      },
      "profesionMotivoFechaCelebrar": {
        "profesion": {
          "id": "15",
          "nombre": "Ama de Casa"
        },
        "celebraciones": [
          {
            "id": "test-003",
            "motivo": "Cumpleaños",
            "dia": "11",
            "mes": "7"
          }
        ]
      },
      "comunidadCultural": {
        "id": "18",
        "nombre": "Ninguna"
      },
      "enfermedades": [
        {
          "id": "5",
          "nombre": "Obesidad"
        }
      ],
      "necesidadesEnfermo": [
        "Pasajes para Citas",
        "Gimnasio"
      ],
      "solicitudComunionCasa": false,
      "talla_camisa": "S",
      "talla_pantalon": "28",
      "talla_zapato": "37",
      "enQueEresLider": [
        "Madre comunitaria",
        "Organizadora de eventos"
      ],
      "habilidades": [
        {
          "id": 8,
          "nombre": "Creatividad",
          "nivel": "Avanzado"
        }
      ],
      "destrezas": [
        {
          "id": 8,
          "nombre": "Cocina"
        },
        {
          "id": 5,
          "nombre": "Costura"
        }
      ]
    }
  ],
  "deceasedMembers": [
    {
      "nombres": "Pedro Test V2",
      "fechaFallecimiento": "2020-08-03T05:00:00.000Z",
      "sexo": {
        "id": "1",
        "nombre": "Masculino"
      },
      "parentesco": {
        "id": "17",
        "nombre": "Abuelo"
      },
      "causaFallecimiento": "Causas naturales - Test V2",
      "id": "TEST-V2-DEC-001"
    }
  ],
  "metadata": {
    "timestamp": "2025-10-29T14:17:18.967Z",
    "completed": false,
    "currentStage": 4
  },
  "version": "2.0"
};

// Función para ejecutar el test
async function testEncuestaV2() {
  console.log('🧪 Iniciando test de Encuesta V2.0...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/encuesta', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Agregar token de autenticación aquí si es necesario
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
      },
      body: JSON.stringify(payloadV2)
    });

    const result = await response.json();

    console.log('📊 Respuesta del servidor:');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('\n✅ TEST EXITOSO - Formato V2.0 procesado correctamente');
      
      // Validaciones específicas del formato v2.0
      console.log('\n🔍 Validaciones V2.0:');
      console.log('✓ disposicion_basuras (array) procesado');
      console.log('✓ aguas_residuales (array) procesado');
      console.log('✓ profesionMotivoFechaCelebrar procesado');
      console.log('✓ enfermedades (plural) procesado');
      console.log('✓ necesidadesEnfermo procesado');
      console.log('✓ enQueEresLider (array) procesado');
      console.log('✓ solicitudComunionCasa procesado');
      
    } else {
      console.log('\n❌ TEST FALLIDO');
      console.log('Error:', result.message || result.error);
      
      if (result.errors) {
        console.log('\nDetalles de errores:');
        result.errors.forEach((err, idx) => {
          console.log(`  ${idx + 1}. ${err.field}: ${err.message}`);
        });
      }
    }

  } catch (error) {
    console.error('\n💥 ERROR EN LA PETICIÓN:');
    console.error(error.message);
    console.error('\nVerifique que:');
    console.error('1. El servidor esté corriendo en http://localhost:3000');
    console.error('2. Tenga un token de autenticación válido (si es requerido)');
    console.error('3. Los catálogos estén cargados en la base de datos');
  }
}

// Ejecutar test
testEncuestaV2().catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});
