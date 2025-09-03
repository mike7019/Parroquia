import sequelize from './config/sequelize.js';
import { loadAllModels } from './syncDatabaseComplete.js';

async function seedAllBasicData() {
    try {
        console.log('🌱 Iniciando seeder general de datos básicos...');
        
        // Cargar modelos
        await loadAllModels();
        const models = sequelize.models;
        
        // Datos básicos para departamentos
        const departamentosData = [
            { nombre: 'Antioquia', codigo_dane: '05' },
            { nombre: 'Cundinamarca', codigo_dane: '25' },
            { nombre: 'Valle del Cauca', codigo_dane: '76' },
            { nombre: 'Atlántico', codigo_dane: '08' },
            { nombre: 'Santander', codigo_dane: '68' }
        ];

        // Crear departamentos
        console.log('📍 Creando departamentos...');
        const departamentos = [];
        for (const depData of departamentosData) {
            const [departamento] = await models.Departamentos.findOrCreate({
                where: { codigo_dane: depData.codigo_dane },
                defaults: depData
            });
            departamentos.push(departamento);
            console.log(`   ✅ ${departamento.nombre}`);
        }

        // Datos básicos para municipios
        const municipiosData = [
            { nombre_municipio: 'Medellín', codigo_dane: '05001', id_departamento: departamentos[0].id_departamento },
            { nombre_municipio: 'Bello', codigo_dane: '05088', id_departamento: departamentos[0].id_departamento },
            { nombre_municipio: 'Itagüí', codigo_dane: '05360', id_departamento: departamentos[0].id_departamento },
            { nombre_municipio: 'Envigado', codigo_dane: '05266', id_departamento: departamentos[0].id_departamento },
            { nombre_municipio: 'Bogotá D.C.', codigo_dane: '11001', id_departamento: departamentos[1].id_departamento },
            { nombre_municipio: 'Cali', codigo_dane: '76001', id_departamento: departamentos[2].id_departamento },
            { nombre_municipio: 'Barranquilla', codigo_dane: '08001', id_departamento: departamentos[3].id_departamento },
            { nombre_municipio: 'Bucaramanga', codigo_dane: '68001', id_departamento: departamentos[4].id_departamento }
        ];

        // Crear municipios
        console.log('🏘️ Creando municipios...');
        const municipios = [];
        for (const munData of municipiosData) {
            const [municipio] = await models.Municipios.findOrCreate({
                where: { codigo_dane: munData.codigo_dane },
                defaults: munData
            });
            municipios.push(municipio);
            console.log(`   ✅ ${municipio.nombre_municipio}`);
        }

        // Datos básicos para parroquias
        const parroquiasData = [
            { nombre: 'San José', id_municipio: municipios[0].id_municipio }, // Medellín
            { nombre: 'Sagrado Corazón', id_municipio: municipios[0].id_municipio },
            { nombre: 'La Candelaria', id_municipio: municipios[0].id_municipio },
            { nombre: 'San Antonio', id_municipio: municipios[1].id_municipio }, // Bello
            { nombre: 'Nuestra Señora del Carmen', id_municipio: municipios[2].id_municipio }, // Itagüí
            { nombre: 'San Rafael', id_municipio: municipios[3].id_municipio }, // Envigado
            { nombre: 'Catedral Primada', id_municipio: municipios[4].id_municipio }, // Bogotá
            { nombre: 'San Pedro Claver', id_municipio: municipios[5].id_municipio }, // Cali
            { nombre: 'Inmaculada Concepción', id_municipio: municipios[6].id_municipio }, // Barranquilla
            { nombre: 'Sagrada Familia', id_municipio: municipios[7].id_municipio } // Bucaramanga
        ];

        // Crear parroquias
        console.log('⛪ Creando parroquias...');
        const parroquias = [];
        for (const parData of parroquiasData) {
            const [parroquia] = await models.Parroquia.findOrCreate({
                where: { nombre: parData.nombre, id_municipio: parData.id_municipio },
                defaults: parData
            });
            parroquias.push(parroquia);
            console.log(`   ✅ ${parroquia.nombre}`);
        }

        // Datos básicos para sectores
        const sectoresData = [
            { nombre: 'Centro', id_municipio: municipios[0].id_municipio },
            { nombre: 'Poblado', id_municipio: municipios[0].id_municipio },
            { nombre: 'Laureles', id_municipio: municipios[0].id_municipio },
            { nombre: 'Belén', id_municipio: municipios[0].id_municipio },
            { nombre: 'Envigado Centro', id_municipio: municipios[3].id_municipio },
            { nombre: 'Zona Rosa', id_municipio: municipios[4].id_municipio },
            { nombre: 'Norte', id_municipio: municipios[5].id_municipio }
        ];

        // Crear sectores
        console.log('🏛️ Creando sectores...');
        const sectores = [];
        for (const secData of sectoresData) {
            const [sector] = await models.Sector.findOrCreate({
                where: { nombre: secData.nombre, id_municipio: secData.id_municipio },
                defaults: secData
            });
            sectores.push(sector);
            console.log(`   ✅ ${sector.nombre}`);
        }

        // Datos básicos para veredas
        const veredasData = [
            { nombre: 'La Macarena', codigo_vereda: 'MAC001', id_municipio_municipios: municipios[0].id_municipio },
            { nombre: 'El Retiro', codigo_vereda: 'RET001', id_municipio_municipios: municipios[0].id_municipio },
            { nombre: 'Buenos Aires', codigo_vereda: 'BUE001', id_municipio_municipios: municipios[0].id_municipio },
            { nombre: 'Villa Hermosa', codigo_vereda: 'VIH001', id_municipio_municipios: municipios[0].id_municipio },
            { nombre: 'Manrique', codigo_vereda: 'MAN001', id_municipio_municipios: municipios[0].id_municipio }
        ];

        // Crear veredas
        console.log('🌾 Creando veredas...');
        const veredas = [];
        for (const verData of veredasData) {
            const [vereda] = await models.Veredas.findOrCreate({
                where: { codigo_vereda: verData.codigo_vereda },
                defaults: verData
            });
            veredas.push(vereda);
            console.log(`   ✅ ${vereda.nombre}`);
        }

        // Datos básicos para tipos de identificación
        const tiposIdentificacionData = [
            { nombre: 'Cédula de Ciudadanía', codigo: 'CC', descripcion: 'Cédula de ciudadanía colombiana' },
            { nombre: 'Tarjeta de Identidad', codigo: 'TI', descripcion: 'Tarjeta de identidad para menores' },
            { nombre: 'Cédula de Extranjería', codigo: 'CE', descripcion: 'Documento para extranjeros residentes' },
            { nombre: 'Pasaporte', codigo: 'PA', descripcion: 'Pasaporte nacional o extranjero' },
            { nombre: 'Registro Civil', codigo: 'RC', descripcion: 'Registro civil de nacimiento' }
        ];

        // Crear tipos de identificación
        console.log('🆔 Creando tipos de identificación...');
        for (const tipoData of tiposIdentificacionData) {
            const [tipo] = await models.TipoIdentificacion.findOrCreate({
                where: { codigo: tipoData.codigo },
                defaults: tipoData
            });
            console.log(`   ✅ ${tipo.nombre}`);
        }

        // Datos básicos para sexos
        const sexosData = [
            { descripcion: 'Masculino' },
            { descripcion: 'Femenino' },
            { descripcion: 'Otro' }
        ];

        // Crear sexos
        console.log('👥 Creando tipos de sexo...');
        for (const sexoData of sexosData) {
            const [sexo] = await models.Sexo.findOrCreate({
                where: { descripcion: sexoData.descripcion },
                defaults: sexoData
            });
            console.log(`   ✅ ${sexo.descripcion}`);
        }

        // Datos básicos para situaciones civiles
        const situacionesCivilesData = [
            { nombre: 'Soltero(a)', codigo: 'SOL', descripcion: 'Persona soltera' },
            { nombre: 'Casado Civil', codigo: 'CC', descripcion: 'Casado por lo civil' },
            { nombre: 'Casado Religioso', codigo: 'CR', descripcion: 'Casado por la iglesia' },
            { nombre: 'Unión Libre', codigo: 'UL', descripcion: 'En unión libre o concubinato' },
            { nombre: 'Divorciado(a)', codigo: 'DIV', descripcion: 'Persona divorciada' },
            { nombre: 'Viudo(a)', codigo: 'VIU', descripcion: 'Persona viuda' },
            { nombre: 'Separado(a)', codigo: 'SEP', descripcion: 'Separado de hecho' }
        ];

        // Crear situaciones civiles
        console.log('💑 Creando situaciones civiles...');
        for (const sitData of situacionesCivilesData) {
            const [situacion] = await models.SituacionCivil.findOrCreate({
                where: { codigo: sitData.codigo },
                defaults: sitData
            });
            console.log(`   ✅ ${situacion.nombre}`);
        }

        // Datos básicos para niveles educativos
        const estudiosData = [
            { nivel: 'Sin estudios', descripcion: 'Persona sin estudios formales', orden_nivel: 1 },
            { nivel: 'Primaria Incompleta', descripcion: 'Primaria sin terminar', orden_nivel: 2 },
            { nivel: 'Primaria Completa', descripcion: 'Primaria completa', orden_nivel: 3 },
            { nivel: 'Secundaria Incompleta', descripcion: 'Bachillerato sin terminar', orden_nivel: 4 },
            { nivel: 'Secundaria Completa', descripcion: 'Bachillerato completo', orden_nivel: 5 },
            { nivel: 'Técnico', descripcion: 'Formación técnica', orden_nivel: 6 },
            { nivel: 'Tecnológico', descripcion: 'Formación tecnológica', orden_nivel: 7 },
            { nivel: 'Universitario', descripcion: 'Formación universitaria', orden_nivel: 8 },
            { nivel: 'Especialización', descripcion: 'Estudios de especialización', orden_nivel: 9 },
            { nivel: 'Maestría', descripcion: 'Estudios de maestría', orden_nivel: 10 },
            { nivel: 'Doctorado', descripcion: 'Estudios de doctorado', orden_nivel: 11 }
        ];

        // Crear niveles educativos
        console.log('🎓 Creando niveles educativos...');
        for (const estudioData of estudiosData) {
            const [estudio] = await models.Estudio.findOrCreate({
                where: { nivel: estudioData.nivel },
                defaults: estudioData
            });
            console.log(`   ✅ ${estudio.nivel}`);
        }

        // Datos básicos para parentescos
        const parentescosData = [
            { nombre: 'Jefe de Hogar', descripcion: 'Cabeza de familia o responsable del hogar' },
            { nombre: 'Cónyuge', descripcion: 'Esposo(a) o compañero(a)' },
            { nombre: 'Hijo(a)', descripcion: 'Hijo o hija' },
            { nombre: 'Padre', descripcion: 'Padre' },
            { nombre: 'Madre', descripcion: 'Madre' },
            { nombre: 'Hermano(a)', descripcion: 'Hermano o hermana' },
            { nombre: 'Abuelo(a)', descripcion: 'Abuelo o abuela' },
            { nombre: 'Nieto(a)', descripcion: 'Nieto o nieta' },
            { nombre: 'Tío(a)', descripcion: 'Tío o tía' },
            { nombre: 'Sobrino(a)', descripcion: 'Sobrino o sobrina' },
            { nombre: 'Primo(a)', descripcion: 'Primo o prima' },
            { nombre: 'Suegro(a)', descripcion: 'Suegro o suegra' },
            { nombre: 'Yerno/Nuera', descripcion: 'Yerno o nuera' },
            { nombre: 'Cuñado(a)', descripcion: 'Cuñado o cuñada' },
            { nombre: 'Otro', descripcion: 'Otro parentesco no especificado' }
        ];

        // Crear parentescos
        console.log('👨‍👩‍👧‍👦 Creando parentescos...');
        for (const parentData of parentescosData) {
            const [parentesco] = await models.Parentesco.findOrCreate({
                where: { nombre: parentData.nombre },
                defaults: parentData
            });
            console.log(`   ✅ ${parentesco.nombre}`);
        }

        // Datos básicos para comunidades culturales
        const comunidadesData = [
            { nombre: 'Ninguna', descripcion: 'No pertenece a ninguna comunidad cultural específica' },
            { nombre: 'Afrodescendiente', descripcion: 'Comunidad afrodescendiente' },
            { nombre: 'Indígena', descripcion: 'Comunidad indígena' },
            { nombre: 'ROM (Gitano)', descripcion: 'Comunidad ROM o gitana' },
            { nombre: 'Raizal', descripcion: 'Comunidad raizal del archipiélago' },
            { nombre: 'Palenquero', descripcion: 'Comunidad palenquera' }
        ];

        // Crear comunidades culturales
        console.log('🎭 Creando comunidades culturales...');
        for (const comunidadData of comunidadesData) {
            const [comunidad] = await models.ComunidadCultural.findOrCreate({
                where: { nombre: comunidadData.nombre },
                defaults: comunidadData
            });
            console.log(`   ✅ ${comunidad.nombre}`);
        }

        // Datos básicos para enfermedades
        const enfermedadesData = [
            { nombre: 'Ninguna', descripcion: 'Sin enfermedades conocidas' },
            { nombre: 'Diabetes', descripcion: 'Diabetes mellitus' },
            { nombre: 'Hipertensión', descripcion: 'Presión arterial alta' },
            { nombre: 'Asma', descripcion: 'Enfermedad respiratoria' },
            { nombre: 'Artritis', descripcion: 'Inflamación de las articulaciones' },
            { nombre: 'Cáncer', descripcion: 'Enfermedad oncológica' },
            { nombre: 'Enfermedad Cardíaca', descripcion: 'Problemas del corazón' },
            { nombre: 'Discapacidad Física', descripcion: 'Limitación física' },
            { nombre: 'Discapacidad Mental', descripcion: 'Limitación mental o cognitiva' },
            { nombre: 'Otra', descripcion: 'Otra enfermedad no especificada' }
        ];

        // Crear enfermedades
        console.log('🏥 Creando enfermedades...');
        for (const enfermedadData of enfermedadesData) {
            const [enfermedad] = await models.Enfermedad.findOrCreate({
                where: { nombre: enfermedadData.nombre },
                defaults: enfermedadData
            });
            console.log(`   ✅ ${enfermedad.nombre}`);
        }

        // Datos básicos para tipos de vivienda
        const tiposViviendaData = [
            { nombre: 'Casa', descripcion: 'Casa independiente' },
            { nombre: 'Apartamento', descripcion: 'Apartamento en edificio' },
            { nombre: 'Finca', descripcion: 'Finca o casa de campo' },
            { nombre: 'Cuarto', descripcion: 'Cuarto en inquilinato' },
            { nombre: 'Casa Lote', descripcion: 'Casa en lote propio' },
            { nombre: 'Otro', descripcion: 'Otro tipo de vivienda' }
        ];

        // Crear tipos de vivienda
        console.log('🏠 Creando tipos de vivienda...');
        for (const tipoViviendaData of tiposViviendaData) {
            const [tipoVivienda] = await models.TipoVivienda.findOrCreate({
                where: { nombre: tipoViviendaData.nombre },
                defaults: tipoViviendaData
            });
            console.log(`   ✅ ${tipoVivienda.nombre}`);
        }

        // Datos básicos para tipos de disposición de basura
        const tiposDisposicionData = [
            { nombre: 'Recolector Público', descripcion: 'Recolección por empresa pública' },
            { nombre: 'Recolector Privado', descripcion: 'Recolección por empresa privada' },
            { nombre: 'Quemada', descripcion: 'Se quema la basura' },
            { nombre: 'Enterrada', descripcion: 'Se entierra la basura' },
            { nombre: 'Reciclaje', descripcion: 'Se recicla la basura' },
            { nombre: 'Aire Libre', descripcion: 'Se bota al aire libre' }
        ];

        // Crear tipos de disposición de basura
        console.log('🗑️ Creando tipos de disposición de basura...');
        for (const tipoData of tiposDisposicionData) {
            const [tipo] = await models.TipoDisposicionBasura.findOrCreate({
                where: { nombre: tipoData.nombre },
                defaults: tipoData
            });
            console.log(`   ✅ ${tipo.nombre}`);
        }

        // Datos básicos para tipos de aguas residuales
        const tiposAguasData = [
            { nombre: 'Alcantarillado', descripcion: 'Conexión a red de alcantarillado' },
            { nombre: 'Pozo Séptico', descripcion: 'Tratamiento en pozo séptico' },
            { nombre: 'Letrina', descripcion: 'Disposición en letrina' },
            { nombre: 'Campo Abierto', descripcion: 'Disposición al campo abierto' },
            { nombre: 'Río o Quebrada', descripcion: 'Disposición en fuente hídrica' }
        ];

        // Crear tipos de aguas residuales
        console.log('💧 Creando tipos de aguas residuales...');
        for (const tipoData of tiposAguasData) {
            const [tipo] = await models.TipoAguasResiduales.findOrCreate({
                where: { nombre: tipoData.nombre },
                defaults: tipoData
            });
            console.log(`   ✅ ${tipo.nombre}`);
        }

        console.log('\n🎉 ¡Seeder general completado exitosamente!');
        console.log('\n📊 Resumen de datos creados:');
        console.log(`   📍 Departamentos: ${departamentosData.length}`);
        console.log(`   🏘️ Municipios: ${municipiosData.length}`);
        console.log(`   ⛪ Parroquias: ${parroquiasData.length}`);
        console.log(`   🏛️ Sectores: ${sectoresData.length}`);
        console.log(`   🌾 Veredas: ${veredasData.length}`);
        console.log(`   🆔 Tipos de Identificación: ${tiposIdentificacionData.length}`);
        console.log(`   👥 Sexos: ${sexosData.length}`);
        console.log(`   💑 Situaciones Civiles: ${situacionesCivilesData.length}`);
        console.log(`   🎓 Niveles Educativos: ${estudiosData.length}`);
        console.log(`   👨‍👩‍👧‍👦 Parentescos: ${parentescosData.length}`);
        console.log(`   🎭 Comunidades Culturales: ${comunidadesData.length}`);
        console.log(`   🏥 Enfermedades: ${enfermedadesData.length}`);
        console.log(`   🏠 Tipos de Vivienda: ${tiposViviendaData.length}`);
        console.log(`   🗑️ Tipos Disposición Basura: ${tiposDisposicionData.length}`);
        console.log(`   💧 Tipos Aguas Residuales: ${tiposAguasData.length}`);
        
        console.log('\n✅ Base de datos lista para recibir encuestas!');

    } catch (error) {
        console.error('❌ Error en seeder general:', error.message);
        console.error(error.stack);
    } finally {
        process.exit(0);
    }
}

seedAllBasicData();
