// Script simplificado para probar encuestas paso a paso
// Autor: GitHub Copilot
// Fecha: 18 de Septiembre, 2025
// Rama: fix-encuestas

import fetch from 'node-fetch';
import fs from 'fs';

// Configuración del servidor
const API_BASE = 'http://localhost:3000/api';
const HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer tu_token_aqui' // Reemplazar con token real
};

// Datos de prueba simplificados
const encuestaPrueba = {
  informacionGeneral: {
    municipio: { id: "1", nombre: "Medellín" },
    parroquia: { id: "1", nombre: "San José" },
    sector: { id: "1", nombre: "Centro" },
    vereda: { id: "1", nombre: "La Macarena" },
    fecha: "2025-09-18",
    apellido_familiar: "Test García",
    direccion: "Carrera 45 # 23-67",
    telefono: "3001234567",
    numero_contrato_epm: "12345678",
    comunionEnCasa: false
  },
  vivienda: {
    tipo_vivienda: { id: "1", nombre: "Casa" },
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
    sistema_acueducto: { id: "1", nombre: "Acueducto Público" },
    aguas_residuales: { id: "1", nombre: "Alcantarillado" },
    pozo_septico: false,
    letrina: false,
    campo_abierto: false
  },
  observaciones: {
    sustento_familia: "Trabajo independiente en ventas",
    observaciones_encuestador: "Familia colaborativa, información completa",
    autorizacion_datos: true
  },
  familyMembers: [
    {
      nombres: "Carlos Test García",
      numeroIdentificacion: "12345678",
      tipoIdentificacion: { id: "1", nombre: "Cédula de Ciudadanía" },
      fechaNacimiento: "1985-03-15",
      sexo: { id: "1", nombre: "Masculino" },
      telefono: "3206666666",
      situacionCivil: { id: "2", nombre: "Casado Civil" },
      estudio: { id: "4", nombre: "Universitario" },
      parentesco: { id: "1", nombre: "Jefe de Hogar" },
      comunidadCultural: { id: "1", nombre: "Ninguna" },
      enfermedad: { id: "2", nombre: "Diabetes" },
      "talla_camisa/blusa": "L",
      talla_pantalon: "32",
      talla_zapato: "42",
      profesion: { id: "15", nombre: "Vendedor" },
      motivoFechaCelebrar: {
        motivo: "Cumpleaños",
        dia: "15",
        mes: "03"
      }
    }
  ],
  deceasedMembers: [
    {
      nombres: "Pedro Test García",
      fechaFallecimiento: "2020-05-15",
      sexo: { id: "1", nombre: "Masculino" },
      parentesco: { id: "2", nombre: "Padre" },
      causaFallecimiento: "Enfermedad cardiovascular"
    }
  ],
  metadata: {
    timestamp: "2025-09-18T10:30:00.000Z",
    completed: true,
    currentStage: 6
  }
};

/**
 * Función para hacer request HTTP
 */
async function makeRequest(method, endpoint, data = null) {
  try {
    const options = {
      method,
      headers: HEADERS,
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    console.log(`📡 ${method} ${API_BASE}${endpoint}`);
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    
    const result = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📋 Response:`, JSON.stringify(result, null, 2));
    
    return { status: response.status, data: result };
  } catch (error) {
    console.error(`❌ Error en ${method} ${endpoint}:`, error.message);
    return { status: 500, error: error.message };
  }
}

/**
 * Función principal de pruebas
 */
async function ejecutarPruebas() {
  console.log('🎯 INICIANDO PRUEBAS PASO A PASO DEL SERVICIO DE ENCUESTAS');
  console.log('=' .repeat(60));
  console.log('📅 Fecha:', new Date().toISOString());
  console.log('🌿 Rama: fix-encuestas');
  console.log('');
  
  // Guardar datos de prueba en archivo JSON
  console.log('💾 Guardando datos de prueba en archivo...');
  fs.writeFileSync('encuesta-prueba-completa.json', JSON.stringify(encuestaPrueba, null, 2));
  console.log('✅ Archivo guardado: encuesta-prueba-completa.json');
  console.log('');
  
  // Mostrar resumen de los datos
  console.log('📋 RESUMEN DE DATOS DE PRUEBA:');
  console.log('-'.repeat(40));
  console.log(`Familia: ${encuestaPrueba.informacionGeneral.apellido_familiar}`);
  console.log(`Dirección: ${encuestaPrueba.informacionGeneral.direccion}`);
  console.log(`Miembros vivos: ${encuestaPrueba.familyMembers.length}`);
  console.log(`Miembros fallecidos: ${encuestaPrueba.deceasedMembers.length}`);
  console.log(`Tipo vivienda: ${encuestaPrueba.vivienda.tipo_vivienda.nombre}`);
  console.log(`Municipio: ${encuestaPrueba.informacionGeneral.municipio.nombre}`);
  console.log('');
  
  console.log('🔍 DATOS DETALLADOS DE MIEMBROS:');
  console.log('-'.repeat(40));
  encuestaPrueba.familyMembers.forEach((miembro, index) => {
    console.log(`${index + 1}. ${miembro.nombres} (${miembro.sexo.nombre})`);
    console.log(`   ID: ${miembro.numeroIdentificacion}`);
    console.log(`   Fecha nac: ${miembro.fechaNacimiento}`);
    console.log(`   Estudios: ${miembro.estudio.nombre}`);
    console.log(`   Profesión: ${miembro.profesion.nombre}`);
  });
  
  console.log('');
  console.log('⚰️ MIEMBROS FALLECIDOS:');
  console.log('-'.repeat(40));
  encuestaPrueba.deceasedMembers.forEach((fallecido, index) => {
    console.log(`${index + 1}. ${fallecido.nombres} (${fallecido.sexo.nombre})`);
    console.log(`   Parentesco: ${fallecido.parentesco.nombre}`);
    console.log(`   Fecha fallecimiento: ${fallecido.fechaFallecimiento}`);
    console.log(`   Causa: ${fallecido.causaFallecimiento}`);
  });
  
  console.log('');
  console.log('🏠 INFORMACIÓN DE VIVIENDA:');
  console.log('-'.repeat(40));
  console.log(`Tipo: ${encuestaPrueba.vivienda.tipo_vivienda.nombre}`);
  console.log('Disposición basuras:');
  Object.entries(encuestaPrueba.vivienda.disposicion_basuras).forEach(([tipo, activo]) => {
    if (activo) console.log(`  ✅ ${tipo}`);
  });
  
  console.log('');
  console.log('💧 SERVICIOS DE AGUA:');
  console.log('-'.repeat(40));
  console.log(`Acueducto: ${encuestaPrueba.servicios_agua.sistema_acueducto.nombre}`);
  console.log(`Aguas residuales: ${encuestaPrueba.servicios_agua.aguas_residuales.nombre}`);
  
  console.log('');
  console.log('📝 OBSERVACIONES:');
  console.log('-'.repeat(40));
  console.log(`Sustento: ${encuestaPrueba.observaciones.sustento_familia}`);
  console.log(`Encuestador: ${encuestaPrueba.observaciones.observaciones_encuestador}`);
  console.log(`Autorización datos: ${encuestaPrueba.observaciones.autorizacion_datos ? '✅' : '❌'}`);
  
  console.log('');
  console.log('✅ PREPARACIÓN COMPLETADA - DATOS LISTOS PARA PRUEBAS');
  console.log('');
  console.log('📋 PRÓXIMOS PASOS MANUALES:');
  console.log('1. Iniciar el servidor con: npm run dev');
  console.log('2. Obtener token de autenticación');
  console.log('3. Usar los datos del archivo encuesta-prueba-completa.json');
  console.log('4. Probar endpoints con Postman o curl');
  console.log('');
  console.log('🔗 ENDPOINTS PARA PROBAR:');
  console.log('GET    /api/encuesta           - Listar encuestas');
  console.log('POST   /api/encuesta           - Crear encuesta');
  console.log('GET    /api/encuesta/:id       - Obtener por ID');
  console.log('DELETE /api/encuesta/:id       - Eliminar encuesta');
  console.log('');
}

// Ejecutar
ejecutarPruebas()
  .then(() => {
    console.log('✅ Preparación de pruebas completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });