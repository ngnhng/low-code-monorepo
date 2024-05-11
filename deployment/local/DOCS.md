## Local Deployment
A local deployment is a deployment that runs on a local machine. This deployment is useful for development and testing purposes.

### Prerequisites
- [Docker](https://www.docker.com/)
- [Docker Compose V2](https://docs.docker.com/compose/)

### Steps

1. First create an `.env` file in the current directory with the format of the `.env.example` file.

2. Run the following command to start the application:
```bash
docker compose -f compose.local.yaml up --build
```
3. Access Traefik Proxy Dashboard at [http://localhost:8080/dashboard/](http://localhost:8080/dashboard/)

4. System is ready to use at [http://localhost:80/](http://localhost:80/)

5. Run the following command to stop the application:
```bash
docker compose -f compose.local.yaml down
```
> [!NOTE]
> To also remove the volumes, use the `-v` flag.
> ```bash
> docker compose -f compose.local.yaml down -v
> ```

## Architecture
>TODO