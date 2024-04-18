# DBMS

## Architecture
This DBMS service aims to provide a simple interface to interact with a database. The current stack consists of:
- A service written in Go for managing and querying the database.
- Neon Serverless Postgres for the database.


## Development

### Local Development
1. Create an `.env` file like that of the provided `.env.example` file. 

Other environment variables can be set manually and their names can be found in the `app/modules/config/type.go` file.

2. Set the file path to the previously created `.env` file as environment variable `YALC_ENV_FILE`:

<details>
<summary>On Windows:</summary>
<pre>

```powershell
$env:YALC_ENV_FILE="<path-to-env-file>"
```
</pre>

</details>

```bash
export YALC_ENV_FILE=<path-to-env-file>
```

3. In the same session, run the following command:

```bash
go run app/cmd/main.go
```

### On Docker
```bash
docker build -f ./Dockerfile.dev -t yalc-dbms:dev .
```