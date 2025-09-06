const { Sequelize, DataTypes } = require('sequelize');

// Configuración de la base de datos
const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'parroquia_db',
  username: process.env.DB_USER || 'parroquia_user',
  password: process.env.DB_PASSWORD || 'ParroquiaSecure2025',
  dialect: 'postgres',
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Definir modelos simplificados para diagnóstico
const Departamento = sequelize.define('Departamento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  codigo: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'departamentos',
  timestamps: true
});

const Municipio = sequelize.define('Municipio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  codigo: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  departamentoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'departamentos',
      key: 'id'
    }
  }
}, {
  tableName: 'municipios',
  timestamps: true
});

const Parroquia = sequelize.define('Parroquia', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  codigo: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  municipioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'municipios',
      key: 'id'
    }
  }
}, {
  tableName: 'parroquias',
  timestamps: true
});

const Sector = sequelize.define('Sector', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  codigo: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  parroquiaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'parroquias',
      key: 'id'
    }
  }
}, {
  tableName: 'sectores',
  timestamps: true
});

const Vereda = sequelize.define('Vereda', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  codigo: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  sectorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'sectores',
      key: 'id'
    }
  }
}, {
  tableName: 'veredas',
  timestamps: true
});

// Establecer asociaciones
Departamento.hasMany(Municipio, { foreignKey: 'departamentoId' });
Municipio.belongsTo(Departamento, { foreignKey: 'departamentoId' });

Municipio.hasMany(Parroquia, { foreignKey: 'municipioId' });
Parroquia.belongsTo(Municipio, { foreignKey: 'municipioId' });

Parroquia.hasMany(Sector, { foreignKey: 'parroquiaId' });
Sector.belongsTo(Parroquia, { foreignKey: 'parroquiaId' });

Sector.hasMany(Vereda, { foreignKey: 'sectorId' });
Vereda.belongsTo(Sector, { foreignKey: 'sectorId' });

async function diagnosticarProblemaVereda() {
  try {
    console.log('🔍 Iniciando diagnóstico del problema de veredas...\n');

    // 1. Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa\n');

    // 2. Verificar estructura de tablas
    console.log('📋 Verificando estructura de tablas...');
    
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('Tablas existentes:', tables);
    
    // 3. Verificar datos en cada nivel geográfico
    console.log('\n📊 Verificando datos geográficos...');
    
    const departamentos = await Departamento.findAll();
    console.log(`Departamentos: ${departamentos.length}`);
    
    const municipios = await Municipio.findAll();
    console.log(`Municipios: ${municipios.length}`);
    
    const parroquias = await Parroquia.findAll();
    console.log(`Parroquias: ${parroquias.length}`);
    
    const sectores = await Sector.findAll();
    console.log(`Sectores: ${sectores.length}`);
    
    const veredas = await Vereda.findAll();
    console.log(`Veredas: ${veredas.length}`);

    // 4. Verificar si hay datos básicos mínimos
    if (departamentos.length === 0) {
      console.log('\n❌ PROBLEMA: No hay departamentos en la base de datos');
      return false;
    }

    if (municipios.length === 0) {
      console.log('\n❌ PROBLEMA: No hay municipios en la base de datos');
      return false;
    }

    if (parroquias.length === 0) {
      console.log('\n❌ PROBLEMA: No hay parroquias en la base de datos');
      return false;
    }

    if (sectores.length === 0) {
      console.log('\n❌ PROBLEMA: No hay sectores en la base de datos');
      console.log('💡 SOLUCIÓN: Se necesita crear al menos un sector para poder crear veredas');
      return false;
    }

    // 5. Verificar estructura de campos requeridos
    console.log('\n🔧 Verificando estructura de la tabla veredas...');
    
    const veredaAttributes = await sequelize.getQueryInterface().describeTable('veredas');
    console.log('Campos de la tabla veredas:', Object.keys(veredaAttributes));

    // 6. Intentar crear una vereda de prueba
    console.log('\n🧪 Probando crear una vereda de prueba...');
    
    const primerSector = await Sector.findOne();
    if (!primerSector) {
      console.log('❌ No hay sectores disponibles para asociar la vereda');
      return false;
    }

    console.log(`Usando sector: ${primerSector.nombre} (ID: ${primerSector.id})`);

    try {
      const veredaPrueba = await Vereda.create({
        nombre: 'Vereda Prueba Diagnóstico',
        codigo: 'VPD001',
        sectorId: primerSector.id
      });
      
      console.log('✅ Vereda de prueba creada exitosamente:', veredaPrueba.toJSON());
      
      // Eliminar la vereda de prueba
      await veredaPrueba.destroy();
      console.log('🗑️ Vereda de prueba eliminada');
      
      return true;
      
    } catch (error) {
      console.log('❌ Error al crear vereda de prueba:', error.message);
      console.log('Detalles del error:', error);
      return false;
    }

  } catch (error) {
    console.error('❌ Error en el diagnóstico:', error);
    return false;
  }
}

async function crearDatosBasicos() {
  try {
    console.log('\n🏗️ Creando datos geográficos básicos...');

    // Crear departamento si no existe
    const [departamento] = await Departamento.findOrCreate({
      where: { codigo: 'DEP001' },
      defaults: {
        nombre: 'Departamento Principal',
        codigo: 'DEP001'
      }
    });

    // Crear municipio si no existe
    const [municipio] = await Municipio.findOrCreate({
      where: { codigo: 'MUN001' },
      defaults: {
        nombre: 'Municipio Principal',
        codigo: 'MUN001',
        departamentoId: departamento.id
      }
    });

    // Crear parroquia si no existe
    const [parroquia] = await Parroquia.findOrCreate({
      where: { nombre: 'Parroquia Principal' },
      defaults: {
        nombre: 'Parroquia Principal',
        codigo: 'PAR001',
        municipioId: municipio.id
      }
    });

    // Crear sector si no existe
    const [sector] = await Sector.findOrCreate({
      where: { nombre: 'Sector Principal' },
      defaults: {
        nombre: 'Sector Principal',
        codigo: 'SEC001',
        parroquiaId: parroquia.id
      }
    });

    console.log('✅ Datos geográficos básicos creados/verificados:');
    console.log(`- Departamento: ${departamento.nombre} (ID: ${departamento.id})`);
    console.log(`- Municipio: ${municipio.nombre} (ID: ${municipio.id})`);
    console.log(`- Parroquia: ${parroquia.nombre} (ID: ${parroquia.id})`);
    console.log(`- Sector: ${sector.nombre} (ID: ${sector.id})`);

    return { departamento, municipio, parroquia, sector };

  } catch (error) {
    console.error('❌ Error creando datos básicos:', error);
    throw error;
  }
}

async function main() {
  try {
    const problemaResuelto = await diagnosticarProblemaVereda();
    
    if (!problemaResuelto) {
      console.log('\n🔧 Intentando resolver el problema...');
      await crearDatosBasicos();
      
      console.log('\n🔄 Ejecutando diagnóstico nuevamente...');
      const segundoIntento = await diagnosticarProblemaVereda();
      
      if (segundoIntento) {
        console.log('\n✅ ¡Problema resuelto! Ahora puedes crear veredas.');
      } else {
        console.log('\n❌ El problema persiste. Revisa los logs para más detalles.');
      }
    } else {
      console.log('\n✅ Todo está funcionando correctamente para crear veredas.');
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  diagnosticarProblemaVereda,
  crearDatosBasicos,
  sequelize,
  models: { Departamento, Municipio, Parroquia, Sector, Vereda }
};
