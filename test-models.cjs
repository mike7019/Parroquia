import sequelize from './config/sequelize.js';
import Sexo from './models/Sexo.js';
import Persona from './models/Persona.js';

async function testModels() {
    try {
        console.log('🧪 Iniciando pruebas de modelos...');
        
        // Probar obtener todos los sexos
        console.log('\n📊 Consultando tabla sexos:');
        const sexos = await Sexo.findAll();
        console.log('Total de sexos:', sexos.length);
        sexos.forEach(sexo => {
            console.log(`- ${sexo.nombre} (${sexo.codigo}): ${sexo.descripcion}`);
        });
        
        // Probar contar personas
        console.log('\n👥 Consultando tabla personas:');
        const totalPersonas = await Persona.count();
        console.log('Total de personas:', totalPersonas);
        
        // Probar obtener personas con su sexo
        if (totalPersonas > 0) {
            console.log('\n🔍 Consultando primeras 5 personas con su sexo:');
            const personas = await Persona.findAll({
                include: [{
                    model: Sexo,
                    as: 'sexo'
                }],
                limit: 5
            });
            
            personas.forEach(persona => {
                const sexoNombre = persona.sexo ? persona.sexo.nombre : 'No especificado';
                console.log(`- ${persona.primer_nombre} ${persona.primer_apellido}: ${sexoNombre}`);
            });
        }
        
        // Probar métodos helper de Persona
        if (totalPersonas > 0) {
            console.log('\n🔧 Probando métodos helper:');
            const primeraPersona = await Persona.findOne({
                include: [{
                    model: Sexo,
                    as: 'sexo'
                }]
            });
            
            if (primeraPersona) {
                console.log(`- ${primeraPersona.primer_nombre} es masculino: ${primeraPersona.esMasculino()}`);
                console.log(`- ${primeraPersona.primer_nombre} es femenino: ${primeraPersona.esFemenino()}`);
                console.log(`- Sexo de ${primeraPersona.primer_nombre}: ${primeraPersona.getSexoNombre()}`);
            }
        }
        
        console.log('\n✅ Pruebas completadas exitosamente');
        
    } catch (error) {
        console.error('❌ Error en las pruebas:', error.message);
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

testModels();
