#!/bin/sh

# Run the migrations
yarn run db:migrate

# Start the application
yarn run start:prod
