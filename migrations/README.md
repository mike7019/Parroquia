# Migraciones de Base de Datos

Este proyecto utiliza **exclusivamente migraciones de Sequelize** para el manejo de la base de datos.

## Enfoque Único: Migraciones Sequelize

Se ha eliminado el enfoque dual de scripts SQL puros para mantener consistencia y evitar duplicación. Todas las modificaciones de la base de datos se realizan a través de migraciones de Sequelize.

## Orden de Ejecución de Migraciones

Las migraciones se ejecutan en orden cronológico basado en su timestamp:

1. **20250730000000-init-postgres-extensions.cjs** - Inicializa extensiones de PostgreSQL
2. **20250730000001-create-catalog-tables.cjs** - Crea tablas de catálogo
3. **20250730000001-add-timestamps-to-existing-tables.cjs** - Añade timestamps
4. **20250730000002-create-main-entities.cjs** - Crea entidades principales
5. **20250730000003-create-family-tables.cjs** - Crea tablas de familias
6. **20250730000004-create-person-related-tables.cjs** - Crea tablas relacionadas con personas
7. **20250730000005-create-user-tables.cjs** - Crea tablas de usuarios
8. **20250730000006-update-tipo-identificacion-table.cjs** - Actualiza tabla tipo identificación
9. **Migraciones posteriores** - Actualizaciones incrementales

## Comandos Útiles

### Ejecutar todas las migraciones pendientes
```bash
npx sequelize-cli db:migrate
```

### Deshacer la última migración
```bash
npx sequelize-cli db:migrate:undo
```

### Ver estado de migraciones
```bash
npx sequelize-cli db:migrate:status
```

### Crear nueva migración
```bash
npx sequelize-cli migration:generate --name nombre-de-la-migracion
```

## Consideraciones Importantes

- **No crear scripts SQL manuales**: Todas las modificaciones deben hacerse a través de migraciones
- **Probar migraciones**: Siempre probar en entorno de desarrollo antes de producción
- **Backup antes de migrar**: En producción, hacer respaldo antes de ejecutar migraciones
- **Versionado**: Las migraciones son parte del control de versiones y deben incluirse en commits

## Usuario Administrador

El usuario administrador se crea automáticamente con las migraciones:
- **Email:** admin@parroquia.com
- **Password:** admin123

## Estructura de Base de Datos

La base de datos se crea completamente a través de migraciones, incluyendo:
- Extensiones de PostgreSQL
- Tablas de catálogo
- Entidades principales
- Relaciones y llaves foráneas
- Índices de rendimiento
- Secuencias auto-incrementales
- Datos iniciales (seeders)