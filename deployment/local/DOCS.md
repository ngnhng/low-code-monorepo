## Local Deployment
A local deployment is a deployment that runs on a local machine. This deployment is useful for development and testing purposes.

### Prerequisites
- [Docker](https://www.docker.com/)
- [Docker Compose V2](https://docs.docker.com/compose/)

### Steps

1. Run the following command to start the application:
```bash
docker compose -f compose.local.yaml up --build
```
2. Access Traefik Proxy Dashboard at [http://localhost:8080/dashboard/](http://localhost:8080/dashboard/)

3. System is ready to use at [http://localhost:80/](http://localhost:80/)

4. Run the following command to stop the application:
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