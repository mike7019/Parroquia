import dotenv from 'dotenv';
import { Municipios, Departamentos } from './src/models/catalog/index.js';
import sequelize from './config/sequelize.js';

// Cargar variables de entorno
dotenv.config();

async function testMunicipioAPI() {
  try {
    console.log('🔍 Probando API de municipios...');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');
    
    // Crear un departamento primero (si no existe)
    console.log('📝 Creando/obteniendo departamento...');
    const [departamento] = await Departamentos.findOrCreate({
      where: { codigo_dane: '05' },
      defaults: {
        nombre: 'Antioquia',
        codigo_dane: '05'
      }
    });
    console.log(`✅ Departamento: ${departamento.nombre} (ID: ${departamento.id_departamento})`);
    
    // Intentar crear un municipio con relación
    console.log('📝 Creando municipio con relación...');
    const municipio = await Municipios.create({
      nombre_municipio: 'Municipio API Test',
      codigo_dane: '05002',
      id_departamento: departamento.id_departamento
    });
    
    // Buscar el municipio con la relación incluida
    console.log('🔍 Buscando municipio con departamento...');
    const municipioCompleto = await Municipios.findByPk(municipio.id_municipio, {
      include: [{
        model: Departamentos,
        as: 'departamento',
        attributes: ['id_departamento', 'nombre', 'codigo_dane']
      }]
    });
    
    console.log('✅ Municipio creado y consultado exitosamente:');
    console.log(`   ID: ${municipioCompleto.id_municipio}`);
    console.log(`   Nombre: ${municipioCompleto.nombre_municipio}`);
    console.log(`   Código DANE: ${municipioCompleto.codigo_dane}`);
    console.log(`   Created At: ${municipioCompleto.created_at}`);
    console.log(`   Updated At: ${municipioCompleto.updated_at}`);
    
    if (municipioCompleto.departamento) {
      console.log('   Departamento:');
      console.log(`     ID: ${municipioCompleto.departamento.id_departamento}`);
      console.log(`     Nombre: ${municipioCompleto.departamento.nombre}`);
      console.log(`     Código DANE: ${municipioCompleto.departamento.codigo_dane}`);
    }
    
    // Limpiar - eliminar el municipio de prueba
    console.log('🧹 Limpiando datos de prueba...');
    await municipio.destroy();
    console.log('✅ Municipio de prueba eliminado');
    
    console.log('\n🎉 ¡API DE MUNICIPIOS FUNCIONANDO CORRECTAMENTE!');
    
  } catch (error) {
    console.error('❌ Error en API de municipios:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
    console.log('🔚 Conexión cerrada');
  }
}

// Ejecutar la prueba
testMunicipioAPI().catch(console.error);
