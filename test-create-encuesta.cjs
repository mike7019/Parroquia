const https = require('https');
const http = require('http');

const payload = {
  "informacionGeneral": {
    "municipio": {
      "id": 1110,
      "nombre": "Yolombó"
    },
    "parroquia": {
      "id": 1,
      "nombre": "Parroquia San José"
    },
    "sector": {
      "id": 1,
      "nombre": "Sector San José"
    },
    "vereda": {
      "id": 1,
      "nombre": "El Rubí"
    },
    "corregimiento": {
      "id": 11,
      "nombre": "Corregimiento San Mike"
    },
    "centro_poblado": {
      "id": 3,
      "nombre": "Centro Poblado San Pedro"
    },
    "fecha": "2025-11-09T03:32:17.404Z",
    "apellido_familiar": `TEST OBS ${Date.now()}`,
    "direccion": `Calle Test ${Date.now()}`,
    "telefono": `${Math.floor(Math.random() * 9000000) + 1000000}`,
    "numero_contrato_epm": `TEST-NODE-${Date.now()}`
  },
  "vivienda": {
    "tipo_vivienda": {
      "id": 2,
      "nombre": "Apartamento"
    },
    "disposicion_basuras": [
      {
        "id": 5,
        "nombre": "Compostaje Mejorado",
        "seleccionado": true
      },
      {
        "id": 2,
        "nombre": "Quema",
        "seleccionado": true
      },
      {
        "id": 1,
        "nombre": "Recolección Pública",
        "seleccionado": true
      }
    ]
  },
  "servicios_agua": {
    "sistema_acueducto": {
      "id": 1,
      "nombre": "Acueducto Municipal"
    },
    "aguas_residuales": [
      {
        "id": 1,
        "nombre": "Alcantarillado",
        "seleccionado": true
      },
      {
        "id": 2,
        "nombre": "Pozo Séptico",
        "seleccionado": true
      }
    ]
  },
  "observaciones": {
    "sustento_familia": "tma nuevo pruiebs",
    "observaciones_encuestador": "completedooo",
    "autorizacion_datos": true
  },
  "familyMembers": [
    {
      "nombres": "Raquel Rodriguez Gonzales",
      "fechaNacimiento": "2000-11-01T00:00:00.000Z",
      "tipoIdentificacion": {
        "id": 3,
        "nombre": "CC - Cédula de Ciudadanía"
      },
      "numeroIdentificacion": `${Date.now()}`,
      "sexo": {
        "id": 2,
        "nombre": "Femenino"
      },
      "situacionCivil": {
        "id": 1,
        "nombre": "Soltero(a)"
      },
      "parentesco": {
        "id": 25,
        "nombre": "Jefa de Hogar"
      },
      "talla_camisa": "12",
      "talla_pantalon": "28",
      "talla_zapato": "37",
      "estudio": {
        "id": 3,
        "nombre": "Educación Secundaria"
      },
      "comunidadCultural": {
        "id": 5,
        "nombre": "Otra"
      },
      "telefono": "3218820571",
      "enQueEresLider": [
        "mmm",
        "todo",
        "nada"
      ],
      "correo_electronico": "raquel.176@gmail.com",
      "enfermedades": [
        {
          "id": 76,
          "nombre": "Anemia"
        },
        {
          "id": 67,
          "nombre": "Acné"
        }
      ],
      "necesidadesEnfermo": [
        "pasajes",
        "medicamentos"
      ],
      "solicitudComunionCasa": true,
      "profesionMotivoFechaCelebrar": {
        "profesion": {
          "id": 6,
          "nombre": "Agricultor"
        },
        "celebraciones": [
          {
            "motivo": "Cumpleaños",
            "dia": "12",
            "mes": "11"
          },
          {
            "motivo": "Dia de la madre",
            "dia": "8",
            "mes": "5"
          }
        ]
      },
      "habilidades": [
        {
          "id": 16,
          "nombre": "Artesanía",
          "nivel": "Avanzado"
        },
        {
          "id": 12,
          "nombre": "Cocina",
          "nivel": "Avanzado"
        }
      ],
      "destrezas": [
        {
          "id": 19,
          "nombre": "Agricultura"
        },
        {
          "id": 14,
          "nombre": "Barbería"
        }
      ]
    }
  ],
  "deceasedMembers": [
    {
      "nombres": "Juan Camilo Rodriguez Gacha",
      "fechaFallecimiento": "2025-11-28T05:00:00.000Z",
      "sexo": {
        "id": 1,
        "nombre": "Masculino"
      },
      "parentesco": {
        "id": 1,
        "nombre": "Abuelo"
      },
      "causaFallecimiento": "Natural"
    }
  ],
  "metadata": {
    "timestamp": "2025-11-09T04:06:36.092Z",
    "completed": false,
    "currentStage": 6
  },
  "version": "2.0"
};

const postData = JSON.stringify(payload);

const options = {
  hostname: '206.62.139.100',
  port: 3001,
  path: '/api/encuesta',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwYzlkNWU1Ny1kNDhhLTRjNDctODljZS0xMjk5YWNjOWU0ZGUiLCJlbWFpbCI6ImFkbWluQHBhcnJvcXVpYS5jb20iLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzY1OTgyNTU2LCJleHAiOjE3NjYyNDE3NTZ9.ehuWbujUAJ93MHAHmH6fFQV7nyUnlQwLE8NBgQWmc0s',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('📤 Enviando POST a http://206.62.139.100:3001/api/encuesta');
console.log('📦 Payload observaciones:', payload.observaciones);
console.log('');

const req = http.request(options, (res) => {
  let data = '';

  console.log(`📊 Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  console.log('');

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('✅ Response recibido:\n');
    try {
      const response = JSON.parse(data);
      console.log(JSON.stringify(response, null, 2));
      
      if (response.exito && response.datos && response.datos.id_familia) {
        const familiaId = response.datos.id_familia;
        console.log(`\n🎯 Familia creada con ID: ${familiaId}`);
        console.log('\n🔍 Ahora verificando en la base de datos...\n');
        
        // Verificar en la base de datos
        const { Sequelize, QueryTypes } = require('sequelize');
        const sequelize = new Sequelize(
          'parroquia_db',
          'parroquia_user',
          'ParroquiaSecure2025',
          {
            host: '206.62.139.100',
            port: 5433,
            dialect: 'postgres',
            logging: false
          }
        );
        
        (async () => {
          await sequelize.authenticate();
          const [familia] = await sequelize.query(
            `SELECT 
              id_familia,
              apellido_familiar,
              sustento_familia,
              observaciones_encuestador,
              autorizacion_datos
             FROM familias 
             WHERE id_familia = :familiaId`,
            {
              replacements: { familiaId },
              type: QueryTypes.SELECT
            }
          );
          
          console.log('📊 Datos en la base de datos:\n');
          console.log(JSON.stringify(familia, null, 2));
          
          if (familia.sustento_familia && familia.observaciones_encuestador) {
            console.log('\n✅ ¡ÉXITO! Los datos de observaciones SÍ se guardaron correctamente');
          } else {
            console.log('\n❌ ERROR: Los datos de observaciones NO se guardaron (son NULL)');
            console.log('⚠️  El servidor necesita hacer git pull y reiniciar PM2');
          }
          
          await sequelize.close();
        })();
      }
    } catch (err) {
      console.log('❌ Error parseando response:', err.message);
      console.log('Raw data:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Error en request: ${e.message}`);
});

req.write(postData);
req.end();
