# BUILD FOR LOCAL DEVELOPMENT
FROM node:18-alpine AS development

WORKDIR /app

COPY yarn.lock package.json ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn prisma generate
COPY prisma ./prisma/

RUN yarn run build

# BUILD FOR PRODUCTION
FROM node:18-alpine AS production

WORKDIR /app

COPY --from=development /app/dist ./dist
COPY --from=development /app/node_modules ./node_modules
COPY --from=development /app/prisma ./prisma

EXPOSE 8080

CMD [ "node", "dist/main.js" ]
