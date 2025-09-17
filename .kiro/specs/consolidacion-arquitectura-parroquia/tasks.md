# Implementation Plan - Consolidación y Limpieza de Arquitectura

- [ ] 1. Análisis y preparación del proyecto
  - Realizar inventario completo de modelos duplicados entre `/src/models/main/` y `/src/models/catalog/`
  - Documentar diferencias específicas entre versiones de cada modelo (campos, validaciones, asociaciones)
  - Mapear todas las importaciones y dependencias entre archivos del proyecto
  - Crear sistema de checkpoints para backup y rollback automático durante la migración
  - _Requirements: 1.1, 7.1_

- [ ] 1.1 Inventario de modelos duplicados
  - Analizar cada archivo en `/src/models/main/` (.cjs) y su contraparte en `/src/models/catalog/` (.js)
  - Crear matriz de comparación identificando diferencias en campos, validaciones y métodos
  - Documentar asociaciones de Sequelize definidas en cada versión
  - Identificar modelos únicos que no tienen duplicación
  - _Requirements: 1.1, 1.5_

- [ ] 1.2 Mapeo de dependencias y referencias
  - Escanear todos los archivos JavaScript/TypeScript para encontrar importaciones de modelos
  - Crear grafo de dependencias mostrando qué archivos importan qué modelos
  - Identificar dependencias circulares que necesiten refactorización
  - Documentar orden de migración para evitar referencias rotas
  - _Requirements: 5.1, 5.2_

- [ ] 1.3 Sistema de backup y rollback
  - Implementar clase `MigrationErrorHandler` con funciones de backup automático
  - Crear sistema de checkpoints que capture estado de archivos y base de datos
  - Desarrollar función de rollback automático en caso de errores
  - Probar sistema de backup/restore con archivos de prueba
  - _Requirements: 5.5, 6.5_

- [ ] 2. Creación de estructura de directorios unificada
  - Crear nueva estructura de directorios `/src/models/` con subcarpetas por dominio
  - Establecer convenciones de nomenclatura y organización para la nueva estructura
  - Crear archivo de índice centralizado para exportación de modelos
  - Documentar la nueva organización y sus beneficios
  - _Requirements: 4.1, 4.2, 4.4_

- [ ] 2.1 Crear estructura de modelos por dominio
  - Crear directorios `/src/models/core/`, `/src/models/geographic/`, `/src/models/catalog/`, `/src/models/survey/`
  - Establecer archivo `/src/models/associations/index.js` para centralizar relaciones
  - Crear `/src/models/index.js` como punto único de exportación de todos los modelos
  - Definir convenciones de nomenclatura consistentes (PascalCase, singular)
  - _Requirements: 4.1, 4.2_

- [ ] 2.2 Implementar sistema de asociaciones centralizado
  - Crear clase `AssociationManager` para definir todas las relaciones de Sequelize
  - Extraer todas las asociaciones existentes de modelos individuales
  - Centralizar definiciones de relaciones en archivo único
  - Implementar carga automática de asociaciones después de inicializar modelos
  - _Requirements: 4.1, 5.4_

- [ ] 3. Consolidación de modelos duplicados
  - Crear modelos unificados combinando funcionalidad de versiones `/main/` y `/catalog/`
  - Migrar campos, validaciones y métodos de ambas versiones a modelo consolidado
  - Actualizar todas las importaciones de modelos en controladores y servicios
  - Verificar que todas las operaciones de base de datos funcionen correctamente
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 3.1 Consolidar modelo Familia
  - Unificar `src/models/main/Familia.cjs` y `src/models/catalog/Familias.js` en `src/models/core/Familia.js`
  - Combinar todos los campos de ambas versiones manteniendo validaciones más estrictas
  - Preservar métodos de instancia y asociaciones de ambas versiones
  - Actualizar todas las importaciones de Familia en controladores y servicios
  - _Requirements: 1.1, 1.3, 5.1_

- [ ] 3.2 Consolidar modelo Persona
  - Unificar `src/models/main/Persona.cjs` y `src/models/catalog/Persona.js` en `src/models/core/Persona.js`
  - Combinar validaciones de identificación y métodos de sexo de ambas versiones
  - Preservar asociaciones con Familia, Enfermedad, Destreza y otros modelos
  - Actualizar importaciones en todos los controladores que usan Persona
  - _Requirements: 1.1, 1.3, 5.1_

- [ ] 3.3 Consolidar modelos geográficos
  - Unificar modelos Municipio, Departamento, Parroquia, Sector, Vereda en `/src/models/geographic/`
  - Combinar funcionalidad de búsqueda y asociaciones jerárquicas
  - Preservar optimizaciones de consultas geográficas existentes
  - Actualizar servicios de catálogos geográficos para usar modelos unificados
  - _Requirements: 1.1, 1.3, 5.1_

- [ ] 3.4 Consolidar modelos de catálogos
  - Unificar modelos de catálogos (Sexo, TipoIdentificacion, etc.) en `/src/models/catalog/`
  - Combinar validaciones y métodos de búsqueda de ambas versiones
  - Preservar funcionalidad de estadísticas y consultas especializadas
  - Actualizar controladores de catálogos para usar modelos unificados
  - _Requirements: 1.1, 1.3, 5.1_

- [ ] 4. Reorganización de controladores duplicados
  - Identificar y mapear controladores duplicados entre `/controllers/` y `/controllers/consolidados/`
  - Crear controladores unificados que combinen funcionalidad de versiones duplicadas
  - Actualizar rutas para apuntar a controladores consolidados
  - Mantener compatibilidad con todos los endpoints existentes
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 4.1 Consolidar controladores de familias
  - Unificar `familiasConsultasController.js` y `consolidados/familiasConsolidadoController.js`
  - Crear `src/controllers/survey/FamiliaController.js` con funcionalidad combinada
  - Preservar todos los endpoints: GET, POST, PUT, DELETE para familias
  - Mantener funcionalidad de consultas avanzadas y estadísticas
  - _Requirements: 2.1, 2.2, 2.5_

- [ ] 4.2 Consolidar controladores de difuntos
  - Unificar `difuntosController.js` y `consolidados/difuntosConsolidadoController.js`
  - Crear `src/controllers/survey/DifuntoController.js` con lógica consolidada
  - Preservar funcionalidad de registro de difuntos y consultas por familia
  - Mantener endpoints de estadísticas de mortalidad
  - _Requirements: 2.1, 2.2, 2.5_

- [ ] 4.3 Reorganizar controladores de catálogos
  - Consolidar múltiples controladores de catálogos en estructura organizada
  - Crear controladores especializados por dominio (geográfico, demográfico, etc.)
  - Implementar patrón estándar de CRUD para todos los controladores de catálogos
  - Mantener funcionalidad de búsqueda y estadísticas existente
  - _Requirements: 2.1, 2.2, 2.4_

- [ ] 4.4 Actualizar sistema de rutas
  - Consolidar archivos de rutas duplicados entre `/routes/` y `/routes/consolidados/`
  - Crear enrutador principal que organice rutas por dominio funcional
  - Mantener compatibilidad con URLs existentes para no romper integraciones
  - Implementar middleware de validación consistente en todas las rutas
  - _Requirements: 2.3, 2.4, 5.2_

- [ ] 5. Limpieza y organización de scripts
  - Catalogar todos los scripts dispersos en el directorio raíz del proyecto
  - Crear estructura organizada `/scripts/` con subcategorías por función
  - Mover scripts a ubicaciones apropiadas y actualizar referencias en package.json
  - Archivar o eliminar archivos obsoletos (.backup, .corrupted, .problema)
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 5.1 Catalogar y categorizar scripts existentes
  - Inventariar todos los archivos .js, .cjs, .mjs en el directorio raíz
  - Clasificar scripts por función: migración, mantenimiento, setup, datos
  - Identificar scripts obsoletos, duplicados o de respaldo
  - Documentar propósito y dependencias de cada script importante
  - _Requirements: 3.1, 3.5_

- [ ] 5.2 Crear estructura organizada de scripts
  - Crear directorios `/scripts/migration/`, `/scripts/maintenance/`, `/scripts/setup/`, `/scripts/data/`
  - Mover scripts a ubicaciones apropiadas según su función
  - Crear `/scripts/archive/` para scripts obsoletos pero potencialmente útiles
  - Actualizar rutas en package.json scripts para reflejar nueva organización
  - _Requirements: 3.2, 3.3, 3.5_

- [ ] 5.3 Limpiar archivos legacy y obsoletos
  - Eliminar todos los archivos con extensiones .backup, .corrupted, .problema
  - Archivar scripts de migración antiguos que ya no son necesarios
  - Limpiar comentarios extensos y código muerto en archivos principales
  - Crear log de archivos eliminados para referencia futura
  - _Requirements: 3.4, 3.6_

- [ ] 6. Actualización de referencias y dependencias
  - Actualizar todas las importaciones de modelos para usar nueva estructura
  - Modificar referencias en controladores, servicios y middlewares
  - Actualizar configuración de Sequelize para cargar modelos desde nueva ubicación
  - Verificar que todas las asociaciones de base de datos funcionen correctamente
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 6.1 Actualizar importaciones de modelos
  - Buscar y reemplazar todas las importaciones de modelos en archivos JavaScript
  - Actualizar rutas de importación para apuntar a nueva estructura `/src/models/`
  - Verificar que no queden importaciones rotas o referencias a archivos movidos
  - Probar que todas las importaciones se resuelvan correctamente
  - _Requirements: 5.1, 5.5_

- [ ] 6.2 Actualizar referencias en servicios
  - Modificar todos los servicios para importar modelos desde ubicación unificada
  - Actualizar lógica de negocio que dependa de métodos específicos de modelos
  - Verificar que operaciones de base de datos funcionen con modelos consolidados
  - Probar funcionalidad completa de servicios críticos
  - _Requirements: 5.2, 5.4_

- [ ] 6.3 Actualizar configuración de Sequelize
  - Modificar carga de modelos en `/config/sequelize.js` para usar nueva estructura
  - Actualizar `syncDatabaseComplete.js` para cargar modelos desde ubicación unificada
  - Verificar que asociaciones se definan correctamente en el orden apropiado
  - Probar sincronización de base de datos con modelos consolidados
  - _Requirements: 5.3, 5.4_

- [ ] 7. Validación completa de funcionalidad
  - Ejecutar suite completa de pruebas para verificar que no se rompió funcionalidad
  - Probar todos los endpoints de API para confirmar respuestas correctas
  - Validar operaciones CRUD en base de datos con modelos consolidados
  - Verificar generación de reportes y funcionalidad de encuestas
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 7.1 Pruebas de endpoints de API
  - Probar todos los endpoints de autenticación (login, registro, refresh)
  - Validar endpoints de familias (crear, listar, actualizar, eliminar)
  - Verificar endpoints de catálogos (municipios, sexos, tipos de identificación)
  - Confirmar funcionamiento de endpoints de reportes y consultas avanzadas
  - _Requirements: 6.1, 6.5_

- [ ] 7.2 Validación de operaciones de base de datos
  - Probar creación de familias con personas asociadas
  - Verificar consultas complejas con múltiples joins entre modelos
  - Validar integridad referencial en operaciones de eliminación
  - Confirmar que migraciones y seeders funcionen con modelos consolidados
  - _Requirements: 6.2, 6.3_

- [ ] 7.3 Pruebas de funcionalidad de encuestas
  - Realizar flujo completo de creación de encuesta familiar
  - Probar registro de personas vivas y difuntos en una familia
  - Validar generación de reportes Excel y PDF con datos de prueba
  - Confirmar funcionalidad de consultas y estadísticas por sector/municipio
  - _Requirements: 6.4, 6.6_

- [ ] 8. Documentación de cambios arquitectónicos
  - Crear documentación completa de la nueva estructura de directorios
  - Documentar proceso de migración realizado y decisiones tomadas
  - Actualizar guías de desarrollo para reflejar nueva organización
  - Crear diagramas de arquitectura actualizada y flujos de datos
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 8.1 Documentar nueva arquitectura
  - Crear README.md completo explicando estructura del proyecto
  - Documentar convenciones de nomenclatura y organización adoptadas
  - Crear diagramas de la nueva estructura de modelos y controladores
  - Explicar beneficios de la consolidación y cómo mantener la organización
  - _Requirements: 7.1, 7.4, 7.6_

- [ ] 8.2 Crear guía de migración
  - Documentar paso a paso el proceso de consolidación realizado
  - Crear log detallado de archivos movidos, eliminados y modificados
  - Documentar problemas encontrados durante migración y sus soluciones
  - Crear checklist para futuras reorganizaciones similares
  - _Requirements: 7.2, 7.3, 7.5_

- [ ] 8.3 Actualizar documentación de desarrollo
  - Actualizar guías de contribución para reflejar nueva estructura
  - Documentar proceso de desarrollo con modelos y controladores consolidados
  - Crear guías de troubleshooting para problemas comunes post-migración
  - Actualizar documentación de despliegue si es necesario
  - _Requirements: 7.4, 7.5, 7.6_