#!/bin/sh

# Run the migrations

# apply all pending migrations
yarn prisma migrate deploy
# generate the prisma client
yarn prisma generate

# exec
exec "$@"
