#!/bin/sh

# Run the migrations
yarn prisma migrate deploy

# Start the application
node dist/main.js
