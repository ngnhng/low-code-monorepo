#!/bin/bash
set -e;
if [ -n "${POSTGRES_USERNAME:-}" ] && [ -n "${POSTGRES_PASSWORD:-}" ]; then
	# 1. Use the default 'postgres' superuser to create the new role and database
	# 2. create authenticator and webuser roles
	# 3. grant webuser to authenticator
	# 4. create anon role for anonymous access to swagger api spec
	# 5. TODO: create policies for webuser
	#  currently the webuser do not have token expiration
	psql -v ON_ERROR_STOP=1 --username "postgres" <<-EOSQL
	    CREATE ROLE "${POSTGRES_USERNAME}" WITH LOGIN PASSWORD '${POSTGRES_PASSWORD}';
		ALTER ROLE "${POSTGRES_USERNAME}" SUPERUSER;

	    DO \$\$ BEGIN
            IF NOT EXISTS (
                SELECT  1 FROM pg_database
                WHERE datname = '${POSTGRES_DB}'
            ) THEN
                EXECUTE 'CREATE DATABASE "${POSTGRES_DB}";';
            END IF;
        END \$\$;

		\c "${POSTGRES_DB}"

		DO \$\$ BEGIN
    		IF NOT EXISTS (
     			SELECT  1 FROM pg_namespace
   	    		WHERE nspname = 'api'
    		) THEN
     		   EXECUTE 'CREATE SCHEMA api;';
    		END IF;
		END \$\$; 

		CREATE ROLE "${PGSQL_AUTHENTICATOR}" WITH LOGIN PASSWORD '${PGSQL_AUTHENTICATOR_PASSWORD}';

		CREATE ROLE webuser NOLOGIN;
		GRANT ALL PRIVILEGES ON DATABASE "${POSTGRES_DB}" TO webuser;
		GRANT ALL PRIVILEGES ON SCHEMA api TO webuser;

		GRANT webuser TO "${PGSQL_AUTHENTICATOR}";

		CREATE ROLE anon NOLOGIN;
	EOSQL
else
	echo "SETUP INFO: No Environment variables given!"
fi
