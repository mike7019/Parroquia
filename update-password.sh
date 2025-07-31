#!/bin/bash
HASH='$2b$10$iDje.E1wjILPgSLQNK61Ze58K0pijcsZ/24XoPqOrp4PTmDhosmT.'
docker exec parroquia-postgres psql -U parroquia_user -d parroquia_db -c "UPDATE usuarios SET contrasena = '$HASH' WHERE correo_electronico = 'admin@parroquia.com';"
