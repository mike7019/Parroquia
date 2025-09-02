import { 
  Familias, 
  Persona, 
  Sexo, 
  TipoIdentificacion, 
  Municipios, 
  Sector, 
  Veredas,
  DifuntosFamilia 
} from './src/models/index.js';
import sequelize from './config/sequelize.js';
import FamiliasConsultasService from './src/services/familiasConsultasService.js';

/**
 * Prueba exhaustiva del sistema de encuestas
 * Crea una encuesta con TODOS los campos posibles y luego verifica que TODO se guarde y consulte correctamente
 */
class TestEncuestaCompleta {
  constructor() {
    this.familiasService = new FamiliasConsultasService();
    this.datosCreados = {
      familia: null,
      personas: [],
      difuntos: []
    };
  }

  /**
   * PASO 1: Crear encuesta completa con TODOS los campos
   */
  async crearEncuestaCompleta() {
    console.log('\n🎯 PASO 1: Creando encuesta completa con TODOS los campos...\n');

    const transaction = await sequelize.transaction();
    
    try {
      // 1. Crear familia con TODOS los campos del modelo Familias
      console.log('📝 Creando familia con todos los campos...');
      
      // Obtener referencias válidas para foreign keys
      const municipio = await Municipios.findOne({ order: [['id_municipio', 'ASC']] });
      const sector = await Sector.findOne({ order: [['id_sector', 'ASC']] });
      const vereda = await Veredas.findOne({ order: [['id_vereda', 'ASC']] });
      
      console.log(`  🏛️ Municipio seleccionado: ${municipio?.nombre_municipio} (ID: ${municipio?.id_municipio})`);
      console.log(`  🏢 Sector seleccionado: ${sector?.nombre_sector} (ID: ${sector?.id_sector})`);
      console.log(`  🌿 Vereda seleccionada: ${vereda?.nombre_vereda} (ID: ${vereda?.id_vereda})`);

      const datosFamilia = {
        // Campos obligatorios
        apellido_familiar: 'FAMILIA_PRUEBA_COMPLETA',
        sector: 'SECTOR_PRUEBA_DETALLADO',
        direccion_familia: 'Calle 123 #45-67, Barrio Prueba Completa',
        tamaño_familia: 4,
        tipo_vivienda: 'Casa propia',
        
        // Campos opcionales básicos
        numero_contacto: '+57 300 123 4567',
        telefono: '604 123 4567',
        email: 'familia.prueba.completa@test.com',
        
        // Campos de estado y control
        estado_encuesta: 'completed',
        numero_encuestas: 1,
        fecha_ultima_encuesta: new Date().toISOString().split('T')[0],
        codigo_familia: 'FAM_COMPLETE_2024_001',
        
        // Campos boolean
        tutor_responsable: true,
        comunionEnCasa: true,
        
        // Foreign keys (si están disponibles)
        id_municipio: municipio?.id_municipio || null,
        id_sector: sector?.id_sector || null,
        id_vereda: vereda?.id_vereda || null
      };

      console.log('  📊 Datos de familia:', JSON.stringify(datosFamilia, null, 2));
      
      const familia = await Familias.create(datosFamilia, { transaction });
      this.datosCreados.familia = familia;
      
      console.log(`  ✅ Familia creada con ID: ${familia.id_familia}`);

      // 2. Crear personas con TODOS los campos del modelo Persona
      console.log('\n👥 Creando personas con todos los campos...');
      
      // Obtener referencias para foreign keys
      const sexos = await Sexo.findAll({ limit: 2 });
      const tiposId = await TipoIdentificacion.findAll({ limit: 2 });
      
      console.log(`  👫 Sexos disponibles: ${sexos.map(s => `${s.descripcion} (${s.id_sexo})`).join(', ')}`);
      console.log(`  🆔 Tipos ID disponibles: ${tiposId.map(t => `${t.nombre} (${t.id_tipo_identificacion})`).join(', ')}`);

      const personasPrueba = [
        {
          // Campos obligatorios
          primer_nombre: 'Juan Carlos',
          segundo_nombre: 'Eduardo',
          primer_apellido: 'FAMILIA_PRUEBA',
          segundo_apellido: 'Completa',
          identificacion: `TEST_${Date.now()}_001`,
          telefono: '+57 300 111 2222',
          correo_electronico: `juan.prueba.${Date.now()}@test.com`,
          fecha_nacimiento: '1985-03-15',
          direccion: 'Calle 123 #45-67, Barrio Prueba',
          
          // Campos opcionales
          estudios: 'Universitario completo',
          en_que_eres_lider: 'Líder comunitario, coordinador de eventos religiosos',
          necesidad_enfermo: 'Diabetes tipo 2, requiere medicación especial',
          talla_camisa: 'L',
          talla_pantalon: '32',
          talla_zapato: '42',
          
          // Foreign keys
          id_familia_familias: familia.id_familia,
          id_tipo_identificacion_tipo_identificacion: tiposId[0]?.id_tipo_identificacion || null,
          id_sexo: sexos[0]?.id_sexo || null,
          id_estado_civil_estado_civil: 1, // Asumiendo que existe
          id_profesion: 1, // Asumiendo que existe
          id_familia: familia.id_familia,
          id_parroquia: null // Se puede agregar si hay datos
        },
        {
          primer_nombre: 'María',
          segundo_nombre: 'Isabel',
          primer_apellido: 'FAMILIA_PRUEBA',
          segundo_apellido: 'Completa',
          identificacion: `TEST_${Date.now()}_002`,
          telefono: '+57 300 333 4444',
          correo_electronico: `maria.prueba.${Date.now()}@test.com`,
          fecha_nacimiento: '1988-07-22',
          direccion: 'Calle 123 #45-67, Barrio Prueba',
          estudios: 'Técnico en enfermería',
          en_que_eres_lider: 'Catequista, ministerio de la salud',
          necesidad_enfermo: 'Sin enfermedades conocidas',
          talla_camisa: 'M',
          talla_pantalon: '28',
          talla_zapato: '37',
          id_familia_familias: familia.id_familia,
          id_tipo_identificacion_tipo_identificacion: tiposId[1]?.id_tipo_identificacion || tiposId[0]?.id_tipo_identificacion || null,
          id_sexo: sexos[1]?.id_sexo || sexos[0]?.id_sexo || null,
          id_estado_civil_estado_civil: 1,
          id_profesion: 2,
          id_familia: familia.id_familia,
          id_parroquia: null
        },
        {
          primer_nombre: 'Luis',
          segundo_nombre: 'Alejandro',
          primer_apellido: 'FAMILIA_PRUEBA',
          segundo_apellido: 'Completa',
          identificacion: `TEST_${Date.now()}_003`,
          telefono: '+57 300 555 6666',
          correo_electronico: `luis.prueba.${Date.now()}@test.com`,
          fecha_nacimiento: '2010-12-05',
          direccion: 'Calle 123 #45-67, Barrio Prueba',
          estudios: 'Secundaria en curso',
          en_que_eres_lider: 'Monaguillo, grupo juvenil',
          necesidad_enfermo: 'Alergia a algunos medicamentos',
          talla_camisa: 'S',
          talla_pantalon: '26',
          talla_zapato: '38',
          id_familia_familias: familia.id_familia,
          id_tipo_identificacion_tipo_identificacion: tiposId[0]?.id_tipo_identificacion || null,
          id_sexo: sexos[0]?.id_sexo || null,
          id_estado_civil_estado_civil: 2, // Soltero
          id_profesion: null, // Estudiante
          id_familia: familia.id_familia,
          id_parroquia: null
        }
      ];

      for (let i = 0; i < personasPrueba.length; i++) {
        const personaData = personasPrueba[i];
        console.log(`  👤 Creando persona ${i + 1}: ${personaData.primer_nombre} ${personaData.primer_apellido}`);
        console.log(`    📊 Datos:`, JSON.stringify(personaData, null, 4));
        
        const persona = await Persona.create(personaData, { transaction });
        this.datosCreados.personas.push(persona);
        
        console.log(`    ✅ Persona creada con ID: ${persona.id_personas}`);
      }

      // 3. Crear difuntos si la tabla existe
      console.log('\n⚰️ Creando registros de difuntos...');
      
      try {
        const difuntosPrueba = [
          {
            id_familia_familias: familia.id_familia,
            nombre_completo: 'Pedro Antonio FAMILIA_PRUEBA Completa',
            fecha_fallecimiento: '2020-05-10',
            observaciones: 'Fallecimiento por causas naturales, edad avanzada'
          },
          {
            id_familia_familias: familia.id_familia,
            nombre_completo: 'Rosa María FAMILIA_PRUEBA Completa',
            fecha_fallecimiento: '2019-11-23',
            observaciones: 'Enfermedad prolongada, falleció en casa'
          }
        ];

        for (let i = 0; i < difuntosPrueba.length; i++) {
          const difuntoData = difuntosPrueba[i];
          console.log(`  ⚰️ Creando difunto ${i + 1}: ${difuntoData.nombre_completo}`);
          
          const difunto = await DifuntosFamilia.create(difuntoData, { transaction });
          this.datosCreados.difuntos.push(difunto);
          
          console.log(`    ✅ Difunto creado con ID: ${difunto.id_difunto}`);
        }
      } catch (error) {
        console.log(`    ⚠️ No se pudieron crear difuntos: ${error.message}`);
      }

      await transaction.commit();
      console.log('\n🎉 ¡Encuesta completa creada exitosamente!');
      
      return {
        familia: this.datosCreados.familia,
        personas: this.datosCreados.personas,
        difuntos: this.datosCreados.difuntos
      };

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error creando encuesta completa:', error);
      throw error;
    }
  }

  /**
   * PASO 2: Consultar la encuesta y verificar que TODO esté presente
   */
  async consultarYValidarEncuesta() {
    console.log('\n🔍 PASO 2: Consultando encuesta creada y validando campos...\n');

    try {
      // Usar el servicio de consultas para obtener la información completa
      const filtros = {
        apellido_familiar: 'FAMILIA_PRUEBA_COMPLETA',
        limite: 1
      };

      console.log('📋 Consultando familias con filtros:', filtros);
      
      const resultado = await this.familiasService.consultarFamiliasCompletas(filtros);
      
      if (!resultado.exito || !resultado.datos || resultado.datos.length === 0) {
        throw new Error('❌ No se encontró la familia creada en la consulta');
      }

      const familiaConsultada = resultado.datos[0];
      console.log('✅ Familia encontrada en consulta');
      
      return this.validarTodosLosCampos(familiaConsultada);

    } catch (error) {
      console.error('❌ Error consultando encuesta:', error);
      throw error;
    }
  }

  /**
   * PASO 3: Validación exhaustiva de todos los campos
   */
  validarTodosLosCampos(familiaConsultada) {
    console.log('\n📊 PASO 3: Validación exhaustiva de TODOS los campos...\n');

    const validaciones = [];
    const errores = [];

    // 1. Validar estructura principal
    console.log('🏗️ Validando estructura principal...');
    const estructuraEsperada = ['id_encuesta', 'informacionGeneral', 'vivienda', 'servicios_agua', 'observaciones', 'familyMembers', 'deceasedMembers', 'metadata'];
    
    estructuraEsperada.forEach(campo => {
      const presente = campo in familiaConsultada;
      console.log(`  ${presente ? '✅' : '❌'} ${campo}: ${presente ? 'PRESENTE' : 'FALTANTE'}`);
      if (presente) {
        validaciones.push(`Estructura.${campo}`);
      } else {
        errores.push(`Estructura.${campo} FALTANTE`);
      }
    });

    // 2. Validar informacionGeneral
    console.log('\n📋 Validando informaciónGeneral...');
    const infoGeneral = familiaConsultada.informacionGeneral || {};
    
    const camposInfoGeneral = [
      'municipio', 'parroquia', 'sector', 'vereda', 'fecha', 
      'apellido_familiar', 'direccion', 'telefono', 'numero_contrato_epm', 'comunionEnCasa'
    ];

    camposInfoGeneral.forEach(campo => {
      const presente = campo in infoGeneral;
      const valor = infoGeneral[campo];
      console.log(`  ${presente ? '✅' : '❌'} ${campo}: ${presente ? (valor !== null ? JSON.stringify(valor) : 'NULL') : 'FALTANTE'}`);
      if (presente) {
        validaciones.push(`InfoGeneral.${campo}`);
      } else {
        errores.push(`InfoGeneral.${campo} FALTANTE`);
      }
    });

    // 3. Validar vivienda
    console.log('\n🏠 Validando vivienda...');
    const vivienda = familiaConsultada.vivienda || {};
    
    const camposVivienda = ['tipo_vivienda', 'disposicion_basuras'];
    
    camposVivienda.forEach(campo => {
      const presente = campo in vivienda;
      const valor = vivienda[campo];
      console.log(`  ${presente ? '✅' : '❌'} ${campo}: ${presente ? JSON.stringify(valor) : 'FALTANTE'}`);
      if (presente) {
        validaciones.push(`Vivienda.${campo}`);
      } else {
        errores.push(`Vivienda.${campo} FALTANTE`);
      }
    });

    // 4. Validar servicios_agua
    console.log('\n💧 Validando servicios_agua...');
    const serviciosAgua = familiaConsultada.servicios_agua || {};
    
    console.log(`  📊 Contenido servicios_agua:`, JSON.stringify(serviciosAgua, null, 2));
    validaciones.push('ServiciosAgua.presente');

    // 5. Validar familyMembers
    console.log('\n👥 Validando familyMembers...');
    const familyMembers = familiaConsultada.familyMembers || [];
    console.log(`  👥 Cantidad de miembros: ${familyMembers.length}`);
    
    if (familyMembers.length === 3) { // Esperamos 3 personas
      console.log('  ✅ Cantidad correcta de miembros');
      validaciones.push('FamilyMembers.cantidad');
      
      // Validar campos de cada miembro
      const camposMiembro = [
        'nombres', 'numeroIdentificacion', 'tipoIdentificacion', 'fechaNacimiento', 
        'sexo', 'telefono', 'situacionCivil', 'estudio', 'talla_camisa/blusa', 
        'talla_pantalon', 'talla_zapato', 'motivoFechaCelebrar'
      ];
      
      familyMembers.forEach((miembro, index) => {
        console.log(`\n    👤 Miembro ${index + 1}: ${miembro.nombres || 'Sin nombre'}`);
        camposMiembro.forEach(campo => {
          const presente = campo in miembro;
          const valor = miembro[campo];
          console.log(`      ${presente ? '✅' : '❌'} ${campo}: ${presente ? JSON.stringify(valor) : 'FALTANTE'}`);
          if (presente) {
            validaciones.push(`FamilyMember${index + 1}.${campo}`);
          } else {
            errores.push(`FamilyMember${index + 1}.${campo} FALTANTE`);
          }
        });
      });
    } else {
      console.log(`  ❌ Cantidad incorrecta de miembros: esperados 3, encontrados ${familyMembers.length}`);
      errores.push(`FamilyMembers.cantidad: esperados 3, encontrados ${familyMembers.length}`);
    }

    // 6. Validar deceasedMembers
    console.log('\n⚰️ Validando deceasedMembers...');
    const deceasedMembers = familiaConsultada.deceasedMembers || [];
    console.log(`  ⚰️ Cantidad de difuntos: ${deceasedMembers.length}`);
    
    if (deceasedMembers.length === 2) { // Esperamos 2 difuntos
      console.log('  ✅ Cantidad correcta de difuntos');
      validaciones.push('DeceasedMembers.cantidad');
      
      const camposDifunto = ['nombres', 'fechaFallecimiento', 'sexo', 'causaFallecimiento'];
      
      deceasedMembers.forEach((difunto, index) => {
        console.log(`\n    ⚰️ Difunto ${index + 1}: ${difunto.nombres || 'Sin nombre'}`);
        camposDifunto.forEach(campo => {
          const presente = campo in difunto;
          const valor = difunto[campo];
          console.log(`      ${presente ? '✅' : '❌'} ${campo}: ${presente ? JSON.stringify(valor) : 'FALTANTE'}`);
          if (presente) {
            validaciones.push(`DeceasedMember${index + 1}.${campo}`);
          } else {
            errores.push(`DeceasedMember${index + 1}.${campo} FALTANTE`);
          }
        });
      });
    } else {
      console.log(`  ❌ Cantidad incorrecta de difuntos: esperados 2, encontrados ${deceasedMembers.length}`);
      errores.push(`DeceasedMembers.cantidad: esperados 2, encontrados ${deceasedMembers.length}`);
    }

    // 7. Validar metadata
    console.log('\n📊 Validando metadata...');
    const metadata = familiaConsultada.metadata || {};
    
    const camposMetadata = ['timestamp', 'completed', 'currentStage', 'total_miembros', 'total_fallecidos', 'version'];
    
    camposMetadata.forEach(campo => {
      const presente = campo in metadata;
      const valor = metadata[campo];
      console.log(`  ${presente ? '✅' : '❌'} ${campo}: ${presente ? JSON.stringify(valor) : 'FALTANTE'}`);
      if (presente) {
        validaciones.push(`Metadata.${campo}`);
      } else {
        errores.push(`Metadata.${campo} FALTANTE`);
      }
    });

    // 8. Resumen final
    console.log('\n📊 RESUMEN DE VALIDACIÓN');
    console.log('=========================================');
    console.log(`✅ Validaciones exitosas: ${validaciones.length}`);
    console.log(`❌ Errores encontrados: ${errores.length}`);
    console.log(`📈 Porcentaje de éxito: ${((validaciones.length / (validaciones.length + errores.length)) * 100).toFixed(2)}%`);

    if (errores.length > 0) {
      console.log('\n❌ ERRORES DETALLADOS:');
      errores.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    if (validaciones.length > 0) {
      console.log('\n✅ VALIDACIONES EXITOSAS:');
      console.log(`  Total de campos validados correctamente: ${validaciones.length}`);
    }

    return {
      exito: errores.length === 0,
      validaciones_exitosas: validaciones.length,
      errores_encontrados: errores.length,
      porcentaje_exito: ((validaciones.length / (validaciones.length + errores.length)) * 100).toFixed(2),
      detalles_errores: errores,
      detalles_validaciones: validaciones
    };
  }

  /**
   * PASO 4: Limpiar datos de prueba
   */
  async limpiarDatosPrueba() {
    console.log('\n🧹 PASO 4: Limpiando datos de prueba...\n');

    const transaction = await sequelize.transaction();
    
    try {
      // Eliminar personas
      if (this.datosCreados.personas.length > 0) {
        console.log('🗑️ Eliminando personas de prueba...');
        for (const persona of this.datosCreados.personas) {
          await Persona.destroy({
            where: { id_personas: persona.id_personas },
            transaction
          });
          console.log(`  ✅ Persona eliminada: ${persona.primer_nombre} ${persona.primer_apellido} (ID: ${persona.id_personas})`);
        }
      }

      // Eliminar difuntos
      if (this.datosCreados.difuntos.length > 0) {
        console.log('🗑️ Eliminando difuntos de prueba...');
        for (const difunto of this.datosCreados.difuntos) {
          await DifuntosFamilia.destroy({
            where: { id_difunto: difunto.id_difunto },
            transaction
          });
          console.log(`  ✅ Difunto eliminado: ${difunto.nombre_completo} (ID: ${difunto.id_difunto})`);
        }
      }

      // Eliminar familia
      if (this.datosCreados.familia) {
        console.log('🗑️ Eliminando familia de prueba...');
        await Familias.destroy({
          where: { id_familia: this.datosCreados.familia.id_familia },
          transaction
        });
        console.log(`  ✅ Familia eliminada: ${this.datosCreados.familia.apellido_familiar} (ID: ${this.datosCreados.familia.id_familia})`);
      }

      await transaction.commit();
      console.log('\n🎉 ¡Limpieza completada exitosamente!');

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error limpiando datos de prueba:', error);
      throw error;
    }
  }

  /**
   * Ejecutar prueba completa
   */
  async ejecutarPruebaCompleta() {
    console.log('🚀 INICIANDO PRUEBA COMPLETA DE ENCUESTAS');
    console.log('==========================================\n');

    try {
      // Conectar modelos
      await sequelize.authenticate();
      console.log('✅ Conexión a base de datos establecida\n');

      // Paso 1: Crear encuesta completa
      const datosCreados = await this.crearEncuestaCompleta();

      // Paso 2: Consultar y validar
      const resultadoValidacion = await this.consultarYValidarEncuesta();

      // Paso 3: Mostrar resultado final
      console.log('\n🎯 RESULTADO FINAL DE LA PRUEBA');
      console.log('================================');
      console.log(`🏆 Éxito general: ${resultadoValidacion.exito ? 'SÍ' : 'NO'}`);
      console.log(`📊 Campos validados: ${resultadoValidacion.validaciones_exitosas}`);
      console.log(`❌ Errores encontrados: ${resultadoValidacion.errores_encontrados}`);
      console.log(`📈 Porcentaje de éxito: ${resultadoValidacion.porcentaje_exito}%`);

      // Paso 4: Limpiar datos de prueba
      await this.limpiarDatosPrueba();

      return resultadoValidacion;

    } catch (error) {
      console.error('\n💥 ERROR FATAL EN LA PRUEBA:', error);
      
      // Intentar limpiar en caso de error
      try {
        await this.limpiarDatosPrueba();
      } catch (cleanupError) {
        console.error('❌ Error adicional durante limpieza:', cleanupError.message);
      }
      
      throw error;
    } finally {
      await sequelize.close();
      console.log('\n🔒 Conexión a base de datos cerrada');
    }
  }
}

// Ejecutar la prueba
const test = new TestEncuestaCompleta();
test.ejecutarPruebaCompleta()
  .then(resultado => {
    if (resultado.exito) {
      console.log('\n🎉 ¡PRUEBA COMPLETADA EXITOSAMENTE!');
      console.log('Todos los campos se crearon y consultaron correctamente.');
    } else {
      console.log('\n⚠️ PRUEBA COMPLETADA CON ERRORES');
      console.log('Algunos campos no se encontraron en la consulta.');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 PRUEBA FALLÓ:', error.message);
    process.exit(1);
  });
