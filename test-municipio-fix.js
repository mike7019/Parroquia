import dotenv from 'dotenv';
import Municipios from './src/models/catalog/Municipios.js';
import Departamentos from './src/models/catalog/Departamentos.js';
import Veredas from './src/models/catalog/Veredas.js';
import sequelize from './config/sequelize.js';

// Cargar variables de entorno
dotenv.config();

async function testMunicipioCreation() {
  try {
    console.log('🔍 Probando creación de municipio...');
    
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
    
    // Intentar crear un municipio
    console.log('📝 Creando municipio de prueba...');
    const municipio = await Municipios.create({
      nombre_municipio: 'Municipio de Prueba',
      codigo_dane: '05001',
      id_departamento: departamento.id_departamento
    });
    
    console.log('✅ Municipio creado exitosamente:');
    console.log(`   ID: ${municipio.id_municipio}`);
    console.log(`   Nombre: ${municipio.nombre_municipio}`);
    console.log(`   Código DANE: ${municipio.codigo_dane}`);
    console.log(`   Created At: ${municipio.created_at}`);
    console.log(`   Updated At: ${municipio.updated_at}`);
    
    // Limpiar - eliminar el municipio de prueba
    console.log('🧹 Limpiando datos de prueba...');
    await municipio.destroy();
    console.log('✅ Municipio de prueba eliminado');
    
    console.log('\n🎉 ¡PROBLEMA RESUELTO! El municipio se creó correctamente con timestamps.');
    
  } catch (error) {
    console.error('❌ Error al crear municipio:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
    console.log('🔚 Conexión cerrada');
  }
}

// Ejecutar la prueba
testMunicipioCreation().catch(console.error);
