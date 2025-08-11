'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Primero verificamos si existe algún duplicado
    const duplicates = await queryInterface.sequelize.query(`
      SELECT nombre, COUNT(*) as count 
      FROM sistemas_acueducto 
      GROUP BY nombre 
      HAVING COUNT(*) > 1
    `, { type: Sequelize.QueryTypes.SELECT });

    if (duplicates.length > 0) {
      console.log('Duplicados encontrados:', duplicates);
      
      // Eliminar duplicados manteniendo solo el primer registro de cada nombre
      for (const duplicate of duplicates) {
        await queryInterface.sequelize.query(`
          DELETE FROM sistemas_acueducto 
          WHERE nombre = '${duplicate.nombre}' 
          AND id_sistema_acueducto NOT IN (
            SELECT MIN(id_sistema_acueducto) 
            FROM sistemas_acueducto 
            WHERE nombre = '${duplicate.nombre}'
          )
        `);
      }
    }

    // Agregar constraint único al campo nombre
    await queryInterface.addConstraint('sistemas_acueducto', {
      fields: ['nombre'],
      type: 'unique',
      name: 'sistemas_acueducto_nombre_unique'
    });

    console.log('Restricción única agregada al campo nombre de sistemas_acueducto');
  },

  async down(queryInterface, Sequelize) {
    // Remover la restricción única
    await queryInterface.removeConstraint('sistemas_acueducto', 'sistemas_acueducto_nombre_unique');
    console.log('Restricción única removida del campo nombre de sistemas_acueducto');
  }
};
