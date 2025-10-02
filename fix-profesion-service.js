// Script para aplicar fix manualmente a profesionService
import fs from 'fs';

const servicePath = 'src/services/catalog/profesionService.js';
const originalContent = fs.readFileSync(servicePath, 'utf8');

// Función findNextAvailableId para profesiones
const findNextAvailableIdFunction = `
  /**
   * Find the next available ID by checking for gaps in the sequence
   */
  async findNextAvailableId() {
    try {
      const Profesion = this.getModel();
      
      // Get all existing IDs ordered
      const existingRecords = await Profesion.findAll({
        attributes: ['id_profesion'],
        order: [['id_profesion', 'ASC']],
        raw: true
      });

      if (existingRecords.length === 0) {
        return 1; // Start with 1 if no records exist
      }

      const existingIds = existingRecords.map(record => parseInt(record.id_profesion));
      
      // Find the first gap in the sequence
      for (let i = 1; i <= existingIds.length + 1; i++) {
        if (!existingIds.includes(i)) {
          return i;
        }
      }

      // If no gaps found, return the next sequential number
      return Math.max(...existingIds) + 1;
    } catch (error) {
      throw new Error(\`Error finding next available ID: \${error.message}\`);
    }
  }
`;

// Insertar la función después del método getModel()
let modifiedContent = originalContent.replace(
  /(\s+getModel\(\)\s*{[^}]+}\s*)/,
  `$1${findNextAvailableIdFunction}`
);

// Modificar el método createProfesion para usar el nuevo ID
modifiedContent = modifiedContent.replace(
  /(const nuevaProfesion = await Profesion\.create\(\s*{)/,
  `// Find the next available ID
      const nextId = await this.findNextAvailableId();
      
      $1
        id_profesion: nextId,`
);

// Escribir el archivo modificado
fs.writeFileSync(servicePath, modifiedContent);
console.log('✅ Fix aplicado a profesionService.js');

// Mostrar las diferencias principales
console.log('\n📝 Cambios aplicados:');
console.log('1. ✅ Agregada función findNextAvailableId()');
console.log('2. ✅ Modificado createProfesion() para usar ID reutilizable');
console.log('3. ⏳ Pendiente: Deshabilitar autoIncrement en modelo Profesion');