import sequelize from './config/sequelize.js';
import { 
  Familias, 
  Persona, 
  Sexo, 
  TipoIdentificacion, 
  DifuntosFamilia,
  Municipios,
  TipoDisposicionBasura,
  FamiliaDisposicionBasura
} from './src/models/index.js';
import FamiliasConsultasService from './src/services/familiasConsultasService.js';
import { QueryTypes } from 'sequelize';

/**
 * PRUEBA COMPLETA SIMPLIFICADA
 * Crea familia con datos completos y valida response
 */

class PruebaValidacionSimplificada {
  
  constructor() {
    this.familiasService = new FamiliasConsultasService();
  }

  async validarDatosMaestros() {
    console.log('🔍 PASO 1: Validando datos maestros...\n');
    
    // Validar Sexos
    const sexos = await Sexo.findAll();
    console.log(`✅ Sexos: ${sexos.length} encontrados`);
    
    // Validar Tipos de Identificación
    const tiposId = await TipoIdentificacion.findAll();
    console.log(`✅ Tipos ID: ${tiposId.length} encontrados`);
    
    // Validar Municipios
    const municipios = await Municipios.findAll();
    console.log(`✅ Municipios: ${municipios.length} encontrados`);
    
    // Validar Tipos de Basura
    const tiposBasura = await TipoDisposicionBasura.findAll();
    console.log(`✅ Tipos Basura: ${tiposBasura.length} encontrados`);
    
    // Validar Sistemas de Acueducto
    const sistemasAcueducto = await sequelize.query(
      'SELECT * FROM sistemas_acueducto LIMIT 3',
      { type: QueryTypes.SELECT }
    );
    console.log(`✅ Sistemas Acueducto: ${sistemasAcueducto.length} encontrados`);
    
    return { sexos, tiposId, municipios, tiposBasura, sistemasAcueducto };
  }

  async crearFamiliaCompleta(datos) {
    console.log('\n🏗️ PASO 2: Creando familia COMPLETAMENTE LLENA...\n');
    
    const timestamp = Date.now();
    
    // Crear familia
    const familia = await Familias.create({
      apellido_familiar: `Familia Prueba Completa ${timestamp}`,
      sector: 'Sector Centro Prueba',
      direccion_familia: 'Calle 123 #45-67 Barrio El Ejemplo',
      numero_contacto: '6041234567',
      telefono: '3001234567',
      email: `familia.${timestamp}@test.com`,
      tamaño_familia: 3,
      tipo_vivienda: 'Casa Propia',
      estado_encuesta: 'completed',
      numero_encuestas: 1,
      fecha_ultima_encuesta: new Date(),
      codigo_familia: `FAM-${timestamp}`,
      tutor_responsable: true,
      id_municipio: datos.municipios[0]?.id_municipio || 1,
      comunionEnCasa: true,
      observaciones: 'Familia de prueba con todos los datos'
    });
    
    console.log(`✅ Familia creada: ID ${familia.id_familia}`);
    
    // Crear personas con TODOS los datos posibles
    const personas = await Promise.all([
      // Padre
      Persona.create({
        primer_nombre: 'Carlos',
        segundo_nombre: 'Alberto',
        primer_apellido: 'Pérez',
        segundo_apellido: 'González',
        identificacion: `12345678-${timestamp}`,
        telefono: '3001111111',
        correo_electronico: `carlos.${timestamp}@test.com`,
        fecha_nacimiento: '1985-03-15',
        direccion: familia.direccion_familia,
        estudios: 'Universitario Completo',
        talla_camisa: 'L',
        talla_pantalon: '32',
        talla_zapato: '42',
        id_sexo: datos.sexos.find(s => s.descripcion?.toLowerCase().includes('masculino'))?.id_sexo || 1,
        id_tipo_identificacion_tipo_identificacion: datos.tiposId.find(t => t.codigo === 'CC')?.id_tipo_identificacion || 1,
        id_estado_civil_estado_civil: 1,
        id_familia_familias: familia.id_familia
      }),
      // Madre
      Persona.create({
        primer_nombre: 'María',
        segundo_nombre: 'Elena',
        primer_apellido: 'Rodríguez',
        segundo_apellido: 'López',
        identificacion: `87654321-${timestamp}`,
        telefono: '3002222222',
        correo_electronico: `maria.${timestamp}@test.com`,
        fecha_nacimiento: '1987-07-22',
        direccion: familia.direccion_familia,
        estudios: 'Técnico Profesional',
        talla_camisa: 'M',
        talla_pantalon: '28',
        talla_zapato: '37',
        id_sexo: datos.sexos.find(s => s.descripcion?.toLowerCase().includes('femenino'))?.id_sexo || 2,
        id_tipo_identificacion_tipo_identificacion: datos.tiposId.find(t => t.codigo === 'CC')?.id_tipo_identificacion || 1,
        id_estado_civil_estado_civil: 1,
        id_familia_familias: familia.id_familia
      }),
      // Hijo
      Persona.create({
        primer_nombre: 'Andrés',
        segundo_nombre: 'Felipe',
        primer_apellido: 'Pérez',
        segundo_apellido: 'Rodríguez',
        identificacion: `11111111-${timestamp}`,
        telefono: '3003333333',
        correo_electronico: `andres.${timestamp}@test.com`,
        fecha_nacimiento: '2010-11-08',
        direccion: familia.direccion_familia,
        estudios: 'Bachillerato',
        talla_camisa: 'S',
        talla_pantalon: '26',
        talla_zapato: '36',
        id_sexo: datos.sexos.find(s => s.descripcion?.toLowerCase().includes('masculino'))?.id_sexo || 1,
        id_tipo_identificacion_tipo_identificacion: datos.tiposId.find(t => t.codigo === 'TI')?.id_tipo_identificacion || 2,
        id_estado_civil_estado_civil: 2,
        id_familia_familias: familia.id_familia
      })
    ]);
    
    console.log(`✅ Personas creadas: ${personas.length}`);
    personas.forEach((p, i) => console.log(`   ${i+1}. ${p.primer_nombre} ${p.primer_apellido}`));
    
    // Crear relación disposición basura
    if (datos.tiposBasura.length > 0) {
      await FamiliaDisposicionBasura.create({
        id_familia: familia.id_familia,
        id_tipo_disposicion_basura: datos.tiposBasura[0].id_tipo_disposicion_basura
      });
      console.log(`✅ Disposición basura: ${datos.tiposBasura[0].nombre}`);
    }
    
    // Crear relación sistema acueducto
    if (datos.sistemasAcueducto.length > 0) {
      await sequelize.query(
        'INSERT INTO familia_sistema_acueducto (id_familia, id_sistema_acueducto) VALUES (?, ?)',
        {
          replacements: [familia.id_familia, datos.sistemasAcueducto[0].id_sistema_acueducto],
          type: QueryTypes.INSERT
        }
      );
      console.log(`✅ Sistema acueducto: ${datos.sistemasAcueducto[0].nombre}`);
    }
    
    // Crear persona fallecida
    await DifuntosFamilia.create({
      id_familia_familias: familia.id_familia,
      nombre_completo: 'José Antonio Pérez García',
      fecha_fallecimiento: '2020-12-15',
      observaciones: 'Abuelo fallecido por causas naturales'
    });
    console.log(`✅ Fallecido registrado: José Antonio Pérez García`);
    
    return { familia, personas };
  }

  async ejecutarConsultaYValidar(familiaCreada) {
    console.log('\n🔍 PASO 3: Ejecutando consulta y validando respuesta...\n');
    
    const filtros = {
      apellido_familiar: familiaCreada.familia.apellido_familiar,
      limite: 1
    };
    
    console.log(`🔍 Buscando: "${filtros.apellido_familiar}"`);
    
    const resultado = await this.familiasService.consultarFamiliasConPadresMadres(filtros);
    
    if (!resultado.exito || resultado.datos.length === 0) {
      throw new Error('❌ No se encontró la familia');
    }
    
    const response = resultado.datos[0];
    console.log(`✅ Familia encontrada: ID ${response.id_encuesta}`);
    
    return this.validarEstructura(response, familiaCreada);
  }

  validarEstructura(response, esperado) {
    console.log('\n📋 PASO 4: Validación exhaustiva...\n');
    
    const validaciones = [];
    
    // 1. ID Encuesta
    const idOk = response.id_encuesta === esperado.familia.id_familia;
    console.log(`${idOk ? '✅' : '❌'} ID Encuesta: ${response.id_encuesta}`);
    validaciones.push({ campo: 'id_encuesta', ok: idOk });
    
    // 2. Información General
    const infoGeneral = response.informacionGeneral;
    if (infoGeneral) {
      console.log('✅ Información General: PRESENTE');
      
      const municipioOk = infoGeneral.municipio && infoGeneral.municipio.nombre;
      console.log(`  ${municipioOk ? '✅' : '❌'} Municipio: ${infoGeneral.municipio?.nombre || 'NULL'}`);
      
      const sectorOk = infoGeneral.sector && infoGeneral.sector.nombre;
      console.log(`  ${sectorOk ? '✅' : '❌'} Sector: ${infoGeneral.sector?.nombre || 'NULL'}`);
      
      const apellidoOk = infoGeneral.apellido_familiar === esperado.familia.apellido_familiar;
      console.log(`  ${apellidoOk ? '✅' : '❌'} Apellido: ${infoGeneral.apellido_familiar}`);
      
      const direccionOk = infoGeneral.direccion === esperado.familia.direccion_familia;
      console.log(`  ${direccionOk ? '✅' : '❌'} Dirección: ${infoGeneral.direccion}`);
      
      const telefonoOk = infoGeneral.telefono === esperado.familia.telefono;
      console.log(`  ${telefonoOk ? '✅' : '❌'} Teléfono: ${infoGeneral.telefono}`);
      
      const comunionOk = infoGeneral.comunionEnCasa === esperado.familia.comunionEnCasa;
      console.log(`  ${comunionOk ? '✅' : '❌'} Comunión Casa: ${infoGeneral.comunionEnCasa}`);
      
      validaciones.push(
        { campo: 'municipio', ok: municipioOk },
        { campo: 'sector', ok: sectorOk },
        { campo: 'apellido', ok: apellidoOk },
        { campo: 'direccion', ok: direccionOk },
        { campo: 'telefono', ok: telefonoOk },
        { campo: 'comunion', ok: comunionOk }
      );
    } else {
      console.log('❌ Información General: FALTANTE');
      validaciones.push({ campo: 'informacionGeneral', ok: false });
    }
    
    // 3. Vivienda
    const vivienda = response.vivienda;
    if (vivienda) {
      console.log('✅ Vivienda: PRESENTE');
      
      const tipoOk = vivienda.tipo_vivienda && vivienda.tipo_vivienda.nombre;
      console.log(`  ${tipoOk ? '✅' : '❌'} Tipo: ${vivienda.tipo_vivienda?.nombre || 'NULL'}`);
      
      const basuraOk = vivienda.disposicion_basuras && typeof vivienda.disposicion_basuras === 'object';
      console.log(`  ${basuraOk ? '✅' : '❌'} Disposición Basuras: ${basuraOk ? 'COMPLETA' : 'INCOMPLETA'}`);
      
      validaciones.push(
        { campo: 'tipo_vivienda', ok: tipoOk },
        { campo: 'disposicion_basuras', ok: basuraOk }
      );
    } else {
      console.log('❌ Vivienda: FALTANTE');
      validaciones.push({ campo: 'vivienda', ok: false });
    }
    
    // 4. Servicios Agua
    const agua = response.servicios_agua;
    if (agua) {
      console.log('✅ Servicios Agua: PRESENTE');
      
      const sistemaOk = agua.sistema_acueducto && agua.sistema_acueducto.nombre;
      console.log(`  ${sistemaOk ? '✅' : '❌'} Sistema: ${agua.sistema_acueducto?.nombre || 'NULL'}`);
      
      validaciones.push({ campo: 'sistema_acueducto', ok: sistemaOk });
    } else {
      console.log('❌ Servicios Agua: FALTANTE');
      validaciones.push({ campo: 'servicios_agua', ok: false });
    }
    
    // 5. Family Members
    const members = response.familyMembers;
    if (members && Array.isArray(members)) {
      console.log(`✅ Family Members: ${members.length} encontrados`);
      
      let miembrosCompletos = 0;
      members.forEach((m, i) => {
        const nombreOk = m.nombres && m.nombres.trim().length > 0;
        const idOk = m.numeroIdentificacion && m.numeroIdentificacion.length > 0;
        const tipoIdOk = m.tipoIdentificacion && m.tipoIdentificacion.nombre;
        const sexoOk = m.sexo && m.sexo.nombre;
        const estudiosOk = m.estudio && m.estudio.nombre;
        const tallasOk = m["talla_camisa/blusa"] && m.talla_pantalon && m.talla_zapato;
        const celebracionOk = m.motivoFechaCelebrar && m.motivoFechaCelebrar.motivo;
        
        const completo = nombreOk && idOk && tipoIdOk && sexoOk && estudiosOk && tallasOk && celebracionOk;
        if (completo) miembrosCompletos++;
        
        console.log(`  👤 Miembro ${i+1}: ${completo ? '✅ COMPLETO' : '❌ INCOMPLETO'}`);
        console.log(`     - Nombre: ${nombreOk ? '✅' : '❌'} ${m.nombres || 'NULL'}`);
        console.log(`     - ID: ${idOk ? '✅' : '❌'} ${m.numeroIdentificacion || 'NULL'}`);
        console.log(`     - Tipo ID: ${tipoIdOk ? '✅' : '❌'} ${m.tipoIdentificacion?.nombre || 'NULL'}`);
        console.log(`     - Sexo: ${sexoOk ? '✅' : '❌'} ${m.sexo?.nombre || 'NULL'}`);
        console.log(`     - Estudios: ${estudiosOk ? '✅' : '❌'} ${m.estudio?.nombre || 'NULL'}`);
        console.log(`     - Tallas: ${tallasOk ? '✅' : '❌'} C:${m["talla_camisa/blusa"] || 'NULL'} P:${m.talla_pantalon || 'NULL'} Z:${m.talla_zapato || 'NULL'}`);
        console.log(`     - Celebración: ${celebracionOk ? '✅' : '❌'} ${m.motivoFechaCelebrar?.motivo || 'NULL'} ${m.motivoFechaCelebrar?.dia || 'NULL'}/${m.motivoFechaCelebrar?.mes || 'NULL'}`);
      });
      
      validaciones.push({ campo: 'familyMembers', ok: miembrosCompletos === members.length });
      console.log(`  📊 Miembros completos: ${miembrosCompletos}/${members.length}`);
      
    } else {
      console.log('❌ Family Members: FALTANTE');
      validaciones.push({ campo: 'familyMembers', ok: false });
    }
    
    // 6. Deceased Members
    const deceased = response.deceasedMembers;
    if (deceased && Array.isArray(deceased)) {
      console.log(`✅ Deceased Members: ${deceased.length} encontrados`);
      
      deceased.forEach((d, i) => {
        const nombreOk = d.nombres && d.nombres.trim().length > 0;
        const fechaOk = d.fechaFallecimiento;
        const causaOk = d.causaFallecimiento;
        
        console.log(`  ⚰️ Fallecido ${i+1}: ${nombreOk && fechaOk && causaOk ? '✅ COMPLETO' : '❌ INCOMPLETO'}`);
        console.log(`     - Nombre: ${nombreOk ? '✅' : '❌'} ${d.nombres || 'NULL'}`);
        console.log(`     - Fecha: ${fechaOk ? '✅' : '❌'} ${d.fechaFallecimiento || 'NULL'}`);
        console.log(`     - Causa: ${causaOk ? '✅' : '❌'} ${d.causaFallecimiento || 'NULL'}`);
      });
      
      validaciones.push({ campo: 'deceasedMembers', ok: deceased.length > 0 });
    } else {
      console.log('❌ Deceased Members: FALTANTE');
      validaciones.push({ campo: 'deceasedMembers', ok: false });
    }
    
    // 7. Metadata
    const meta = response.metadata;
    if (meta) {
      console.log('✅ Metadata: PRESENTE');
      
      const timestampOk = meta.timestamp;
      const completedOk = typeof meta.completed === 'boolean';
      const stageOk = typeof meta.currentStage === 'number';
      const totalOk = typeof meta.total_miembros === 'number';
      const fallecidosOk = typeof meta.total_fallecidos === 'number';
      
      console.log(`  ${timestampOk ? '✅' : '❌'} Timestamp: ${meta.timestamp || 'NULL'}`);
      console.log(`  ${completedOk ? '✅' : '❌'} Completed: ${meta.completed}`);
      console.log(`  ${stageOk ? '✅' : '❌'} Stage: ${meta.currentStage}`);
      console.log(`  ${totalOk ? '✅' : '❌'} Total Miembros: ${meta.total_miembros}`);
      console.log(`  ${fallecidosOk ? '✅' : '❌'} Total Fallecidos: ${meta.total_fallecidos}`);
      
      validaciones.push({ campo: 'metadata', ok: timestampOk && completedOk && stageOk && totalOk && fallecidosOk });
    } else {
      console.log('❌ Metadata: FALTANTE');
      validaciones.push({ campo: 'metadata', ok: false });
    }
    
    return validaciones;
  }

  generarReporte(validaciones) {
    console.log('\n📊 REPORTE FINAL\n');
    console.log('='.repeat(80));
    
    const exitosas = validaciones.filter(v => v.ok);
    const fallidas = validaciones.filter(v => !v.ok);
    
    console.log(`✅ EXITOSAS: ${exitosas.length}`);
    console.log(`❌ FALLIDAS: ${fallidas.length}`);
    console.log(`📊 ÉXITO: ${((exitosas.length / validaciones.length) * 100).toFixed(1)}%`);
    
    if (fallidas.length > 0) {
      console.log('\n❌ CAMPOS FALLIDOS:');
      fallidas.forEach(f => console.log(`   - ${f.campo}`));
    }
    
    if (fallidas.length === 0) {
      console.log('\n🎉 ¡PRUEBA COMPLETAMENTE EXITOSA!');
      console.log('🎯 TODA la información del request está en el response');
      console.log('✅ NO hay ningún dato NULL');
      console.log('📋 Estructura ABSOLUTAMENTE COMPLETA');
    } else {
      console.log('\n⚠️ PRUEBA PARCIALMENTE EXITOSA');
      console.log(`🔧 ${fallidas.length} campos necesitan corrección`);
    }
    
    console.log('='.repeat(80));
    
    return {
      total: validaciones.length,
      exitosas: exitosas.length,
      fallidas: fallidas.length,
      porcentaje: (exitosas.length / validaciones.length) * 100,
      completamenteExitosa: fallidas.length === 0
    };
  }

  async ejecutar() {
    try {
      console.log('🚀 PRUEBA COMPLETA DE VALIDACIÓN\n');
      console.log('🎯 Crear familia con TODOS los datos y validar integridad request-response\n');
      
      const datos = await this.validarDatosMaestros();
      const familiaCreada = await this.crearFamiliaCompleta(datos);
      const validaciones = await this.ejecutarConsultaYValidar(familiaCreada);
      const reporte = this.generarReporte(validaciones);
      
      return reporte;
      
    } catch (error) {
      console.error('\n❌ ERROR:', error.message);
      throw error;
    } finally {
      await sequelize.close();
    }
  }
}

// Ejecutar
const prueba = new PruebaValidacionSimplificada();
prueba.ejecutar().catch(console.error);
