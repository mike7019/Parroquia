/**
 * 🔧 CONFIGURACIÓN COMPARTIDA PARA SEEDERS
 * Centraliza la configuración de conexión a la base de datos
 */

export const dbConfig = {
  // Configuración del servidor remoto
  remote: {
    dialect: 'postgres',
    host: '206.62.139.100',
    port: 5433,
    database: 'parroquia_db',
    username: 'parroquia_user',
    password: 'ParroquiaSecure2025',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },

  // Configuración local (para desarrollo)
  local: {
    dialect: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'parroquia_db',
    username: 'postgres',
    password: 'postgres',
    logging: false
  }
};

// Configuración por defecto (usar remoto)
export const defaultConfig = dbConfig.remote;

// Información del servidor
export const serverInfo = {
  remoto: {
    host: '206.62.139.100',
    puerto: 5433,
    baseDatos: 'parroquia_db',
    usuario: 'parroquia_user',
    descripcion: 'Servidor de producción'
  },
  local: {
    host: 'localhost',
    puerto: 5432,
    baseDatos: 'parroquia_db',
    usuario: 'postgres',
    descripcion: 'Servidor de desarrollo local'
  }
};

// Utilidad para mostrar info de conexión
export function mostrarInfoConexion(config = defaultConfig) {
  console.log('📍 INFORMACIÓN DE CONEXIÓN:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Puerto: ${config.port}`);
  console.log(`   Base de datos: ${config.database}`);
  console.log(`   Usuario: ${config.username}`);
  console.log('');
}

// Utilidad para crear mensaje de encabezado
export function crearEncabezado(titulo, subtitulo = '') {
  const linea = '='.repeat(80);
  console.log(linea);
  console.log(titulo);
  if (subtitulo) {
    console.log(subtitulo);
  }
  console.log(linea);
  console.log('');
}

// Utilidad para crear tabla ASCII
export function crearTabla(columnas, filas) {
  const anchos = columnas.map((col, i) => {
    const anchoColumna = col.length;
    const anchoMaxDatos = Math.max(...filas.map(fila => String(fila[i] || '').length));
    return Math.max(anchoColumna, anchoMaxDatos);
  });

  const linea = '┌' + anchos.map(a => '─'.repeat(a + 2)).join('┬') + '┐';
  const separador = '├' + anchos.map(a => '─'.repeat(a + 2)).join('┼') + '┤';
  const lineaFinal = '└' + anchos.map(a => '─'.repeat(a + 2)).join('┴') + '┘';

  console.log(linea);
  
  // Encabezado
  const encabezado = '│ ' + columnas.map((col, i) => 
    col.padEnd(anchos[i], ' ')
  ).join(' │ ') + ' │';
  console.log(encabezado);
  console.log(separador);

  // Filas
  filas.forEach(fila => {
    const filaStr = '│ ' + fila.map((dato, i) => 
      String(dato || '').padEnd(anchos[i], ' ')
    ).join(' │ ') + ' │';
    console.log(filaStr);
  });

  console.log(lineaFinal);
}

export default {
  dbConfig,
  defaultConfig,
  serverInfo,
  mostrarInfoConexion,
  crearEncabezado,
  crearTabla
};
