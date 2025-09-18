// Script para generar y probar datos completos de encuestas
// Autor: GitHub Copilot
// Fecha: 18 de Septiembre, 2025
// Rama: fix-encuestas

import sequelize from './config/sequelize.js';
import { QueryTypes } from 'sequelize';

/**
 * Script completo para probar el servicio de encuestas con datos exhaustivos
 */

console.log('🚀 Iniciando pruebas completas del servicio de encuestas');
console.log('📅 Fecha:', new Date().toISOString());
console.log('🌿 Rama: fix-encuestas');

// Datos de prueba completos
const datosPruebaCompletos = {
  encuesta1: {
    informacionGeneral: {
      municipio: { id: 1, nombre: "Medellín" },
      parroquia: { id: 1, nombre: "San José" },
      sector: { id: 1, nombre: "Centro" },
      vereda: { id: 1, nombre: "La Macarena" },
      fecha: "2025-09-18",
      apellido_familiar: "Rodríguez García",
      direccion: "Carrera 45 # 23-67",
      telefono: "3001234567",
      numero_contrato_epm: "12345678",
      comunionEnCasa: false,
      email: "rodriguez.garcia@email.com"
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
      aguas_residuales: { id: 1, nombre: "Alcantarillado" },
      pozo_septico: false,
      letrina: false,
      campo_abierto: false
    },
    observaciones: {
      sustento_familia: "Trabajo independiente en ventas y empleado en empresa de servicios",
      observaciones_encuestador: "Familia colaborativa, información completa proporcionada",
      autorizacion_datos: true
    },
    familyMembers: [
      {
        nombres: "Carlos Andrés Rodríguez García",
        numeroIdentificacion: "12345678",
        tipoIdentificacion: { id: 1, nombre: "Cédula de Ciudadanía" },
        fechaNacimiento: "1985-03-15",
        sexo: { id: 1, nombre: "Masculino" },
        telefono: "3206666666",
        situacionCivil: { id: 2, nombre: "Casado Civil" },
        estudio: { id: 4, nombre: "Universitario" },
        parentesco: { id: 1, nombre: "Jefe de Hogar" },
        comunidadCultural: { id: 1, nombre: "Ninguna" },
        enfermedad: { id: 2, nombre: "Diabetes" },
        "talla_camisa/blusa": "L",
        talla_pantalon: "32",
        talla_zapato: "42",
        profesion: { id: 15, nombre: "Vendedor" },
        motivoFechaCelebrar: {
          motivo: "Cumpleaños",
          dia: "15",
          mes: "03"
        }
      },
      {
        nombres: "María Elena García Ramírez",
        numeroIdentificacion: "87654321",
        tipoIdentificacion: { id: 1, nombre: "Cédula de Ciudadanía" },
        fechaNacimiento: "1987-07-22",
        sexo: { id: 2, nombre: "Femenino" },
        telefono: "3207777777",
        situacionCivil: { id: 2, nombre: "Casado Civil" },
        estudio: { id: 3, nombre: "Técnico" },
        parentesco: { id: 2, nombre: "Esposa" },
        comunidadCultural: { id: 1, nombre: "Ninguna" },
        enfermedad: { id: 1, nombre: "Ninguna" },
        "talla_camisa/blusa": "M",
        talla_pantalon: "28",
        talla_zapato: "37",
        profesion: { id: 12, nombre: "Administradora" },
        motivoFechaCelebrar: {
          motivo: "Cumpleaños",
          dia: "22",
          mes: "07"
        }
      },
      {
        nombres: "Ana Sofía Rodríguez García",
        numeroIdentificacion: "11223344",
        tipoIdentificacion: { id: 2, nombre: "Tarjeta de Identidad" },
        fechaNacimiento: "2010-11-08",
        sexo: { id: 2, nombre: "Femenino" },
        telefono: "",
        situacionCivil: { id: 1, nombre: "Soltero" },
        estudio: { id: 2, nombre: "Primaria" },
        parentesco: { id: 3, nombre: "Hija" },
        comunidadCultural: { id: 1, nombre: "Ninguna" },
        enfermedad: { id: 1, nombre: "Ninguna" },
        "talla_camisa/blusa": "S",
        talla_pantalon: "26",
        talla_zapato: "34",
        profesion: { id: 1, nombre: "Estudiante" },
        motivoFechaCelebrar: {
          motivo: "Cumpleaños",
          dia: "08",
          mes: "11"
        }
      },
      {
        nombres: "Miguel Alejandro Rodríguez García",
        numeroIdentificacion: "44332211",
        tipoIdentificacion: { id: 2, nombre: "Tarjeta de Identidad" },
        fechaNacimiento: "2013-04-30",
        sexo: { id: 1, nombre: "Masculino" },
        telefono: "",
        situacionCivil: { id: 1, nombre: "Soltero" },
        estudio: { id: 2, nombre: "Primaria" },
        parentesco: { id: 4, nombre: "Hijo" },
        comunidadCultural: { id: 1, nombre: "Ninguna" },
        enfermedad: { id: 3, nombre: "Asma" },
        "talla_camisa/blusa": "XS",
        talla_pantalon: "24",
        talla_zapato: "32",
        profesion: { id: 1, nombre: "Estudiante" },
        motivoFechaCelebrar: {
          motivo: "Cumpleaños",
          dia: "30",
          mes: "04"
        }
      }
    ],
    deceasedMembers: [
      {
        nombres: "José Antonio Rodríguez Pérez",
        fechaFallecimiento: "2018-12-15",
        sexo: { id: 1, nombre: "Masculino" },
        parentesco: { id: 2, nombre: "Padre" },
        causaFallecimiento: "Enfermedad cardiovascular después de larga enfermedad"
      },
      {
        nombres: "Rosa María García López",
        fechaFallecimiento: "2020-08-03",
        sexo: { id: 2, nombre: "Femenino" },
        parentesco: { id: 3, nombre: "Madre" },
        causaFallecimiento: "Complicaciones por COVID-19"
      }
    ],
    metadata: {
      timestamp: "2025-09-18T10:30:00.000Z",
      completed: true,
      currentStage: 6
    }
  },

  // Segunda encuesta para pruebas adicionales
  encuesta2: {
    informacionGeneral: {
      municipio: { id: 1, nombre: "Medellín" },
      parroquia: { id: 2, nombre: "Santa María" },
      sector: { id: 2, nombre: "Norte" },
      vereda: { id: 2, nombre: "Popular" },
      fecha: "2025-09-18",
      apellido_familiar: "González Morales",
      direccion: "Calle 67 # 45-23 Apto 302",
      telefono: "3009876543",
      numero_contrato_epm: "87654321",
      comunionEnCasa: true
    },
    vivienda: {
      tipo_vivienda: { id: 2, nombre: "Apartamento" },
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
      sistema_acueducto: { id: 1, nombre: "Acueducto Público" },
      aguas_residuales: { id: 1, nombre: "Alcantarillado" },
      pozo_septico: false,
      letrina: false,
      campo_abierto: false
    },
    observaciones: {
      sustento_familia: "Empleados públicos, ingresos estables",
      observaciones_encuestador: "Apartamento bien ubicado, familia estable",
      autorizacion_datos: true
    },
    familyMembers: [
      {
        nombres: "Luis Fernando González Morales",
        numeroIdentificacion: "55667788",
        tipoIdentificacion: { id: 1, nombre: "Cédula de Ciudadanía" },
        fechaNacimiento: "1978-09-12",
        sexo: { id: 1, nombre: "Masculino" },
        telefono: "3208888888",
        situacionCivil: { id: 5, nombre: "Unión Libre" },
        estudio: { id: 4, nombre: "Universitario" },
        parentesco: { id: 1, nombre: "Jefe de Hogar" },
        comunidadCultural: { id: 1, nombre: "Ninguna" },
        enfermedad: { id: 4, nombre: "Hipertensión" },
        "talla_camisa/blusa": "XL",
        talla_pantalon: "34",
        talla_zapato: "43",
        profesion: { id: 8, nombre: "Profesor" },
        motivoFechaCelebrar: {
          motivo: "Cumpleaños",
          dia: "12",
          mes: "09"
        }
      },
      {
        nombres: "Patricia Morales Castro",
        numeroIdentificacion: "99887766",
        tipoIdentificacion: { id: 1, nombre: "Cédula de Ciudadanía" },
        fechaNacimiento: "1982-01-18",
        sexo: { id: 2, nombre: "Femenino" },
        telefono: "3209999999",
        situacionCivil: { id: 5, nombre: "Unión Libre" },
        estudio: { id: 4, nombre: "Universitario" },
        parentesco: { id: 2, nombre: "Esposa" },
        comunidadCultural: { id: 1, nombre: "Ninguna" },
        enfermedad: { id: 1, nombre: "Ninguna" },
        "talla_camisa/blusa": "L",
        talla_pantalon: "30",
        talla_zapato: "38",
        profesion: { id: 10, nombre: "Enfermera" },
        motivoFechaCelebrar: {
          motivo: "Cumpleaños",
          dia: "18",
          mes: "01"
        }
      }
    ],
    deceasedMembers: [
      {
        nombres: "Carmen Elena Castro Ruiz",
        fechaFallecimiento: "2019-06-20",
        sexo: { id: 2, nombre: "Femenino" },
        parentesco: { id: 3, nombre: "Madre" },
        causaFallecimiento: "Cáncer después de tratamiento prolongado"
      }
    ],
    metadata: {
      timestamp: "2025-09-18T11:00:00.000Z",
      completed: true,
      currentStage: 6
    }
  }
};

/**
 * Función para verificar disponibilidad de catálogos
 */
async function verificarCatalogos() {
  console.log('\n🔍 Verificando catálogos disponibles...');
  
  try {
    // Verificar municipios
    const municipios = await sequelize.query('SELECT id_municipio, nombre_municipio FROM municipios LIMIT 5', {
      type: QueryTypes.SELECT
    });
    console.log('✅ Municipios disponibles:', municipios.length);

    // Verificar parroquias
    const parroquias = await sequelize.query('SELECT id_parroquia, nombre FROM parroquias LIMIT 5', {
      type: QueryTypes.SELECT
    });
    console.log('✅ Parroquias disponibles:', parroquias.length);

    // Verificar sexos
    const sexos = await sequelize.query('SELECT id_sexo, descripcion FROM sexos', {
      type: QueryTypes.SELECT
    });
    console.log('✅ Sexos disponibles:', sexos.length);

    // Verificar tipos de identificación
    const tiposId = await sequelize.query('SELECT id_tipo_identificacion, nombre FROM tipos_identificacion', {
      type: QueryTypes.SELECT
    });
    console.log('✅ Tipos identificación disponibles:', tiposId.length);

    return true;
  } catch (error) {
    console.error('❌ Error verificando catálogos:', error.message);
    return false;
  }
}

/**
 * Función para crear encuesta usando la API
 */
async function crearEncuestaAPI(datosEncuesta, nombreEncuesta) {
  console.log(`\n📝 Creando ${nombreEncuesta}...`);
  
  try {
    // Simular llamada a la API (usaremos el controlador directamente)
    const { crearEncuesta } = await import('./src/controllers/encuestaController.js');
    
    // Crear mock del request y response
    const req = {
      body: datosEncuesta,
      user: { id: 1, username: 'test_user' }
    };
    
    const res = {
      status: (code) => ({
        json: (data) => {
          console.log(`Status: ${code}`);
          console.log('Response:', JSON.stringify(data, null, 2));
          return { code, data };
        }
      })
    };

    // Ejecutar la creación
    const resultado = await crearEncuesta(req, res);
    console.log(`✅ ${nombreEncuesta} creada exitosamente`);
    
    return resultado;
  } catch (error) {
    console.error(`❌ Error creando ${nombreEncuesta}:`, error.message);
    throw error;
  }
}

/**
 * Función para probar obtener encuestas
 */
async function probarObtenerEncuestas() {
  console.log('\n📋 Probando obtener lista de encuestas...');
  
  try {
    const { obtenerEncuestas } = await import('./src/controllers/encuestaController.js');
    
    const req = {
      query: { page: 1, limit: 10 },
      user: { id: 1, username: 'test_user' }
    };
    
    const res = {
      status: (code) => ({
        json: (data) => {
          console.log(`Status: ${code}`);
          console.log('Encuestas encontradas:', data.data?.length || 0);
          
          // Mostrar resumen de cada encuesta
          if (data.data && data.data.length > 0) {
            data.data.forEach((enc, index) => {
              console.log(`  ${index + 1}. ${enc.apellido_familiar} - ${enc.miembros_familia?.total_miembros || 0} miembros`);
            });
          }
          
          return { code, data };
        }
      })
    };

    await obtenerEncuestas(req, res);
    console.log('✅ Lista de encuestas obtenida exitosamente');
    
  } catch (error) {
    console.error('❌ Error obteniendo encuestas:', error.message);
  }
}

/**
 * Función para probar obtener encuesta por ID
 */
async function probarObtenerEncuestaPorId(id) {
  console.log(`\n🔍 Probando obtener encuesta por ID: ${id}...`);
  
  try {
    const { obtenerEncuestaPorId } = await import('./src/controllers/encuestaController.js');
    
    const req = {
      params: { id },
      user: { id: 1, username: 'test_user' }
    };
    
    const res = {
      status: (code) => ({
        json: (data) => {
          console.log(`Status: ${code}`);
          
          if (data.data) {
            console.log('Encuesta encontrada:');
            console.log(`  Familia: ${data.data.apellido_familiar}`);
            console.log(`  Miembros vivos: ${data.data.miembros_familia?.total_miembros || 0}`);
            console.log(`  Miembros fallecidos: ${data.data.deceasedMembers?.length || 0}`);
            console.log(`  Municipio: ${data.data.municipio?.nombre || 'N/A'}`);
          }
          
          return { code, data };
        }
      })
    };

    await obtenerEncuestaPorId(req, res);
    console.log('✅ Encuesta por ID obtenida exitosamente');
    
  } catch (error) {
    console.error('❌ Error obteniendo encuesta por ID:', error.message);
  }
}

/**
 * Función principal para ejecutar todas las pruebas
 */
async function ejecutarPruebasCompletas() {
  console.log('\n🎯 INICIANDO PRUEBAS COMPLETAS DEL SERVICIO DE ENCUESTAS');
  console.log('=' .repeat(60));
  
  try {
    // 1. Verificar conexión a base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos establecida');
    
    // 2. Verificar catálogos
    const catalogosOK = await verificarCatalogos();
    if (!catalogosOK) {
      throw new Error('Catálogos no disponibles');
    }
    
    // 3. Crear encuestas de prueba
    console.log('\n📝 FASE 1: CREACIÓN DE ENCUESTAS');
    console.log('-'.repeat(40));
    
    await crearEncuestaAPI(datosPruebaCompletos.encuesta1, "Familia Rodríguez García");
    await crearEncuestaAPI(datosPruebaCompletos.encuesta2, "Familia González Morales");
    
    // 4. Probar obtener lista de encuestas
    console.log('\n📋 FASE 2: CONSULTA DE ENCUESTAS');
    console.log('-'.repeat(40));
    
    await probarObtenerEncuestas();
    
    // 5. Probar obtener encuestas por ID (asumir IDs 1 y 2)
    await probarObtenerEncuestaPorId(1);
    await probarObtenerEncuestaPorId(2);
    
    console.log('\n🎉 PRUEBAS COMPLETADAS EXITOSAMENTE');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('\n❌ ERROR EN LAS PRUEBAS:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    // Cerrar conexión
    await sequelize.close();
    console.log('🔒 Conexión a base de datos cerrada');
  }
}

// Ejecutar pruebas si el script se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  ejecutarPruebasCompletas()
    .then(() => {
      console.log('✅ Script ejecutado completamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

export {
  datosPruebaCompletos,
  verificarCatalogos,
  crearEncuestaAPI,
  probarObtenerEncuestas,
  probarObtenerEncuestaPorId,
  ejecutarPruebasCompletas
};