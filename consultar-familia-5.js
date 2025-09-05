import * as models from './src/models/index.js';

async function consultarFamilia5() {
  try {
    console.log('🔍 Consultando familia con ID 5...');
    
    // Buscar la familia con ID 5
    const familia = await models.Familias.findByPk(5);
    
    if (familia) {
      console.log('📋 DATOS DE LA FAMILIA:');
      console.log('================================');
      console.log('ID Familia:', familia.id_familia);
      console.log('Apellido Familiar:', familia.apellido_familiar);
      console.log('Dirección:', familia.direccion_familia);
      console.log('Teléfono:', familia.telefono);
      console.log('Código Familia:', familia.codigo_familia);
      console.log('Tamaño Familia:', familia.tamaño_familia);
      console.log('Tipo Vivienda:', familia.tipo_vivienda);
      console.log('Estado Encuesta:', familia.estado_encuesta);
      console.log('Número Encuestas:', familia.numero_encuestas);
      console.log('Fecha Última Encuesta:', familia.fecha_ultima_encuesta);
      console.log('Comunión en Casa:', familia.comunionEnCasa);
      console.log('Número Contrato EPM:', familia.numero_contrato_epm);
      console.log('');
      
      console.log('🌍 UBICACIÓN GEOGRÁFICA:');
      console.log('=========================');
      console.log('ID Municipio:', familia.id_municipio);
      console.log('ID Vereda:', familia.id_vereda);
      console.log('ID Sector:', familia.id_sector);
      console.log('ID Parroquia:', familia.id_parroquia);
      console.log('');
      
      // Buscar los datos geográficos relacionados
      if (familia.id_municipio) {
        const municipio = await models.Municipios.findByPk(familia.id_municipio);
        console.log('📍 Municipio:', municipio?.nombre_municipio || 'No encontrado');
      }
      
      if (familia.id_vereda) {
        const vereda = await models.Veredas.findByPk(familia.id_vereda);
        console.log('🏘️ Vereda:', vereda?.nombre || 'No encontrada');
      }
      
      if (familia.id_sector) {
        const sector = await models.Sectores.findByPk(familia.id_sector);
        console.log('🏢 Sector:', sector?.nombre || 'No encontrado');
      }
      
      if (familia.id_parroquia) {
        const parroquia = await models.Parroquias.findByPk(familia.id_parroquia);
        console.log('⛪ Parroquia:', parroquia?.nombre || 'No encontrada');
      }
      
      console.log('');
      console.log('👥 MIEMBROS DE LA FAMILIA:');
      console.log('==========================');
      
      // Buscar personas de esta familia
      const personas = await models.Personas.findAll({
        where: { id_familia: familia.id_familia }
      });
      
      if (personas.length > 0) {
        personas.forEach((persona, index) => {
          console.log(`Persona ${index + 1}:`);
          console.log('  - Nombres:', persona.primer_nombre, persona.segundo_nombre || '');
          console.log('  - Apellidos:', persona.primer_apellido, persona.segundo_apellido || '');
          console.log('  - Documento:', persona.tipo_documento, persona.numero_documento);
          console.log('  - Fecha Nacimiento:', persona.fecha_nacimiento);
          console.log('  - Sexo:', persona.sexo);
          console.log('  - Teléfono:', persona.telefono);
          console.log('  - Parentesco:', persona.parentesco);
          console.log('  - Profesión:', persona.profesion);
          console.log('  - Talla Camisa:', persona.talla_camisa);
          console.log('  - Talla Pantalón:', persona.talla_pantalon);
          console.log('  - Talla Zapato:', persona.talla_zapato);
          console.log('');
        });
      } else {
        console.log('No se encontraron personas para esta familia');
      }
      
      console.log('💀 MIEMBROS FALLECIDOS:');
      console.log('========================');
      
      // Buscar difuntos de esta familia
      const difuntos = await models.DifuntosFamilia.findAll({
        where: { id_familia: familia.id_familia }
      });
      
      if (difuntos.length > 0) {
        difuntos.forEach((difunto, index) => {
          console.log(`Difunto ${index + 1}:`);
          console.log('  - Nombres:', difunto.nombres_difunto);
          console.log('  - Fecha Fallecimiento:', difunto.fecha_fallecimiento);
          console.log('  - Sexo:', difunto.sexo);
          console.log('  - Parentesco:', difunto.parentesco);
          console.log('  - Causa Fallecimiento:', difunto.causa_fallecimiento);
          console.log('');
        });
      } else {
        console.log('No se encontraron difuntos para esta familia');
      }
      
      // Mostrar respuesta completa en formato JSON
      console.log('📄 RESPUESTA COMPLETA EN JSON:');
      console.log('===============================');
      
      const responseData = {
        familia: {
          id_familia: familia.id_familia,
          apellido_familiar: familia.apellido_familiar,
          direccion_familia: familia.direccion_familia,
          telefono: familia.telefono,
          codigo_familia: familia.codigo_familia,
          tamaño_familia: familia.tamaño_familia,
          tipo_vivienda: familia.tipo_vivienda,
          estado_encuesta: familia.estado_encuesta,
          numero_encuestas: familia.numero_encuestas,
          fecha_ultima_encuesta: familia.fecha_ultima_encuesta,
          comunionEnCasa: familia.comunionEnCasa,
          numero_contrato_epm: familia.numero_contrato_epm,
          ubicacion_geografica: {
            id_municipio: familia.id_municipio,
            id_vereda: familia.id_vereda,
            id_sector: familia.id_sector,
            id_parroquia: familia.id_parroquia
          }
        },
        personas: personas.map(p => ({
          primer_nombre: p.primer_nombre,
          segundo_nombre: p.segundo_nombre,
          primer_apellido: p.primer_apellido,
          segundo_apellido: p.segundo_apellido,
          tipo_documento: p.tipo_documento,
          numero_documento: p.numero_documento,
          fecha_nacimiento: p.fecha_nacimiento,
          sexo: p.sexo,
          telefono: p.telefono,
          parentesco: p.parentesco,
          profesion: p.profesion,
          talla_camisa: p.talla_camisa,
          talla_pantalon: p.talla_pantalon,
          talla_zapato: p.talla_zapato
        })),
        difuntos: difuntos.map(d => ({
          nombres_difunto: d.nombres_difunto,
          fecha_fallecimiento: d.fecha_fallecimiento,
          sexo: d.sexo,
          parentesco: d.parentesco,
          causa_fallecimiento: d.causa_fallecimiento
        }))
      };
      
      console.log(JSON.stringify(responseData, null, 2));
      
    } else {
      console.log('❌ No se encontró la familia con ID 5');
    }
    
  } catch (error) {
    console.error('❌ Error consultando familia:', error.message);
  } finally {
    process.exit(0);
  }
}

consultarFamilia5();
