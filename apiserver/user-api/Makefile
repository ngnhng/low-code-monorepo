

default: up

bootstrap:

	echo "Create .env file..."
	cp .env.example .env
	
	yarn install
	yarn run start:dev


up:
	docker compose -f compose.dev.yaml up -d --remove-orphans