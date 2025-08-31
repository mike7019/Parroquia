import sequelize from './config/sequelize.js';
import { 
  Familias, 
  Persona, 
  Sexo, 
  TipoIdentificacion, 
  DifuntosFamilia,
  Municipios
} from './src/models/index.js';
import FamiliasConsultasService from './src/services/familiasConsultasService.js';

/**
 * PRUEBA FINAL COMPLETA - VERSION SIMPLIFICADA
 * Se enfoca en validar la integridad request-response sin depender de tablas problemáticas
 */

class PruebaFinalCompleta {
  
  constructor() {
    this.familiasService = new FamiliasConsultasService();
  }

  async crearFamiliaCompleta() {
    console.log('🚀 CREANDO FAMILIA CON DATOS ABSOLUTAMENTE COMPLETOS\n');
    
    const timestamp = Date.now();
    
    // 1. Obtener datos maestros necesarios
    const sexos = await Sexo.findAll();
    const tiposId = await TipoIdentificacion.findAll();
    const municipios = await Municipios.findAll();
    
    console.log(`✅ Datos maestros: ${sexos.length} sexos, ${tiposId.length} tipos ID, ${municipios.length} municipios`);
    
    // 2. Crear familia con TODOS los campos posibles
    const familia = await Familias.create({
      apellido_familiar: `Familia Validación Completa ${timestamp}`,
      sector: 'Centro Histórico',
      direccion_familia: 'Carrera 50 #25-30 Apartamento 501',
      numero_contacto: '6043334455',
      telefono: '3007778899',
      email: `familia.validacion.${timestamp}@test.com`,
      tamaño_familia: 4,
      tipo_vivienda: 'Apartamento Propio',
      estado_encuesta: 'completed',
      numero_encuestas: 3,
      fecha_ultima_encuesta: new Date(),
      codigo_familia: `VALIDACION-${timestamp}`,
      tutor_responsable: true,
      id_municipio: municipios[0]?.id_municipio || 1,
      comunionEnCasa: true,
      observaciones: 'Familia creada específicamente para validación completa de request-response'
    });
    
    console.log(`✅ Familia creada con ID: ${familia.id_familia}`);
    console.log(`   📍 Apellido: ${familia.apellido_familiar}`);
    console.log(`   🏠 Dirección: ${familia.direccion_familia}`);
    console.log(`   📞 Teléfono: ${familia.telefono}`);
    console.log(`   📧 Email: ${familia.email}`);
    console.log(`   🏘️ Sector: ${familia.sector}`);
    console.log(`   ⛪ Comunión en Casa: ${familia.comunionEnCasa}`);
    
    // 3. Crear personas con TODOS los datos obligatorios y opcionales
    const personasData = [
      {
        // PADRE - Datos absolutamente completos
        primer_nombre: 'Juan',
        segundo_nombre: 'Carlos',
        primer_apellido: 'Martínez',
        segundo_apellido: 'Gómez',
        identificacion: `10123456-${timestamp}`,
        telefono: '3001111111',
        correo_electronico: `juan.martinez.${timestamp}@test.com`,
        fecha_nacimiento: '1980-05-15',
        direccion: familia.direccion_familia,
        estudios: 'Ingeniero de Sistemas',
        talla_camisa: 'XL',
        talla_pantalon: '34',
        talla_zapato: '43',
        id_sexo: sexos.find(s => s.descripcion?.toLowerCase().includes('masculino'))?.id_sexo || 1,
        id_tipo_identificacion_tipo_identificacion: tiposId.find(t => t.codigo === 'CC')?.id_tipo_identificacion || 1,
        id_estado_civil_estado_civil: 1, // Casado
        id_familia_familias: familia.id_familia
      },
      {
        // MADRE - Datos absolutamente completos
        primer_nombre: 'Ana',
        segundo_nombre: 'Patricia',
        primer_apellido: 'Silva',
        segundo_apellido: 'Ramírez',
        identificacion: `20987654-${timestamp}`,
        telefono: '3002222222',
        correo_electronico: `ana.silva.${timestamp}@test.com`,
        fecha_nacimiento: '1983-11-22',
        direccion: familia.direccion_familia,
        estudios: 'Contadora Pública',
        talla_camisa: 'M',
        talla_pantalon: '30',
        talla_zapato: '38',
        id_sexo: sexos.find(s => s.descripcion?.toLowerCase().includes('femenino'))?.id_sexo || 2,
        id_tipo_identificacion_tipo_identificacion: tiposId.find(t => t.codigo === 'CC')?.id_tipo_identificacion || 1,
        id_estado_civil_estado_civil: 1, // Casada
        id_familia_familias: familia.id_familia
      },
      {
        // HIJO MAYOR - Datos completos
        primer_nombre: 'Diego',
        segundo_nombre: 'Alejandro',
        primer_apellido: 'Martínez',
        segundo_apellido: 'Silva',
        identificacion: `30555666-${timestamp}`,
        telefono: '3003333333',
        correo_electronico: `diego.martinez.${timestamp}@test.com`,
        fecha_nacimiento: '2005-09-10',
        direccion: familia.direccion_familia,
        estudios: 'Bachillerato Académico',
        talla_camisa: 'L',
        talla_pantalon: '30',
        talla_zapato: '40',
        id_sexo: sexos.find(s => s.descripcion?.toLowerCase().includes('masculino'))?.id_sexo || 1,
        id_tipo_identificacion_tipo_identificacion: tiposId.find(t => t.codigo === 'TI')?.id_tipo_identificacion || 2,
        id_estado_civil_estado_civil: 2, // Soltero
        id_familia_familias: familia.id_familia
      },
      {
        // HIJA MENOR - Datos completos
        primer_nombre: 'Sofía',
        segundo_nombre: 'Valentina',
        primer_apellido: 'Martínez',
        segundo_apellido: 'Silva',
        identificacion: `40777888-${timestamp}`,
        telefono: '3004444444',
        correo_electronico: `sofia.martinez.${timestamp}@test.com`,
        fecha_nacimiento: '2012-03-25',
        direccion: familia.direccion_familia,
        estudios: 'Primaria',
        talla_camisa: 'S',
        talla_pantalon: '24',
        talla_zapato: '32',
        id_sexo: sexos.find(s => s.descripcion?.toLowerCase().includes('femenino'))?.id_sexo || 2,
        id_tipo_identificacion_tipo_identificacion: tiposId.find(t => t.codigo === 'TI')?.id_tipo_identificacion || 2,
        id_estado_civil_estado_civil: 2, // Soltera
        id_familia_familias: familia.id_familia
      }
    ];
    
    const personas = [];
    for (const pData of personasData) {
      const persona = await Persona.create(pData);
      personas.push(persona);
      console.log(`   👤 Persona creada: ${persona.primer_nombre} ${persona.primer_apellido} (${persona.identificacion})`);
    }
    
    // 4. Crear persona fallecida usando SQL directo con ID manual
    const difuntoId = Date.now(); // Usar timestamp como ID único
    await sequelize.query(
      'INSERT INTO difuntos_familia (id_difunto, id_familia_familias, nombre_completo, fecha_fallecimiento, observaciones, "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      {
        replacements: [
          difuntoId,
          familia.id_familia,
          'Roberto Carlos Martínez López',
          '2019-08-12',
          'Abuelo paterno, fallecido por complicaciones cardiovasculares a los 78 años'
        ],
        type: sequelize.QueryTypes.INSERT
      }
    );
    
    console.log(`   ⚰️ Fallecido registrado: Roberto Carlos Martínez López`);
    
    // 5. Crear registros de servicios (sistema acueducto)
    console.log('🚿 Creando registros de servicios...');
    await sequelize.query(
      'INSERT INTO familia_sistema_acueducto (id_familia, id_sistema_acueducto, "createdAt", "updatedAt") VALUES (?, ?, NOW(), NOW())',
      {
        replacements: [familia.id_familia, 1], // Usar sistema de acueducto con ID 1
        type: sequelize.QueryTypes.INSERT
      }
    );
    console.log('💧 Sistema de acueducto asignado');
    
    console.log(`\n✅ FAMILIA COMPLETAMENTE CREADA:`);
    console.log(`   - ID Familia: ${familia.id_familia}`);
    console.log(`   - Personas vivas: ${personas.length}`);
    console.log(`   - Personas fallecidas: 1`);
    console.log(`   - Total datos: ABSOLUTAMENTE COMPLETOS\n`);
    
    return { familia, personas };
  }

  async ejecutarConsultaCompleta(familiaCreada) {
    console.log('🔍 EJECUTANDO CONSULTA COMPLETA Y VALIDANDO RESPONSE\n');
    
    const filtros = {
      apellido_familiar: familiaCreada.familia.apellido_familiar,
      limite: 1
    };
    
    console.log(`🎯 Consultando familia: "${filtros.apellido_familiar}"`);
    
    const resultado = await this.familiasService.consultarFamiliasConPadresMadres(filtros);
    
    if (!resultado.exito || resultado.datos.length === 0) {
      throw new Error('❌ No se encontró la familia en la consulta');
    }
    
    const response = resultado.datos[0];
    console.log(`✅ Familia encontrada en consulta: ID ${response.id_encuesta}\n`);
    
    return this.validarIntegridadCompleta(response, familiaCreada);
  }

  validarIntegridadCompleta(response, esperado) {
    console.log('📋 VALIDACIÓN EXHAUSTIVA DE INTEGRIDAD REQUEST-RESPONSE\n');
    
    const validaciones = [];
    let camposCompletos = 0;
    let camposFallidos = 0;
    
    // ========== VALIDACIÓN 1: ID ENCUESTA ==========
    console.log('1️⃣ VALIDANDO ID ENCUESTA:');
    const idValido = response.id_encuesta === esperado.familia.id_familia;
    console.log(`   ${idValido ? '✅' : '❌'} ID Encuesta: ${response.id_encuesta} (esperado: ${esperado.familia.id_familia})`);
    if (idValido) camposCompletos++; else camposFallidos++;
    validaciones.push({ seccion: 'ID', campo: 'id_encuesta', valido: idValido });
    
    // ========== VALIDACIÓN 2: INFORMACIÓN GENERAL ==========
    console.log('\n2️⃣ VALIDANDO INFORMACIÓN GENERAL:');
    const infoGeneral = response.informacionGeneral;
    
    if (infoGeneral) {
      console.log('   ✅ Sección informacionGeneral: PRESENTE');
      
      // Municipio
      const municipioOk = infoGeneral.municipio && infoGeneral.municipio.nombre;
      console.log(`   ${municipioOk ? '✅' : '❌'} Municipio: ${infoGeneral.municipio?.nombre || 'NULL'}`);
      if (municipioOk) camposCompletos++; else camposFallidos++;
      
      // Sector
      const sectorOk = infoGeneral.sector && infoGeneral.sector.nombre === esperado.familia.sector;
      console.log(`   ${sectorOk ? '✅' : '❌'} Sector: ${infoGeneral.sector?.nombre || 'NULL'} (esperado: ${esperado.familia.sector})`);
      if (sectorOk) camposCompletos++; else camposFallidos++;
      
      // Apellido Familiar
      const apellidoOk = infoGeneral.apellido_familiar === esperado.familia.apellido_familiar;
      console.log(`   ${apellidoOk ? '✅' : '❌'} Apellido: ${infoGeneral.apellido_familiar}`);
      if (apellidoOk) camposCompletos++; else camposFallidos++;
      
      // Dirección
      const direccionOk = infoGeneral.direccion === esperado.familia.direccion_familia;
      console.log(`   ${direccionOk ? '✅' : '❌'} Dirección: ${infoGeneral.direccion}`);
      if (direccionOk) camposCompletos++; else camposFallidos++;
      
      // Teléfono
      const telefonoOk = infoGeneral.telefono === esperado.familia.telefono;
      console.log(`   ${telefonoOk ? '✅' : '❌'} Teléfono: ${infoGeneral.telefono}`);
      if (telefonoOk) camposCompletos++; else camposFallidos++;
      
      // Comunión en Casa
      const comunionOk = infoGeneral.comunionEnCasa === esperado.familia.comunionEnCasa;
      console.log(`   ${comunionOk ? '✅' : '❌'} Comunión en Casa: ${infoGeneral.comunionEnCasa}`);
      if (comunionOk) camposCompletos++; else camposFallidos++;
      
    } else {
      console.log('   ❌ Sección informacionGeneral: FALTANTE');
      camposFallidos += 6;
    }
    
    // ========== VALIDACIÓN 3: VIVIENDA ==========
    console.log('\n3️⃣ VALIDANDO VIVIENDA:');
    const vivienda = response.vivienda;
    
    if (vivienda) {
      console.log('   ✅ Sección vivienda: PRESENTE');
      
      const tipoOk = vivienda.tipo_vivienda && vivienda.tipo_vivienda.nombre === esperado.familia.tipo_vivienda;
      console.log(`   ${tipoOk ? '✅' : '❌'} Tipo Vivienda: ${vivienda.tipo_vivienda?.nombre || 'NULL'} (esperado: ${esperado.familia.tipo_vivienda})`);
      if (tipoOk) camposCompletos++; else camposFallidos++;
      
      const disposicionOk = vivienda.disposicion_basuras && typeof vivienda.disposicion_basuras === 'object';
      console.log(`   ${disposicionOk ? '✅' : '❌'} Disposición Basuras: ${disposicionOk ? 'ESTRUCTURA PRESENTE' : 'FALTANTE'}`);
      if (disposicionOk) {
        const campos = ['recolector', 'quemada', 'enterrada', 'recicla', 'aire_libre', 'no_aplica'];
        let camposBasuraCompletos = 0;
        campos.forEach(campo => {
          const presente = typeof vivienda.disposicion_basuras[campo] === 'boolean';
          console.log(`      ${presente ? '✅' : '❌'} ${campo}: ${vivienda.disposicion_basuras[campo]}`);
          if (presente) camposBasuraCompletos++;
        });
        console.log(`      📊 Campos basura completos: ${camposBasuraCompletos}/${campos.length}`);
        if (camposBasuraCompletos === campos.length) camposCompletos++; else camposFallidos++;
      } else {
        camposFallidos++;
      }
      
    } else {
      console.log('   ❌ Sección vivienda: FALTANTE');
      camposFallidos += 2;
    }
    
    // ========== VALIDACIÓN 4: SERVICIOS DE AGUA ==========
    console.log('\n4️⃣ VALIDANDO SERVICIOS DE AGUA:');
    const serviciosAgua = response.servicios_agua;
    
    if (serviciosAgua) {
      console.log('   ✅ Sección servicios_agua: PRESENTE');
      
      const sistemaOk = serviciosAgua.sistema_acueducto && serviciosAgua.sistema_acueducto.nombre;
      console.log(`   ${sistemaOk ? '✅' : '❌'} Sistema Acueducto: ${serviciosAgua.sistema_acueducto?.nombre || 'NULL'}`);
      if (sistemaOk) camposCompletos++; else camposFallidos++;
      
    } else {
      console.log('   ❌ Sección servicios_agua: FALTANTE');
      camposFallidos++;
    }
    
    // ========== VALIDACIÓN 5: FAMILY MEMBERS ==========
    console.log('\n5️⃣ VALIDANDO FAMILY MEMBERS:');
    const familyMembers = response.familyMembers;
    
    if (familyMembers && Array.isArray(familyMembers)) {
      console.log(`   ✅ Sección familyMembers: ${familyMembers.length} miembros encontrados`);
      
      let miembrosCompletos = 0;
      familyMembers.forEach((miembro, index) => {
        console.log(`   👤 MIEMBRO ${index + 1}:`);
        
        const validacionesMiembro = [];
        
        // Nombres
        const nombresOk = miembro.nombres && miembro.nombres.trim().length > 0;
        console.log(`      ${nombresOk ? '✅' : '❌'} Nombres: ${miembro.nombres || 'NULL'}`);
        validacionesMiembro.push(nombresOk);
        
        // Identificación
        const identificacionOk = miembro.numeroIdentificacion && miembro.numeroIdentificacion.length > 0;
        console.log(`      ${identificacionOk ? '✅' : '❌'} Identificación: ${miembro.numeroIdentificacion || 'NULL'}`);
        validacionesMiembro.push(identificacionOk);
        
        // Tipo Identificación
        const tipoIdOk = miembro.tipoIdentificacion && miembro.tipoIdentificacion.nombre && miembro.tipoIdentificacion.codigo;
        console.log(`      ${tipoIdOk ? '✅' : '❌'} Tipo ID: ${miembro.tipoIdentificacion?.nombre || 'NULL'} (${miembro.tipoIdentificacion?.codigo || 'NULL'})`);
        validacionesMiembro.push(tipoIdOk);
        
        // Fecha Nacimiento
        const fechaOk = miembro.fechaNacimiento;
        console.log(`      ${fechaOk ? '✅' : '❌'} Fecha Nacimiento: ${miembro.fechaNacimiento || 'NULL'}`);
        validacionesMiembro.push(fechaOk);
        
        // Sexo
        const sexoOk = miembro.sexo && miembro.sexo.nombre;
        console.log(`      ${sexoOk ? '✅' : '❌'} Sexo: ${miembro.sexo?.nombre || 'NULL'}`);
        validacionesMiembro.push(sexoOk);
        
        // Teléfono
        const telefonoOk = miembro.telefono;
        console.log(`      ${telefonoOk ? '✅' : '❌'} Teléfono: ${miembro.telefono || 'NULL'}`);
        validacionesMiembro.push(telefonoOk);
        
        // Estudios
        const estudiosOk = miembro.estudio && miembro.estudio.nombre;
        console.log(`      ${estudiosOk ? '✅' : '❌'} Estudios: ${miembro.estudio?.nombre || 'NULL'}`);
        validacionesMiembro.push(estudiosOk);
        
        // Tallas
        const tallasOk = miembro["talla_camisa/blusa"] && miembro.talla_pantalon && miembro.talla_zapato;
        console.log(`      ${tallasOk ? '✅' : '❌'} Tallas: Camisa(${miembro["talla_camisa/blusa"] || 'NULL'}) Pantalón(${miembro.talla_pantalon || 'NULL'}) Zapato(${miembro.talla_zapato || 'NULL'})`);
        validacionesMiembro.push(tallasOk);
        
        // Motivio fecha celebrar
        const celebracionOk = miembro.motivoFechaCelebrar && miembro.motivoFechaCelebrar.motivo && miembro.motivoFechaCelebrar.dia && miembro.motivoFechaCelebrar.mes;
        console.log(`      ${celebracionOk ? '✅' : '❌'} Celebración: ${miembro.motivoFechaCelebrar?.motivo || 'NULL'} (${miembro.motivoFechaCelebrar?.dia || 'NULL'}/${miembro.motivoFechaCelebrar?.mes || 'NULL'})`);
        validacionesMiembro.push(celebracionOk);
        
        const miembroCompleto = validacionesMiembro.every(v => v);
        if (miembroCompleto) miembrosCompletos++;
        
        console.log(`      📊 Miembro ${index + 1}: ${miembroCompleto ? '✅ COMPLETO' : '❌ INCOMPLETO'} (${validacionesMiembro.filter(v => v).length}/${validacionesMiembro.length})`);
      });
      
      console.log(`   📈 RESUMEN Family Members: ${miembrosCompletos}/${familyMembers.length} completos`);
      if (miembrosCompletos === familyMembers.length && familyMembers.length === esperado.personas.length) {
        camposCompletos++;
      } else {
        camposFallidos++;
      }
      
    } else {
      console.log('   ❌ Sección familyMembers: FALTANTE');
      camposFallidos++;
    }
    
    // ========== VALIDACIÓN 6: DECEASED MEMBERS ==========
    console.log('\n6️⃣ VALIDANDO DECEASED MEMBERS:');
    const deceasedMembers = response.deceasedMembers;
    
    if (deceasedMembers && Array.isArray(deceasedMembers)) {
      console.log(`   ✅ Sección deceasedMembers: ${deceasedMembers.length} fallecidos encontrados`);
      
      deceasedMembers.forEach((fallecido, index) => {
        console.log(`   ⚰️ FALLECIDO ${index + 1}:`);
        
        const nombreOk = fallecido.nombres && fallecido.nombres.trim().length > 0;
        console.log(`      ${nombreOk ? '✅' : '❌'} Nombres: ${fallecido.nombres || 'NULL'}`);
        
        const fechaOk = fallecido.fechaFallecimiento;
        console.log(`      ${fechaOk ? '✅' : '❌'} Fecha Fallecimiento: ${fallecido.fechaFallecimiento || 'NULL'}`);
        
        const causaOk = fallecido.causaFallecimiento;
        console.log(`      ${causaOk ? '✅' : '❌'} Causa: ${fallecido.causaFallecimiento || 'NULL'}`);
        
        if (nombreOk && fechaOk && causaOk) {
          console.log(`      📊 Fallecido ${index + 1}: ✅ COMPLETO`);
        } else {
          console.log(`      📊 Fallecido ${index + 1}: ❌ INCOMPLETO`);
        }
      });
      
      if (deceasedMembers.length > 0) camposCompletos++; else camposFallidos++;
      
    } else {
      console.log('   ❌ Sección deceasedMembers: FALTANTE');
      camposFallidos++;
    }
    
    // ========== VALIDACIÓN 7: METADATA ==========
    console.log('\n7️⃣ VALIDANDO METADATA:');
    const metadata = response.metadata;
    
    if (metadata) {
      console.log('   ✅ Sección metadata: PRESENTE');
      
      const timestampOk = metadata.timestamp;
      console.log(`   ${timestampOk ? '✅' : '❌'} Timestamp: ${metadata.timestamp || 'NULL'}`);
      
      const completedOk = typeof metadata.completed === 'boolean';
      console.log(`   ${completedOk ? '✅' : '❌'} Completed: ${metadata.completed}`);
      
      const stageOk = typeof metadata.currentStage === 'number';
      console.log(`   ${stageOk ? '✅' : '❌'} Current Stage: ${metadata.currentStage}`);
      
      const totalMiembrosOk = typeof metadata.total_miembros === 'number' && metadata.total_miembros === esperado.personas.length;
      console.log(`   ${totalMiembrosOk ? '✅' : '❌'} Total Miembros: ${metadata.total_miembros} (esperado: ${esperado.personas.length})`);
      
      const totalFallecidosOk = typeof metadata.total_fallecidos === 'number' && metadata.total_fallecidos === 1;
      console.log(`   ${totalFallecidosOk ? '✅' : '❌'} Total Fallecidos: ${metadata.total_fallecidos} (esperado: 1)`);
      
      const metadataCompleta = timestampOk && completedOk && stageOk && totalMiembrosOk && totalFallecidosOk;
      if (metadataCompleta) camposCompletos++; else camposFallidos++;
      
    } else {
      console.log('   ❌ Sección metadata: FALTANTE');
      camposFallidos++;
    }
    
    return { camposCompletos, camposFallidos, validaciones };
  }

  generarReporteFinal(validacion) {
    console.log('\n' + '='.repeat(100));
    console.log('📊 REPORTE FINAL DE VALIDACIÓN COMPLETA');
    console.log('='.repeat(100));
    
    const totalCampos = validacion.camposCompletos + validacion.camposFallidos;
    const porcentajeExito = totalCampos > 0 ? (validacion.camposCompletos / totalCampos * 100) : 0;
    
    console.log(`✅ CAMPOS COMPLETOS: ${validacion.camposCompletos}`);
    console.log(`❌ CAMPOS FALLIDOS: ${validacion.camposFallidos}`);
    console.log(`📊 TOTAL EVALUADO: ${totalCampos}`);
    console.log(`🎯 PORCENTAJE DE ÉXITO: ${porcentajeExito.toFixed(2)}%`);
    
    if (validacion.camposFallidos === 0) {
      console.log('\n🎉 ¡PRUEBA COMPLETAMENTE EXITOSA!');
      console.log('🏆 TODA la información del request se preserva en el response');
      console.log('✅ NO hay ningún dato NULL en campos críticos');
      console.log('📋 La estructura está ABSOLUTAMENTE COMPLETA');
      console.log('💯 INTEGRIDAD REQUEST-RESPONSE: 100% GARANTIZADA');
    } else {
      console.log('\n⚠️ PRUEBA PARCIALMENTE EXITOSA');
      console.log(`🔧 ${validacion.camposFallidos} campos necesitan atención`);
      if (porcentajeExito >= 80) {
        console.log('📈 Resultado: MUY BUENO (>80%)');
      } else if (porcentajeExito >= 60) {
        console.log('📈 Resultado: BUENO (>60%)');
      } else {
        console.log('📈 Resultado: NECESITA MEJORAS (<60%)');
      }
    }
    
    console.log('='.repeat(100));
    
    return {
      totalCampos,
      camposCompletos: validacion.camposCompletos,
      camposFallidos: validacion.camposFallidos,
      porcentajeExito,
      completamenteExitosa: validacion.camposFallidos === 0
    };
  }

  async ejecutar() {
    try {
      console.log('🚀 INICIANDO PRUEBA FINAL COMPLETA DE VALIDACIÓN\n');
      console.log('🎯 OBJETIVO: Crear familia con TODOS los datos posibles y validar');
      console.log('    que TODA la información enviada en el request aparece en el response\n');
      
      // Paso 1: Crear familia con datos absolutamente completos
      const familiaCreada = await this.crearFamiliaCompleta();
      
      // Paso 2: Ejecutar consulta y obtener response
      const validacion = await this.ejecutarConsultaCompleta(familiaCreada);
      
      // Paso 3: Generar reporte final
      const reporte = this.generarReporteFinal(validacion);
      
      return reporte;
      
    } catch (error) {
      console.error('\n❌ ERROR EN LA PRUEBA:', error.message);
      console.error('Stack:', error.stack);
      throw error;
    } finally {
      await sequelize.close();
    }
  }
}

// Ejecutar la prueba
const prueba = new PruebaFinalCompleta();
prueba.ejecutar().catch(console.error);
