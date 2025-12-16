import { execSync } from 'child_process';
import dotenv from 'dotenv';
import { Client } from 'pg';

// Load test environment
dotenv.config({ path: '.env.test' });

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

console.log(`${colors.blue}
╔═══════════════════════════════════════════════════╗
║     🧪 Verificación de Entorno de Pruebas       ║
╚═══════════════════════════════════════════════════╝
${colors.reset}`);

let allChecksPass = true;

// Check 1: Node.js version
console.log('\n📦 Verificando Node.js...');
try {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion >= 18) {
    console.log(`${colors.green}✓ Node.js ${nodeVersion} (OK)${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠ Node.js ${nodeVersion} (Recomendado: 18+)${colors.reset}`);
  }
} catch (error) {
  console.log(`${colors.red}✗ Error al verificar Node.js${colors.reset}`);
  allChecksPass = false;
}

// Check 2: Environment variables
console.log('\n🔧 Verificando variables de entorno...');
const requiredEnvVars = [
  'DB_NAME',
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

let envVarsOk = true;
for (const envVar of requiredEnvVars) {
  if (process.env[envVar]) {
    console.log(`${colors.green}✓ ${envVar}${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ ${envVar} (Falta)${colors.reset}`);
    envVarsOk = false;
    allChecksPass = false;
  }
}

// Check 3: PostgreSQL connection
console.log('\n🗄️  Verificando conexión a PostgreSQL...');
const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'postgres' // Connect to default database first
});

try {
  await client.connect();
  console.log(`${colors.green}✓ Conexión a PostgreSQL establecida${colors.reset}`);
  
  // Check if test database exists
  const result = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [process.env.DB_NAME]
  );
  
  if (result.rows.length > 0) {
    console.log(`${colors.green}✓ Base de datos '${process.env.DB_NAME}' existe${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠ Base de datos '${process.env.DB_NAME}' no existe${colors.reset}`);
    console.log(`${colors.yellow}  Creando base de datos...${colors.reset}`);
    
    try {
      await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
      console.log(`${colors.green}✓ Base de datos creada exitosamente${colors.reset}`);
    } catch (createError) {
      console.log(`${colors.red}✗ Error al crear base de datos: ${createError.message}${colors.reset}`);
      allChecksPass = false;
    }
  }
  
  await client.end();
} catch (error) {
  console.log(`${colors.red}✗ Error de conexión: ${error.message}${colors.reset}`);
  console.log(`${colors.yellow}  Verifica que PostgreSQL esté corriendo y las credenciales sean correctas${colors.reset}`);
  allChecksPass = false;
}

// Check 4: Dependencies
console.log('\n📚 Verificando dependencias...');
try {
  const packageJson = await import('../package.json', { assert: { type: 'json' } });
  const requiredDeps = ['jest', 'supertest', 'sequelize', 'express'];
  
  for (const dep of requiredDeps) {
    if (packageJson.default.devDependencies?.[dep] || packageJson.default.dependencies?.[dep]) {
      console.log(`${colors.green}✓ ${dep}${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ ${dep} (No instalado)${colors.reset}`);
      allChecksPass = false;
    }
  }
} catch (error) {
  console.log(`${colors.red}✗ Error al verificar dependencias${colors.reset}`);
  allChecksPass = false;
}

// Check 5: Test files
console.log('\n📝 Verificando archivos de prueba...');
const testFiles = [
  'tests/user.test.js',
  'tests/setup.js',
  'jest.config.js',
  '.env.test'
];

for (const file of testFiles) {
  try {
    await import('fs').then(fs => {
      if (fs.existsSync(file)) {
        console.log(`${colors.green}✓ ${file}${colors.reset}`);
      } else {
        console.log(`${colors.red}✗ ${file} (No encontrado)${colors.reset}`);
        allChecksPass = false;
      }
    });
  } catch (error) {
    console.log(`${colors.red}✗ ${file} (Error)${colors.reset}`);
    allChecksPass = false;
  }
}

// Final summary
console.log(`\n${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);

if (allChecksPass) {
  console.log(`${colors.green}
✓ Todas las verificaciones pasaron exitosamente!

Puedes ejecutar las pruebas con:
  npm test              - Ejecutar todas las pruebas
  npm run test:user     - Ejecutar solo pruebas de usuarios
  npm run test:coverage - Ejecutar con reporte de cobertura
${colors.reset}`);
  process.exit(0);
} else {
  console.log(`${colors.red}
✗ Algunas verificaciones fallaron.

Por favor, corrige los errores antes de ejecutar las pruebas.
Consulta tests/README.md para más información.
${colors.reset}`);
  process.exit(1);
}
