'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🔄 PASO 2: Eliminando campos redundantes...');
    
    // 1. Migrar datos del campo sexo a id_sexo_sexo antes de eliminar
    console.log('   - Migrando datos de campo sexo...');
    
    // Actualizar registros que no tengan id_sexo_sexo basándose en el campo sexo
    await queryInterface.bulkUpdate('personas',
      { id_sexo_sexo: 1 }, // Masculino
      { 
        sexo: { [Sequelize.Op.iLike]: '%masculino%' },
        id_sexo_sexo: null 
      }
    );

    await queryInterface.bulkUpdate('personas',
      { id_sexo_sexo: 1 }, // Masculino
      { 
        sexo: { [Sequelize.Op.iLike]: '%hombre%' },
        id_sexo_sexo: null 
      }
    );

    await queryInterface.bulkUpdate('personas',
      { id_sexo_sexo: 2 }, // Femenino
      { 
        sexo: { [Sequelize.Op.iLike]: '%femenino%' },
        id_sexo_sexo: null 
      }
    );

    await queryInterface.bulkUpdate('personas',
      { id_sexo_sexo: 2 }, // Femenino
      { 
        sexo: { [Sequelize.Op.iLike]: '%mujer%' },
        id_sexo_sexo: null 
      }
    );

    // Para cualquier registro que aún no tenga id_sexo_sexo, asignar masculino por defecto
    await queryInterface.bulkUpdate('personas',
      { id_sexo_sexo: 1 },
      { id_sexo_sexo: null }
    );

    console.log('   ✅ Datos migrados del campo sexo a id_sexo_sexo');

    // 2. Eliminar campo sexo redundante
    try {
      await queryInterface.removeColumn('personas', 'sexo');
      console.log('   ✅ Campo sexo redundante eliminado de personas');
    } catch (error) {
      console.log(`   ⚠️ Error eliminando campo sexo: ${error.message}`);
    }

    console.log('✅ Eliminación de campos redundantes completada');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Revirtiendo eliminación de campos redundantes...');
    
    // Recrear campo sexo en personas
    await queryInterface.addColumn('personas', 'sexo', {
      type: Sequelize.STRING(255),
      allowNull: false,
      defaultValue: 'Masculino',
    });

    // Restaurar datos del campo sexo basándose en id_sexo_sexo
    await queryInterface.bulkUpdate('personas',
      { sexo: 'Masculino' },
      { id_sexo_sexo: 1 }
    );

    await queryInterface.bulkUpdate('personas',
      { sexo: 'Femenino' },
      { id_sexo_sexo: 2 }
    );

    console.log('✅ Reversión completada');
  }
};
