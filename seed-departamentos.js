import { Departamentos } from './src/models/catalog/index.js';

async function seedDepartamentos() {
  try {
    const departamentosData = [
      // Departamentos ordenados por código DANE
      { nombre: 'Amazonas', codigo_dane: '91' },
      { nombre: 'Antioquia', codigo_dane: '05' },
      { nombre: 'Arauca', codigo_dane: '81' },
      { nombre: 'Atlántico', codigo_dane: '08' },
      { nombre: 'Bogotá D.C.', codigo_dane: '11' },
      { nombre: 'Bolívar', codigo_dane: '13' },
      { nombre: 'Boyacá', codigo_dane: '15' },
      { nombre: 'Caldas', codigo_dane: '17' },
      { nombre: 'Caquetá', codigo_dane: '18' },
      { nombre: 'Casanare', codigo_dane: '85' },
      { nombre: 'Cauca', codigo_dane: '19' },
      { nombre: 'Cesar', codigo_dane: '20' },
      { nombre: 'Chocó', codigo_dane: '27' },
      { nombre: 'Córdoba', codigo_dane: '23' },
      { nombre: 'Cundinamarca', codigo_dane: '25' },
      { nombre: 'Guainía', codigo_dane: '94' },
      { nombre: 'Guaviare', codigo_dane: '95' },
      { nombre: 'Huila', codigo_dane: '41' },
      { nombre: 'La Guajira', codigo_dane: '44' },
      { nombre: 'Magdalena', codigo_dane: '47' },
      { nombre: 'Meta', codigo_dane: '50' },
      { nombre: 'Nariño', codigo_dane: '52' },
      { nombre: 'Norte de Santander', codigo_dane: '54' },
      { nombre: 'Putumayo', codigo_dane: '86' },
      { nombre: 'Quindío', codigo_dane: '63' },
      { nombre: 'Risaralda', codigo_dane: '66' },
      { nombre: 'San Andrés y Providencia', codigo_dane: '88' },
      { nombre: 'Santander', codigo_dane: '68' },
      { nombre: 'Sucre', codigo_dane: '70' },
      { nombre: 'Tolima', codigo_dane: '73' },
      { nombre: 'Valle del Cauca', codigo_dane: '76' },
      { nombre: 'Vaupés', codigo_dane: '97' },
      { nombre: 'Vichada', codigo_dane: '99' }
    ];

    console.log('Creando los 32 departamentos de Colombia...');
    
    for (const dept of departamentosData) {
      try {
        const [departamento, created] = await Departamentos.findOrCreate({
          where: { codigo_dane: dept.codigo_dane },
          defaults: dept
        });
        
        if (created) {
          console.log(`✅ Creado: ${dept.nombre} (${dept.codigo_dane})`);
        } else {
          console.log(`ℹ️  Ya existe: ${dept.nombre} (${dept.codigo_dane})`);
        }
      } catch (error) {
        console.error(`❌ Error creando ${dept.nombre}:`, error.message);
      }
    }
    
    // Show all departamentos
    const allDepartamentos = await Departamentos.findAll({ order: [['codigo_dane', 'ASC']] });
    console.log('\n📋 Todos los departamentos:');
    allDepartamentos.forEach(d => {
      console.log(`- ID: ${d.id_departamento}, ${d.nombre} (${d.codigo_dane})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

seedDepartamentos();
