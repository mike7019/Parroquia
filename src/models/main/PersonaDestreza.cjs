'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class PersonaDestreza extends Model {
        static associate(models) {
            // Define associations here
            PersonaDestreza.belongsTo(models.Persona, {
                foreignKey: 'id_personas_personas',
                as: 'persona'
            });
            PersonaDestreza.belongsTo(models.Destreza, {
                foreignKey: 'id_destrezas_destrezas',
                as: 'destreza'
            });
        }
    }

    PersonaDestreza.init({
        id_personas_personas: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'personas',
                key: 'id_persona'
            }
        },
        id_destrezas_destrezas: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            references: {
                model: 'destrezas',
                key: 'id_destreza' // Assuming id_destreza is the PK of destrezas
            }
        }
    }, {
        sequelize,
        modelName: 'PersonaDestreza',
        tableName: 'persona_destreza',
        timestamps: true // createdAt, updatedAt exist
    });

    return PersonaDestreza;
};
