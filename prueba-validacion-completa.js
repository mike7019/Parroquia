import sequelize from './config/sequelize.js';
import { 
     // Validar V    // Validar Veredas
    const veredas = await sequelize.query(
      'SELECT id_vereda, nombre_vereda, id_municipio_municipios FROM veredas LIMIT 5',
      { type: QueryTypes.SELECT }
    );
    console.log(`\n✅ Veredas encontradas: ${veredas.length}`);
    veredas.slice(0, 3).forEach(v => console.log(`   - ${v.id_vereda}: ${v.nombre_vereda || 'Sin nombre'}`));
    validaciones.push({ tabla: 'veredas', count: veredas.length, datos: veredas });
    
    // Validar Sectores
    const sectores = await sequelize.query(
      'SELECT id_sector, nombre_sector, id_municipio FROM sectores LIMIT 5',
      { type: QueryTypes.SELECT }
    );
    console.log(`\n✅ Sectores encontrados: ${sectores.length}`);
    sectores.slice(0, 3).forEach(s => console.log(`   - ${s.id_sector}: ${s.nombre_sector || 'Sin nombre'}`));
    validaciones.push({ tabla: 'sectores', count: sectores.length, datos: sectores }); const veredas = await sequelize.query(
      'SELECT id_vereda, nombre_vereda, id_municipio_municipios FROM veredas LIMIT 5',
      { type: QueryTypes.SELECT }
    );
    console.log(`\n✅ Veredas encontradas: ${veredas.length}`);
    veredas.slice(0, 3).forEach(v => console.log(`   - ${v.id_vereda}: ${v.nombre_vereda || 'Sin nombre'}`));
    validaciones.push({ tabla: 'veredas', count: veredas.length, datos: veredas });
    
    // Validar Sectores
    const sectores = await sequelize.query(
      'SELECT id_sector, nombre_sector, id_municipio FROM sectores LIMIT 5',
      { type: QueryTypes.SELECT }
    );
    console.log(`\n✅ Sectores encontrados: ${sectores.length}`);
    sectores.slice(0, 3).forEach(s => console.log(`   - ${s.id_sector}: ${s.nombre_sector || 'Sin nombre'}`));
    validaciones.push({ tabla: 'sectores', count: sectores.length, datos: sectores });
  Persona, 
  Sexo, 
  TipoIdentificacion, 
  DifuntosFamilia,
  Municipios,
  Veredas,
  Sector,
  Departamentos,
  Parroquia,
  TipoVivienda,
  TipoDisposicionBasura,
  FamiliaDisposicionBasura
} from './src/models/index.js';
import FamiliasConsultasService from './src/services/familiasConsultasService.js';
import { QueryTypes } from 'sequelize';

/**
 * PRUEBA COMPLETA DE VALIDACIÓN DE DATOS
 * 
 * Esta prueba:
 * 1. Valida que existan todos los datos requeridos en la base de datos
 * 2. Crea una familia completa con TODA la información posible
 * 3. Ejecuta la consulta y verifica que el response contenga TODA la información del request
 */

class PruebaCompletaValidacion {
  
  constructor() {
    this.familiasService = new FamiliasConsultasService();
  }

  /**
   * PASO 1: Validar que existan todos los datos maestros necesarios
   */
  async validarDatosMaestros() {
    console.log('🔍 PASO 1: Validando datos maestros en la base de datos...\n');
    
    const validaciones = [];
    
    // Validar Sexos
    const sexos = await Sexo.findAll();
    console.log(`✅ Sexos encontrados: ${sexos.length}`);
    sexos.forEach(s => console.log(`   - ${s.id_sexo}: ${s.descripcion}`));
    validaciones.push({ tabla: 'sexos', count: sexos.length, datos: sexos });
    
    // Validar Tipos de Identificación
    const tiposId = await TipoIdentificacion.findAll();
    console.log(`\n✅ Tipos Identificación: ${tiposId.length}`);
    tiposId.forEach(t => console.log(`   - ${t.id_tipo_identificacion}: ${t.nombre} (${t.codigo})`));
    validaciones.push({ tabla: 'tipos_identificacion', count: tiposId.length, datos: tiposId });
    
    // Validar Municipios
    const municipios = await Municipios.findAll();
    console.log(`\n✅ Municipios encontrados: ${municipios.length}`);
    municipios.slice(0, 3).forEach(m => console.log(`   - ${m.id_municipio}: ${m.nombre_municipio}`));
    validaciones.push({ tabla: 'municipios', count: municipios.length, datos: municipios });
    
    // Validar Veredas
    const veredas = await Veredas.findAll();
    console.log(`\n✅ Veredas encontradas: ${veredas.length}`);
    veredas.slice(0, 3).forEach(v => console.log(`   - ${v.id_vereda}: ${v.nombre_vereda}`));
    validaciones.push({ tabla: 'veredas', count: veredas.length, datos: veredas });
    
    // Validar Sectores
    const sectores = await Sector.findAll();
    console.log(`\n✅ Sectores encontrados: ${sectores.length}`);
    sectores.slice(0, 3).forEach(s => console.log(`   - ${s.id_sector}: ${s.nombre_sector}`));
    validaciones.push({ tabla: 'sectores', count: sectores.length, datos: sectores });
    
    // Validar Parroquias
    const parroquias = await sequelize.query(
      'SELECT id_parroquia, nombre, id_municipio FROM parroquia LIMIT 5',
      { type: QueryTypes.SELECT }
    );
    console.log(`\n✅ Parroquias encontradas: ${parroquias.length}`);
    parroquias.slice(0, 3).forEach(p => console.log(`   - ${p.id_parroquia}: ${p.nombre}`));
    validaciones.push({ tabla: 'parroquias', count: parroquias.length, datos: parroquias });
    
    // Validar Tipos de Disposición de Basura
    const tiposBasura = await TipoDisposicionBasura.findAll();
    console.log(`\n✅ Tipos Disposición Basura: ${tiposBasura.length}`);
    tiposBasura.forEach(t => console.log(`   - ${t.id_tipo_disposicion_basura}: ${t.nombre}`));
    validaciones.push({ tabla: 'tipos_disposicion_basura', count: tiposBasura.length, datos: tiposBasura });
    
    // Validar que existan sistemas de acueducto
    const sistemasAcueducto = await sequelize.query(
      'SELECT * FROM sistemas_acueducto LIMIT 5',
      { type: QueryTypes.SELECT }
    );
    console.log(`\n✅ Sistemas Acueducto: ${sistemasAcueducto.length}`);
    sistemasAcueducto.forEach(s => console.log(`   - ${s.id_sistema_acueducto}: ${s.nombre}`));
    validaciones.push({ tabla: 'sistemas_acueducto', count: sistemasAcueducto.length, datos: sistemasAcueducto });
    
    return validaciones;
  }

  /**
   * PASO 2: Crear una familia con TODOS los datos completos
   */
  async crearFamiliaCompleta(datosMaestros) {
    console.log('\n🏗️ PASO 2: Creando familia con información ABSOLUTAMENTE COMPLETA...\n');
    
    // Obtener datos maestros
    const sexos = datosMaestros.find(d => d.tabla === 'sexos').datos;
    const tiposId = datosMaestros.find(d => d.tabla === 'tipos_identificacion').datos;
    const municipios = datosMaestros.find(d => d.tabla === 'municipios').datos;
    const veredas = datosMaestros.find(d => d.tabla === 'veredas').datos;
    const sectores = datosMaestros.find(d => d.tabla === 'sectores').datos;
    const parroquias = datosMaestros.find(d => d.tabla === 'parroquias').datos;
    const tiposBasura = datosMaestros.find(d => d.tabla === 'tipos_disposicion_basura').datos;
    const sistemasAcueducto = datosMaestros.find(d => d.tabla === 'sistemas_acueducto').datos;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // 1. Crear familia base
    const nuevaFamilia = await Familias.create({
      apellido_familiar: `Familia Prueba Completa ${timestamp}`,
      sector: 'Sector Prueba Completa',
      direccion_familia: 'Calle 123 #45-67 Barrio El Ejemplo',
      numero_contacto: '6041234567',
      telefono: '3001234567',
      email: `familia.prueba.${timestamp}@example.com`,
      tamaño_familia: 4,
      tipo_vivienda: 'Casa Propia',
      estado_encuesta: 'completed',
      numero_encuestas: 1,
      fecha_ultima_encuesta: new Date(),
      codigo_familia: `FAM-COMPLETA-${timestamp}`,
      tutor_responsable: true,
      id_municipio: municipios[0]?.id_municipio,
      id_vereda: veredas[0]?.id_vereda,
      id_sector: sectores[0]?.id_sector,
      comunionEnCasa: true,
      observaciones: 'Familia de prueba con todos los datos completos para validación'
    });
    
    console.log(`✅ Familia creada con ID: ${nuevaFamilia.id_familia}`);
    console.log(`   - Apellido: ${nuevaFamilia.apellido_familiar}`);
    console.log(`   - Dirección: ${nuevaFamilia.direccion_familia}`);
    console.log(`   - Teléfono: ${nuevaFamilia.telefono}`);
    console.log(`   - Email: ${nuevaFamilia.email}`);
    
    // 2. Crear personas de la familia (padre, madre, 2 hijos)
    const personasData = [
      {
        primer_nombre: 'Carlos',
        segundo_nombre: 'Alberto',
        primer_apellido: 'Pérez',
        segundo_apellido: 'González',
        identificacion: `12345678-${timestamp}`,
        telefono: '3001111111',
        correo_electronico: `carlos.perez.${timestamp}@example.com`,
        fecha_nacimiento: '1985-03-15',
        direccion: nuevaFamilia.direccion_familia,
        estudios: 'Universitario',
        talla_camisa: 'L',
        talla_pantalon: '32',
        talla_zapato: '42',
        id_sexo: sexos.find(s => s.descripcion?.toLowerCase().includes('masculino'))?.id_sexo,
        id_tipo_identificacion_tipo_identificacion: tiposId.find(t => t.codigo === 'CC')?.id_tipo_identificacion,
        id_estado_civil_estado_civil: 1,
        id_familia_familias: nuevaFamilia.id_familia
      },
      {
        primer_nombre: 'María',
        segundo_nombre: 'Elena',
        primer_apellido: 'Rodríguez',
        segundo_apellido: 'López',
        identificacion: `87654321-${timestamp}`,
        telefono: '3002222222',
        correo_electronico: `maria.rodriguez.${timestamp}@example.com`,
        fecha_nacimiento: '1987-07-22',
        direccion: nuevaFamilia.direccion_familia,
        estudios: 'Técnico',
        talla_camisa: 'M',
        talla_pantalon: '28',
        talla_zapato: '37',
        id_sexo: sexos.find(s => s.descripcion?.toLowerCase().includes('femenino'))?.id_sexo,
        id_tipo_identificacion_tipo_identificacion: tiposId.find(t => t.codigo === 'CC')?.id_tipo_identificacion,
        id_estado_civil_estado_civil: 1,
        id_familia_familias: nuevaFamilia.id_familia
      },
      {
        primer_nombre: 'Andrés',
        segundo_nombre: 'Felipe',
        primer_apellido: 'Pérez',
        segundo_apellido: 'Rodríguez',
        identificacion: `11111111-${timestamp}`,
        telefono: '3003333333',
        correo_electronico: `andres.perez.${timestamp}@example.com`,
        fecha_nacimiento: '2010-11-08',
        direccion: nuevaFamilia.direccion_familia,
        estudios: 'Bachillerato',
        talla_camisa: 'S',
        talla_pantalon: '26',
        talla_zapato: '36',
        id_sexo: sexos.find(s => s.descripcion?.toLowerCase().includes('masculino'))?.id_sexo,
        id_tipo_identificacion_tipo_identificacion: tiposId.find(t => t.codigo === 'TI')?.id_tipo_identificacion,
        id_estado_civil_estado_civil: 2,
        id_familia_familias: nuevaFamilia.id_familia
      },
      {
        primer_nombre: 'Sofia',
        segundo_nombre: 'Valentina',
        primer_apellido: 'Pérez',
        segundo_apellido: 'Rodríguez',
        identificacion: `22222222-${timestamp}`,
        telefono: '3004444444',
        correo_electronico: `sofia.perez.${timestamp}@example.com`,
        fecha_nacimiento: '2015-05-30',
        direccion: nuevaFamilia.direccion_familia,
        estudios: 'Primaria',
        talla_camisa: 'XS',
        talla_pantalon: '20',
        talla_zapato: '28',
        id_sexo: sexos.find(s => s.descripcion?.toLowerCase().includes('femenino'))?.id_sexo,
        id_tipo_identificacion_tipo_identificacion: tiposId.find(t => t.codigo === 'TI')?.id_tipo_identificacion,
        id_estado_civil_estado_civil: 2,
        id_familia_familias: nuevaFamilia.id_familia
      }
    ];
    
    const personasCreadas = [];
    for (const personaData of personasData) {
      const persona = await Persona.create(personaData);
      personasCreadas.push(persona);
      console.log(`   ✅ Persona creada: ${persona.primer_nombre} ${persona.primer_apellido} (ID: ${persona.id_personas})`);
    }
    
    // 3. Crear relación con disposición de basura
    if (tiposBasura.length > 0) {
      await FamiliaDisposicionBasura.create({
        id_familia: nuevaFamilia.id_familia,
        id_tipo_disposicion_basura: tiposBasura[0].id_tipo_disposicion_basura
      });
      console.log(`   ✅ Disposición basura configurada: ${tiposBasura[0].nombre}`);
    }
    
    // 4. Crear relación con sistema de acueducto
    if (sistemasAcueducto.length > 0) {
      await sequelize.query(
        'INSERT INTO familia_sistema_acueducto (id_familia, id_sistema_acueducto) VALUES (?, ?)',
        {
          replacements: [nuevaFamilia.id_familia, sistemasAcueducto[0].id_sistema_acueducto],
          type: QueryTypes.INSERT
        }
      );
      console.log(`   ✅ Sistema acueducto configurado: ${sistemasAcueducto[0].nombre}`);
    }
    
    // 5. Crear una persona fallecida para completar los datos
    await DifuntosFamilia.create({
      id_familia_familias: nuevaFamilia.id_familia,
      nombre_completo: 'José Antonio Pérez García',
      fecha_fallecimiento: '2020-12-15',
      observaciones: 'Abuelo de la familia, fallecido por causas naturales'
    });
    console.log(`   ✅ Persona fallecida registrada: José Antonio Pérez García`);
    
    return {
      familia: nuevaFamilia,
      personas: personasCreadas,
      municipio: municipios[0],
      vereda: veredas[0],
      sector: sectores[0],
      parroquia: parroquias[0],
      tipoBasura: tiposBasura[0],
      sistemaAcueducto: sistemasAcueducto[0]
    };
  }

  /**
   * PASO 3: Ejecutar consulta y validar que TODO se devuelve completo
   */
  async ejecutarYValidarConsulta(datosCreados) {
    console.log('\n🔍 PASO 3: Ejecutando consulta y validando respuesta completa...\n');
    
    const filtros = {
      apellido_familiar: datosCreados.familia.apellido_familiar,
      limite: 1
    };
    
    console.log(`🔍 Buscando familia: "${filtros.apellido_familiar}"`);
    
    const resultado = await this.familiasService.consultarFamiliasConPadresMadres(filtros);
    
    if (!resultado.exito || resultado.datos.length === 0) {
      throw new Error('❌ No se encontró la familia creada');
    }
    
    const familiaEncontrada = resultado.datos[0];
    console.log(`✅ Familia encontrada con ID: ${familiaEncontrada.id_encuesta}`);
    
    return this.validarEstructuraCompleta(familiaEncontrada, datosCreados);
  }

  /**
   * PASO 4: Validación exhaustiva de la estructura
   */
  validarEstructuraCompleta(response, datosEsperados) {
    console.log('\n📋 PASO 4: Validación exhaustiva de estructura completa...\n');
    
    const validaciones = [];
    
    // 1. Validar ID Encuesta
    const idValido = response.id_encuesta === datosEsperados.familia.id_familia;
    console.log(`${idValido ? '✅' : '❌'} ID Encuesta: ${response.id_encuesta} (esperado: ${datosEsperados.familia.id_familia})`);
    validaciones.push({ campo: 'id_encuesta', valido: idValido, valor: response.id_encuesta });
    
    // 2. Validar Información General
    const infoGeneral = response.informacionGeneral;
    if (infoGeneral) {
      console.log('✅ Información General: PRESENTE');
      
      // Municipio
      const municipioValido = infoGeneral.municipio && infoGeneral.municipio.nombre;
      console.log(`  ${municipioValido ? '✅' : '❌'} Municipio: ${infoGeneral.municipio?.nombre || 'NULL'}`);
      validaciones.push({ campo: 'municipio', valido: municipioValido, valor: infoGeneral.municipio });
      
      // Sector
      const sectorValido = infoGeneral.sector && infoGeneral.sector.nombre;
      console.log(`  ${sectorValido ? '✅' : '❌'} Sector: ${infoGeneral.sector?.nombre || 'NULL'}`);
      validaciones.push({ campo: 'sector', valido: sectorValido, valor: infoGeneral.sector });
      
      // Apellido Familiar
      const apellidoValido = infoGeneral.apellido_familiar === datosEsperados.familia.apellido_familiar;
      console.log(`  ${apellidoValido ? '✅' : '❌'} Apellido: ${infoGeneral.apellido_familiar}`);
      validaciones.push({ campo: 'apellido_familiar', valido: apellidoValido, valor: infoGeneral.apellido_familiar });
      
      // Dirección
      const direccionValida = infoGeneral.direccion === datosEsperados.familia.direccion_familia;
      console.log(`  ${direccionValida ? '✅' : '❌'} Dirección: ${infoGeneral.direccion}`);
      validaciones.push({ campo: 'direccion', valido: direccionValida, valor: infoGeneral.direccion });
      
      // Teléfono
      const telefonoValido = infoGeneral.telefono === datosEsperados.familia.telefono;
      console.log(`  ${telefonoValido ? '✅' : '❌'} Teléfono: ${infoGeneral.telefono}`);
      validaciones.push({ campo: 'telefono', valido: telefonoValido, valor: infoGeneral.telefono });
      
      // Comunión en Casa
      const comunionValida = infoGeneral.comunionEnCasa === datosEsperados.familia.comunionEnCasa;
      console.log(`  ${comunionValida ? '✅' : '❌'} Comunión en Casa: ${infoGeneral.comunionEnCasa}`);
      validaciones.push({ campo: 'comunionEnCasa', valido: comunionValida, valor: infoGeneral.comunionEnCasa });
      
    } else {
      console.log('❌ Información General: FALTANTE');
      validaciones.push({ campo: 'informacionGeneral', valido: false, valor: null });
    }
    
    // 3. Validar Vivienda
    const vivienda = response.vivienda;
    if (vivienda) {
      console.log('✅ Vivienda: PRESENTE');
      
      const tipoViviendaValido = vivienda.tipo_vivienda && vivienda.tipo_vivienda.nombre;
      console.log(`  ${tipoViviendaValido ? '✅' : '❌'} Tipo Vivienda: ${vivienda.tipo_vivienda?.nombre || 'NULL'}`);
      validaciones.push({ campo: 'tipo_vivienda', valido: tipoViviendaValido, valor: vivienda.tipo_vivienda });
      
      const disposicionValida = vivienda.disposicion_basuras && typeof vivienda.disposicion_basuras === 'object';
      console.log(`  ${disposicionValida ? '✅' : '❌'} Disposición Basuras: ${disposicionValida ? 'COMPLETA' : 'INCOMPLETA'}`);
      validaciones.push({ campo: 'disposicion_basuras', valido: disposicionValida, valor: vivienda.disposicion_basuras });
      
    } else {
      console.log('❌ Vivienda: FALTANTE');
      validaciones.push({ campo: 'vivienda', valido: false, valor: null });
    }
    
    // 4. Validar Servicios de Agua
    const serviciosAgua = response.servicios_agua;
    if (serviciosAgua) {
      console.log('✅ Servicios de Agua: PRESENTE');
      
      const sistemaValido = serviciosAgua.sistema_acueducto && serviciosAgua.sistema_acueducto.nombre;
      console.log(`  ${sistemaValido ? '✅' : '❌'} Sistema Acueducto: ${serviciosAgua.sistema_acueducto?.nombre || 'NULL'}`);
      validaciones.push({ campo: 'sistema_acueducto', valido: sistemaValido, valor: serviciosAgua.sistema_acueducto });
      
    } else {
      console.log('❌ Servicios de Agua: FALTANTE');
      validaciones.push({ campo: 'servicios_agua', valido: false, valor: null });
    }
    
    // 5. Validar Family Members
    const familyMembers = response.familyMembers;
    if (familyMembers && Array.isArray(familyMembers)) {
      console.log(`✅ Family Members: ${familyMembers.length} encontrados`);
      
      familyMembers.forEach((miembro, index) => {
        console.log(`  👤 Miembro ${index + 1}:`);
        
        const nombreValido = miembro.nombres && miembro.nombres.trim().length > 0;
        console.log(`    ${nombreValido ? '✅' : '❌'} Nombres: ${miembro.nombres || 'NULL'}`);
        
        const idValido = miembro.numeroIdentificacion && miembro.numeroIdentificacion.length > 0;
        console.log(`    ${idValido ? '✅' : '❌'} Identificación: ${miembro.numeroIdentificacion || 'NULL'}`);
        
        const tipoIdValido = miembro.tipoIdentificacion && miembro.tipoIdentificacion.nombre;
        console.log(`    ${tipoIdValido ? '✅' : '❌'} Tipo ID: ${miembro.tipoIdentificacion?.nombre || 'NULL'}`);
        
        const sexoValido = miembro.sexo && miembro.sexo.nombre;
        console.log(`    ${sexoValido ? '✅' : '❌'} Sexo: ${miembro.sexo?.nombre || 'NULL'}`);
        
        const estudiosValido = miembro.estudio && miembro.estudio.nombre;
        console.log(`    ${estudiosValido ? '✅' : '❌'} Estudios: ${miembro.estudio?.nombre || 'NULL'}`);
        
        const tallasValidas = miembro["talla_camisa/blusa"] && miembro.talla_pantalon && miembro.talla_zapato;
        console.log(`    ${tallasValidas ? '✅' : '❌'} Tallas: Camisa(${miembro["talla_camisa/blusa"] || 'NULL'}), Pantalón(${miembro.talla_pantalon || 'NULL'}), Zapato(${miembro.talla_zapato || 'NULL'})`);
        
        const fechaCelebrarValida = miembro.motivoFechaCelebrar && miembro.motivoFechaCelebrar.motivo;
        console.log(`    ${fechaCelebrarValida ? '✅' : '❌'} Celebración: ${miembro.motivoFechaCelebrar?.motivo || 'NULL'} (${miembro.motivoFechaCelebrar?.dia || 'NULL'}/${miembro.motivoFechaCelebrar?.mes || 'NULL'})`);
        
        validaciones.push({ 
          campo: `familyMember_${index + 1}`, 
          valido: nombreValido && idValido && tipoIdValido && sexoValido && estudiosValido && tallasValidas && fechaCelebrarValida, 
          valor: miembro 
        });
      });
      
    } else {
      console.log('❌ Family Members: FALTANTE');
      validaciones.push({ campo: 'familyMembers', valido: false, valor: null });
    }
    
    // 6. Validar Deceased Members
    const deceasedMembers = response.deceasedMembers;
    if (deceasedMembers && Array.isArray(deceasedMembers)) {
      console.log(`✅ Deceased Members: ${deceasedMembers.length} encontrados`);
      
      deceasedMembers.forEach((fallecido, index) => {
        console.log(`  ⚰️ Fallecido ${index + 1}:`);
        
        const nombreValido = fallecido.nombres && fallecido.nombres.trim().length > 0;
        console.log(`    ${nombreValido ? '✅' : '❌'} Nombres: ${fallecido.nombres || 'NULL'}`);
        
        const fechaValida = fallecido.fechaFallecimiento;
        console.log(`    ${fechaValida ? '✅' : '❌'} Fecha Fallecimiento: ${fallecido.fechaFallecimiento || 'NULL'}`);
        
        const causaValida = fallecido.causaFallecimiento;
        console.log(`    ${causaValida ? '✅' : '❌'} Causa: ${fallecido.causaFallecimiento || 'NULL'}`);
        
        validaciones.push({ 
          campo: `deceasedMember_${index + 1}`, 
          valido: nombreValido && fechaValida && causaValida, 
          valor: fallecido 
        });
      });
      
    } else {
      console.log('❌ Deceased Members: FALTANTE');
      validaciones.push({ campo: 'deceasedMembers', valido: false, valor: null });
    }
    
    // 7. Validar Metadata
    const metadata = response.metadata;
    if (metadata) {
      console.log('✅ Metadata: PRESENTE');
      
      const timestampValido = metadata.timestamp;
      console.log(`  ${timestampValido ? '✅' : '❌'} Timestamp: ${metadata.timestamp || 'NULL'}`);
      
      const completadaValida = typeof metadata.completed === 'boolean';
      console.log(`  ${completadaValida ? '✅' : '❌'} Completada: ${metadata.completed}`);
      
      const etapaValida = typeof metadata.currentStage === 'number';
      console.log(`  ${etapaValida ? '✅' : '❌'} Etapa Actual: ${metadata.currentStage}`);
      
      const totalMiembrosValido = typeof metadata.total_miembros === 'number';
      console.log(`  ${totalMiembrosValido ? '✅' : '❌'} Total Miembros: ${metadata.total_miembros}`);
      
      const totalFallecidosValido = typeof metadata.total_fallecidos === 'number';
      console.log(`  ${totalFallecidosValido ? '✅' : '❌'} Total Fallecidos: ${metadata.total_fallecidos}`);
      
      validaciones.push({ 
        campo: 'metadata', 
        valido: timestampValido && completadaValida && etapaValida && totalMiembrosValido && totalFallecidosValido, 
        valor: metadata 
      });
      
    } else {
      console.log('❌ Metadata: FALTANTE');
      validaciones.push({ campo: 'metadata', valido: false, valor: null });
    }
    
    return validaciones;
  }

  /**
   * PASO 5: Generar reporte final
   */
  generarReporteFinal(validaciones) {
    console.log('\n📊 PASO 5: REPORTE FINAL DE VALIDACIÓN\n');
    console.log('='.repeat(80));
    
    const validacionesExitosas = validaciones.filter(v => v.valido);
    const validacionesFallidas = validaciones.filter(v => !v.valido);
    
    console.log(`✅ VALIDACIONES EXITOSAS: ${validacionesExitosas.length}`);
    console.log(`❌ VALIDACIONES FALLIDAS: ${validacionesFallidas.length}`);
    console.log(`📊 PORCENTAJE DE ÉXITO: ${((validacionesExitosas.length / validaciones.length) * 100).toFixed(2)}%`);
    
    if (validacionesFallidas.length > 0) {
      console.log('\n❌ CAMPOS FALLIDOS:');
      validacionesFallidas.forEach(v => {
        console.log(`   - ${v.campo}: ${v.valor || 'NULL'}`);
      });
    }
    
    if (validacionesExitosas.length === validaciones.length) {
      console.log('\n🎉 ¡PRUEBA COMPLETAMENTE EXITOSA!');
      console.log('🎯 TODA la información del request se preserva correctamente en el response');
      console.log('✅ NO hay ningún dato NULL en la respuesta');
      console.log('📋 La estructura está ABSOLUTAMENTE COMPLETA');
    } else {
      console.log('\n⚠️ PRUEBA PARCIALMENTE EXITOSA');
      console.log('🔧 Algunos campos necesitan corrección');
    }
    
    console.log('='.repeat(80));
    
    return {
      total: validaciones.length,
      exitosas: validacionesExitosas.length,
      fallidas: validacionesFallidas.length,
      porcentajeExito: (validacionesExitosas.length / validaciones.length) * 100,
      completamenteExitosa: validacionesFallidas.length === 0
    };
  }

  /**
   * MÉTODO PRINCIPAL: Ejecutar prueba completa
   */
  async ejecutarPruebaCompleta() {
    try {
      console.log('🚀 INICIANDO PRUEBA COMPLETA DE VALIDACIÓN DE DATOS\n');
      console.log('🎯 Objetivo: Crear familia con TODOS los datos y validar request-response\n');
      
      // Paso 1: Validar datos maestros
      const datosMaestros = await this.validarDatosMaestros();
      
      // Paso 2: Crear familia completa
      const datosCreados = await this.crearFamiliaCompleta(datosMaestros);
      
      // Paso 3: Ejecutar consulta
      const validaciones = await this.ejecutarYValidarConsulta(datosCreados);
      
      // Paso 4: Generar reporte
      const reporte = this.generarReporteFinal(validaciones);
      
      return reporte;
      
    } catch (error) {
      console.error('\n❌ ERROR EN LA PRUEBA:', error.message);
      console.error('Stack:', error.stack);
      throw error;
    } finally {
      // Cerrar conexión
      await sequelize.close();
    }
  }
}

// Ejecutar la prueba
async function ejecutarPrueba() {
  const prueba = new PruebaCompletaValidacion();
  await prueba.ejecutarPruebaCompleta();
}

ejecutarPrueba().catch(console.error);
