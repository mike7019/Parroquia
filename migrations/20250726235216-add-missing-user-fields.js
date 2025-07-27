'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add phone field
    await queryInterface.addColumn('users', 'phone', {
      type: Sequelize.STRING(20),
      allowNull: true
    });

    // Add sector field  
    await queryInterface.addColumn('users', 'sector', {
      type: Sequelize.STRING(100),
      allowNull: true
    });

    // Add surveysCompleted field
    await queryInterface.addColumn('users', 'surveys_completed', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    // Update role enum to include new values if they don't exist
    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        -- Check if coordinator exists and add if not
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum 
          WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_users_role') 
          AND enumlabel = 'coordinator'
        ) THEN
          ALTER TYPE "public"."enum_users_role" ADD VALUE 'coordinator';
        END IF;
        
        -- Check if surveyor exists and add if not  
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum 
          WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_users_role') 
          AND enumlabel = 'surveyor'
        ) THEN
          ALTER TYPE "public"."enum_users_role" ADD VALUE 'surveyor';
        END IF;
      END $$;
    `);
  },

  async down(queryInterface, Sequelize) {
    // Remove added columns
    await queryInterface.removeColumn('users', 'phone');
    await queryInterface.removeColumn('users', 'sector');
    await queryInterface.removeColumn('users', 'surveys_completed');
    
    // Note: Can't easily remove enum values in PostgreSQL without dropping and recreating the type
    // which would require dropping all tables using it. Leaving enum values as is.
  }
};
