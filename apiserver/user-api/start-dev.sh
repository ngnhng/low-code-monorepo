#!/bin/sh

# Run the migrations

# apply all pending migrations
yarn prisma migrate deploy
# generate the prisma client
yarn prisma generate

# create the initial migration
yarn prisma migrate dev --name init

# exec
exec "$@"
