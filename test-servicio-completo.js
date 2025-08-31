import sequelize from './config/sequelize.js';
import FamiliasConsultasService from './src/services/familiasConsultasService.js';

const familiasService = new FamiliasConsultasService();

async function probarServicioCompleto() {
  console.log('🚀 Iniciando prueba del servicio completo de familias...\n');
  
  try {
    // Configurar asociaciones básicas
    console.log('⚙️ Configurando asociaciones...');
    
    // Probar consulta con información completa
    console.log('🔍 Consultando familias con información completa...');
    const resultado = await familiasService.consultarFamiliasConPadresMadres({
      limite: 2
    });
    
    console.log('✅ Consulta exitosa');
    console.log(`📊 Total encontradas: ${resultado.total}`);
    
    if (resultado.datos && resultado.datos.length > 0) {
      const primeraFamilia = resultado.datos[0];
      console.log('\n📋 Estructura de la primera familia:');
      console.log('🆔 ID Encuesta:', primeraFamilia.id_encuesta);
      console.log('👨‍👩‍👧‍👦 Apellido:', primeraFamilia.informacionGeneral?.apellido_familiar);
      
      console.log('\n🏠 Información General:');
      console.log('📍 Municipio:', JSON.stringify(primeraFamilia.informacionGeneral?.municipio, null, 2));
      console.log('⛪ Parroquia:', JSON.stringify(primeraFamilia.informacionGeneral?.parroquia, null, 2));
      console.log('🏘️ Sector:', JSON.stringify(primeraFamilia.informacionGeneral?.sector, null, 2));
      console.log('🌾 Vereda:', JSON.stringify(primeraFamilia.informacionGeneral?.vereda, null, 2));
      console.log('📞 Teléfono:', primeraFamilia.informacionGeneral?.telefono);
      console.log('🏠 Comunión en Casa:', primeraFamilia.informacionGeneral?.comunionEnCasa);
      
      console.log('\n🏡 Vivienda:');
      console.log('🏠 Tipo:', JSON.stringify(primeraFamilia.vivienda?.tipo_vivienda, null, 2));
      console.log('🗑️ Disposición Basuras:', JSON.stringify(primeraFamilia.vivienda?.disposicion_basuras, null, 2));
      
      console.log('\n💧 Servicios de Agua:');
      console.log('🚰 Sistema:', JSON.stringify(primeraFamilia.servicios_agua?.sistema_acueducto, null, 2));
      
      console.log('\n👥 Miembros de la Familia:');
      if (primeraFamilia.familyMembers && primeraFamilia.familyMembers.length > 0) {
        const primerMiembro = primeraFamilia.familyMembers[0];
        console.log('👤 Primer miembro:');
        console.log('  📛 Nombres:', primerMiembro.nombres);
        console.log('  🆔 Identificación:', JSON.stringify(primerMiembro.tipoIdentificacion, null, 2));
        console.log('  ⚥ Sexo:', JSON.stringify(primerMiembro.sexo, null, 2));
        console.log('  📚 Estudio:', JSON.stringify(primerMiembro.estudio, null, 2));
        console.log('  💼 Profesión:', JSON.stringify(primerMiembro.profesion, null, 2));
        console.log('  👔 Tallas:', {
          camisa: primerMiembro["talla_camisa/blusa"],
          pantalon: primerMiembro.talla_pantalon,
          zapato: primerMiembro.talla_zapato
        });
        console.log('  🎂 Celebración:', JSON.stringify(primerMiembro.motivoFechaCelebrar, null, 2));
        console.log('  ℹ️ Info Adicional:', JSON.stringify(primerMiembro.informacion_adicional, null, 2));
      }
      
      console.log('\n⚰️ Miembros Fallecidos:');
      if (primeraFamilia.deceasedMembers && primeraFamilia.deceasedMembers.length > 0) {
        primeraFamilia.deceasedMembers.forEach((fallecido, index) => {
          console.log(`  ${index + 1}. ${fallecido.nombres}`);
          console.log(`     📅 Fecha: ${fallecido.fechaFallecimiento}`);
          console.log(`     👨‍👩‍👧‍👦 Parentesco: ${JSON.stringify(fallecido.parentesco, null, 2)}`);
          console.log(`     💔 Causa: ${fallecido.causaFallecimiento}`);
        });
      } else {
        console.log('  Sin miembros fallecidos registrados');
      }
      
      console.log('\n📊 Metadata:');
      console.log('  📅 Timestamp:', primeraFamilia.metadata?.timestamp);
      console.log('  ✅ Completada:', primeraFamilia.metadata?.completed);
      console.log('  📈 Etapa:', primeraFamilia.metadata?.currentStage);
      console.log('  👥 Total miembros:', primeraFamilia.metadata?.total_miembros);
      console.log('  ⚰️ Total fallecidos:', primeraFamilia.metadata?.total_fallecidos);
      console.log('  🔢 Versión:', primeraFamilia.metadata?.version);
      
      // Verificar estructura completa
      console.log('\n🔍 Verificación de estructura completa:');
      const tieneEstructuraCompleta = 
        primeraFamilia.informacionGeneral &&
        primeraFamilia.vivienda &&
        primeraFamilia.servicios_agua &&
        primeraFamilia.observaciones &&
        primeraFamilia.familyMembers &&
        primeraFamilia.metadata;
      
      console.log('✅ Estructura completa:', tieneEstructuraCompleta ? 'SÍ' : 'NO');
      
      // Verificar que tiene la misma estructura del request
      const estructuraEsperada = [
        'id_encuesta',
        'informacionGeneral',
        'vivienda', 
        'servicios_agua',
        'observaciones',
        'familyMembers',
        'deceasedMembers',
        'metadata'
      ];
      
      const estructuraPresente = estructuraEsperada.every(campo => campo in primeraFamilia);
      console.log('✅ Estructura igual al request:', estructuraPresente ? 'SÍ' : 'NO');
      
      if (!estructuraPresente) {
        console.log('❌ Campos faltantes:', estructuraEsperada.filter(campo => !(campo in primeraFamilia)));
      }
      
    } else {
      console.log('⚠️ No se encontraron familias para probar');
    }
    
    console.log('\n✅ Prueba completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    // Cerrar conexión
    await sequelize.close();
  }
}

// Ejecutar prueba
probarServicioCompleto();
