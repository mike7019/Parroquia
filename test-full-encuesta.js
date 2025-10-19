import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
let authToken = null;

async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      correo_electronico: 'admin@parroquia.com',
      contrasena: 'Admin123!'
    });
    authToken = response.data.data?.accessToken || response.data.accessToken;
    console.log('✅ Login exitoso\n');
    return true;
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    return false;
  }
}

async function testFullEncuesta() {
  console.log('═'.repeat(80));
  console.log('🧪 TEST COMPLETO: Encuesta con todos los campos');
  console.log('═'.repeat(80));
  console.log('');

  const loginOk = await login();
  if (!loginOk) return;

  const timestamp = Date.now();
  const apellidoUnico = `FULL_TEST_${timestamp}`;

  const encuestaData = {
    informacionGeneral: {
      municipio: { id: 1, nombre: "Medellín" },
      parroquia: { id: 1, nombre: "San José" },
      sector: { id: 1, nombre: "Centro" },
      vereda: { id: 1, nombre: "La Macarena" },
      corregimiento: { id: 1, nombre: "El Centro" },
      fecha: new Date().toISOString(),
      apellido_familiar: apellidoUnico,
      direccion: `Calle Full Test ${timestamp}`,
      telefono: `300${timestamp.toString().slice(-7)}`,
      numero_contrato_epm: "EPM-123-FULL-TEST",  // ← VALOR ESPECÍFICO
      comunionEnCasa: true  // ← VALOR true
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
      sistema_acueducto: { id: 1, nombre: "Acueducto" },
      aguas_residuales: { id: 1, nombre: "Alcantarillado" },
      pozo_septico: false,
      letrina: false,
      campo_abierto: false
    },
    observaciones: {
      sustento_familia: "Test completo",
      observaciones_encuestador: "Verificando numero_contrato_epm y comunion_en_casa",
      autorizacion_datos: true
    },
    familyMembers: [
      {
        nombres: "Test Full Persona",
        numeroIdentificacion: `FULL${timestamp}`,
        tipoIdentificacion: { id: 1, nombre: "CC" },
        fechaNacimiento: "1990-01-01",
        sexo: { id: 1, nombre: "Masculino" },
        telefono: "3001111111",
        situacionCivil: { id: 1, nombre: "Soltero" },
        estudio: { id: 1, nombre: "Universitario" },
        parentesco: { id: 1, nombre: "Jefe" },
        comunidadCultural: { id: 1, nombre: "Ninguna" },
        enfermedad: { id: 1, nombre: "Ninguna" },
        "talla_camisa/blusa": "M",
        talla_pantalon: "32",
        talla_zapato: "40",
        profesion: { id: 1, nombre: "Ingeniero" }
      }
    ]
  };

  console.log('📤 VALORES CLAVE A VERIFICAR:');
  console.log('   - corregimiento:', JSON.stringify(encuestaData.informacionGeneral.corregimiento));
  console.log('   - numero_contrato_epm:', encuestaData.informacionGeneral.numero_contrato_epm);
  console.log('   - comunionEnCasa:', encuestaData.informacionGeneral.comunionEnCasa);
  console.log('');

  try {
    console.log('⏳ Creando encuesta...');
    const response = await axios.post(`${API_URL}/encuesta`, encuestaData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const familiaId = response.data.data?.familia_id || response.data.data?.id_familia;
    console.log(`✅ Encuesta creada - Familia ID: ${familiaId}`);
    console.log('');

    // Consultar inmediatamente
    console.log('🔍 Consultando encuesta recién creada...');
    const getResponse = await axios.get(`${API_URL}/encuesta/${familiaId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    const familia = getResponse.data.data;
    console.log('');
    console.log('═'.repeat(80));
    console.log('📊 RESULTADOS:');
    console.log('═'.repeat(80));
    console.log('');
    console.log('DATOS GEOGRÁFICOS:');
    console.log('   ✓ Municipio:', JSON.stringify(familia.municipio));
    console.log('   ✓ Parroquia:', JSON.stringify(familia.parroquia));
    console.log('   ✓ Sector:', JSON.stringify(familia.sector));
    console.log('   ✓ Vereda:', JSON.stringify(familia.vereda));
    console.log('   ✓ Corregimiento:', JSON.stringify(familia.corregimiento));
    console.log('');
    console.log('OTROS CAMPOS:');
    console.log('   ✓ numero_contrato_epm:', familia.numero_contrato_epm);
    console.log('   ✓ comunion_en_casa:', familia.comunion_en_casa);
    console.log('');

    // Verificación de resultados
    let allOk = true;

    if (familia.corregimiento?.id == 1 && familia.corregimiento?.nombre) {
      console.log('✅ Corregimiento: OK');
    } else {
      console.log('❌ Corregimiento: FALLO');
      allOk = false;
    }

    if (familia.numero_contrato_epm === "EPM-123-FULL-TEST") {
      console.log('✅ numero_contrato_epm: OK');
    } else {
      console.log('❌ numero_contrato_epm: FALLO');
      console.log(`   Esperado: "EPM-123-FULL-TEST"`);
      console.log(`   Recibido: "${familia.numero_contrato_epm}"`);
      allOk = false;
    }

    if (familia.comunion_en_casa === true) {
      console.log('✅ comunion_en_casa: OK');
    } else {
      console.log('❌ comunion_en_casa: FALLO');
      console.log(`   Esperado: true`);
      console.log(`   Recibido: ${familia.comunion_en_casa}`);
      allOk = false;
    }

    console.log('');
    console.log('═'.repeat(80));
    if (allOk) {
      console.log('🎉 ¡TODOS LOS CAMPOS SE GUARDARON Y RETORNARON CORRECTAMENTE!');
    } else {
      console.log('⚠️  ALGUNOS CAMPOS NO FUNCIONARON CORRECTAMENTE');
    }
    console.log('═'.repeat(80));
    console.log('');

    // Limpiar
    console.log('🧹 Limpiando familia de prueba...');
    await axios.delete(`${API_URL}/encuesta/${familiaId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Limpieza completa');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testFullEncuesta();
