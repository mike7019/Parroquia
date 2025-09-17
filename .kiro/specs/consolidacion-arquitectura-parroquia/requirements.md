# Requirements Document - Consolidación y Limpieza de Arquitectura

## Introduction

Este proyecto tiene como objetivo consolidar y limpiar la arquitectura del sistema Parroquia API, eliminando duplicaciones críticas, reorganizando la estructura de código y estableciendo una base sólida para futuras mejoras. El sistema actualmente presenta duplicación de modelos, controladores redundantes y scripts dispersos que dificultan el mantenimiento y desarrollo.

## Requirements

### Requirement 1: Consolidación de Modelos Duplicados

**User Story:** Como desarrollador del sistema, quiero tener modelos únicos y consistentes, para que no haya confusión entre diferentes versiones y el mantenimiento sea más eficiente.

#### Acceptance Criteria

1. WHEN se analicen los modelos en `/src/models/main/` y `/src/models/catalog/` THEN se debe identificar todas las duplicaciones y diferencias entre versiones
2. WHEN se unifiquen los modelos THEN se debe crear una estructura única en `/src/models/` con subcarpetas organizadas por dominio
3. WHEN se migre un modelo THEN se debe mantener toda la funcionalidad existente sin romper la compatibilidad
4. WHEN se eliminen modelos duplicados THEN se debe actualizar todas las referencias en controladores y servicios
5. IF existen diferencias entre versiones de modelos THEN se debe consolidar manteniendo la funcionalidad más completa
6. WHEN se complete la consolidación THEN no debe existir ningún modelo duplicado en el sistema

### Requirement 2: Reorganización de Controladores

**User Story:** Como desarrollador del sistema, quiero controladores organizados sin duplicación, para que la lógica de negocio esté centralizada y sea fácil de mantener.

#### Acceptance Criteria

1. WHEN se analicen los controladores existentes THEN se debe identificar toda la funcionalidad duplicada entre controladores normales y consolidados
2. WHEN se reorganicen los controladores THEN se debe crear una estructura clara por dominio funcional
3. WHEN se unifique la funcionalidad THEN se debe mantener todos los endpoints existentes funcionando
4. WHEN se eliminen controladores duplicados THEN se debe actualizar todas las rutas correspondientes
5. IF existe lógica diferente entre controladores duplicados THEN se debe consolidar manteniendo la funcionalidad más robusta
6. WHEN se complete la reorganización THEN cada entidad debe tener un solo controlador responsable

### Requirement 3: Limpieza de Scripts y Archivos Legacy

**User Story:** Como desarrollador del sistema, quiero una estructura de archivos limpia y organizada, para que sea fácil encontrar y mantener los scripts necesarios.

#### Acceptance Criteria

1. WHEN se identifiquen scripts dispersos THEN se debe catalogar todos los archivos en el directorio raíz del proyecto
2. WHEN se organicen los scripts THEN se debe crear una estructura de carpetas `/scripts/` con subcategorías claras
3. WHEN se muevan archivos legacy THEN se debe preservar archivos importantes y archivar obsoletos
4. WHEN se eliminen archivos innecesarios THEN se debe remover todos los archivos `.backup`, `.corrupted`, `.problema`
5. IF un script es crítico para operaciones THEN se debe documentar su propósito y uso
6. WHEN se complete la limpieza THEN el directorio raíz debe contener solo archivos de configuración esenciales

### Requirement 4: Establecimiento de Estructura de Directorios Estándar

**User Story:** Como desarrollador del sistema, quiero una estructura de directorios consistente y lógica, para que sea fácil navegar y entender la organización del código.

#### Acceptance Criteria

1. WHEN se defina la nueva estructura THEN se debe seguir las mejores prácticas de Node.js y Express
2. WHEN se reorganicen los directorios THEN se debe agrupar archivos relacionados por dominio funcional
3. WHEN se muevan archivos THEN se debe actualizar todas las importaciones y referencias
4. WHEN se establezca la estructura THEN se debe documentar la organización y convenciones
5. IF existen dependencias circulares THEN se debe refactorizar para eliminarlas
6. WHEN se complete la reorganización THEN la estructura debe ser intuitiva para nuevos desarrolladores

### Requirement 5: Actualización de Referencias y Dependencias

**User Story:** Como desarrollador del sistema, quiero que todas las referencias entre archivos funcionen correctamente después de la reorganización, para que el sistema mantenga su funcionalidad completa.

#### Acceptance Criteria

1. WHEN se muevan archivos THEN se debe actualizar todas las importaciones en JavaScript/TypeScript
2. WHEN se cambien rutas THEN se debe actualizar todas las referencias en controladores y servicios
3. WHEN se modifiquen modelos THEN se debe actualizar todas las asociaciones de Sequelize
4. WHEN se reorganicen servicios THEN se debe verificar que todas las inyecciones de dependencias funcionen
5. IF se encuentran referencias rotas THEN se debe corregir inmediatamente
6. WHEN se complete la actualización THEN el sistema debe pasar todas las pruebas de funcionalidad existentes

### Requirement 6: Validación de Funcionalidad Post-Reorganización

**User Story:** Como usuario del sistema, quiero que todas las funcionalidades existentes sigan funcionando después de la reorganización, para que no se pierda ninguna capacidad del sistema.

#### Acceptance Criteria

1. WHEN se complete la reorganización THEN todos los endpoints de la API deben responder correctamente
2. WHEN se pruebe la funcionalidad THEN el sistema de autenticación debe funcionar sin cambios
3. WHEN se valide la base de datos THEN todas las operaciones CRUD deben ejecutarse correctamente
4. WHEN se generen reportes THEN el sistema de reportes debe producir los mismos resultados
5. IF se encuentra alguna funcionalidad rota THEN se debe corregir antes de considerar completa la tarea
6. WHEN se valide el sistema completo THEN se debe poder realizar un flujo completo de encuesta familiar

### Requirement 7: Documentación de Cambios Arquitectónicos

**User Story:** Como desarrollador del equipo, quiero documentación clara de los cambios realizados, para que pueda entender la nueva estructura y contribuir efectivamente.

#### Acceptance Criteria

1. WHEN se realicen cambios estructurales THEN se debe documentar cada modificación importante
2. WHEN se establezca la nueva organización THEN se debe crear un mapa de la arquitectura actualizada
3. WHEN se muevan archivos THEN se debe mantener un registro de la migración realizada
4. WHEN se eliminen archivos THEN se debe documentar qué se removió y por qué
5. IF se cambian convenciones THEN se debe actualizar las guías de desarrollo
6. WHEN se complete la documentación THEN debe incluir diagramas de la nueva estructura y guías de navegación