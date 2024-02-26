-- Description: This file contains the stored procedures for the table-api database.

-- Procedure: create_dynamic_table
-- Description: This procedure creates a table with the given name and column definitions.
-- Example: 
-- POST /table-api/rpc/create_dynamic_table
-- {
--     "table_name": "test_table",
--     "column_definitions": [
--         "id SERIAL PRIMARY KEY",
--         "name TEXT",
--         "age INT"
--     ]
-- }
-- Result: A table named "test_table" with the given column definitions will be created.
-- Note: The column definitions should be an array of strings. Each string should be a valid column definition.
--       The column definitions should not contain the table name.
\c table_db;

SET search_path TO api;

CREATE OR REPLACE FUNCTION api.create_dynamic_table(
    column_definitions TEXT[],
    table_name TEXT
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    dynamic_sql TEXT := '';
BEGIN
    -- Construct the CREATE TABLE statement with the given table name
    dynamic_sql := 'CREATE TABLE IF NOT EXISTS ' || quote_ident(table_name) || ' (';
    
    -- Iterate through the column definitions and append them to the dynamic_sql
    FOR i IN  1 .. array_length(column_definitions,  1) LOOP
        dynamic_sql := dynamic_sql || column_definitions[i];
        IF i < array_length(column_definitions,  1) THEN
            dynamic_sql := dynamic_sql || ', ';
        END IF;
    END LOOP;
    
    dynamic_sql := dynamic_sql || ')';
    
    -- Execute the constructed SQL statement
    EXECUTE dynamic_sql;
END;
$$;