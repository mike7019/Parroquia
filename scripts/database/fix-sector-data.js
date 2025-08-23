// Script para limpiar datos existentes y sincronizar el modelo Sector
import sequelize from './config/sequelize.js';
import Sector from './src/models/catalog/Sector.js';
import Municipios from './src/models/catalog/Municipios.js';

async function fixSectorData() {
  try {
    console.log('🔧 Reparando datos de la tabla sectores...\n');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Verificar datos existentes
    const existingSectors = await sequelize.query(
      'SELECT id_sector, nombre, id_municipio FROM sectores',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    console.log(`\n📊 Sectores existentes: ${existingSectors.length}`);
    
    if (existingSectors.length > 0) {
      const nullMunicipios = existingSectors.filter(s => s.id_municipio === null);
      
      if (nullMunicipios.length > 0) {
        console.log(`⚠️  Sectores con id_municipio nulo: ${nullMunicipios.length}`);
        console.log('Sectores afectados:');
        nullMunicipios.forEach(sector => {
          console.log(`  - ID: ${sector.id_sector}, Nombre: ${sector.nombre}`);
        });
        
        // Mostrar municipios disponibles
        const municipios = await sequelize.query(
          'SELECT id_municipio, nombre_municipio FROM municipios ORDER BY nombre_municipio',
          { type: sequelize.QueryTypes.SELECT }
        );
        
        console.log('\n🏛️ Municipios disponibles:');
        municipios.forEach(mun => {
          console.log(`  - ID: ${mun.id_municipio}, Nombre: ${mun.nombre_municipio}`);
        });
        
        // Buscar un municipio por defecto
        const defaultMunicipio = municipios[0];
        
        if (defaultMunicipio) {
          console.log(`\n🔄 Asignando municipio por defecto: ${defaultMunicipio.nombre_municipio}`);
          
          const updateResult = await sequelize.query(
            'UPDATE sectores SET id_municipio = :municipioId WHERE id_municipio IS NULL',
            {
              replacements: { municipioId: defaultMunicipio.id_municipio },
              type: sequelize.QueryTypes.UPDATE
            }
          );
          
          console.log(`✅ ${updateResult[1]} sectores actualizados con municipio por defecto`);
        } else {
          console.log('❌ No hay municipios disponibles para asignar');
          return;
        }
      } else {
        console.log('✅ Todos los sectores ya tienen municipio asignado');
      }
    }
    
    // Verificar que no hay más valores nulos
    const nullCheck = await sequelize.query(
      'SELECT COUNT(*) as count FROM sectores WHERE id_municipio IS NULL',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (parseInt(nullCheck[0].count) === 0) {
      console.log('\n✅ No hay valores nulos en id_municipio');
      
      // Ahora sincronizar el modelo
      console.log('\n🔧 Sincronizando modelo Sector...');
      
      // Definir asociaciones primero
      if (!Sector.associations.municipio) {
        Sector.belongsTo(Municipios, {
          foreignKey: 'id_municipio',
          as: 'municipio'
        });
      }

      if (!Municipios.associations.sectores) {
        Municipios.hasMany(Sector, {
          foreignKey: 'id_municipio',
          as: 'sectores'
        });
      }
      
      await Sector.sync({ alter: true });
      console.log('✅ Modelo Sector sincronizado exitosamente');
      
      // Verificar la estructura final
      console.log('\n📋 Verificando estructura final...');
      const tableInfo = await sequelize.query(
        `SELECT column_name, data_type, is_nullable, column_default 
         FROM information_schema.columns 
         WHERE table_name = 'sectores' 
         ORDER BY ordinal_position`,
        { type: sequelize.QueryTypes.SELECT }
      );
      
      console.log('Estructura de la tabla sectores:');
      tableInfo.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      
    } else {
      console.log(`❌ Aún hay ${nullCheck[0].count} registros con id_municipio nulo`);
    }
    
  } catch (error) {
    console.error('❌ Error durante la reparación:', error.message);
    if (error.sql) {
      console.error('SQL Query:', error.sql);
    }
  } finally {
    await sequelize.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Ejecutar reparación
fixSectorData();
