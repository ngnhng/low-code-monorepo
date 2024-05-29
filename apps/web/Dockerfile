FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies 
# turbo
RUN npm install -g turbo

COPY . .

RUN turbo prune --scope=web --docker

# Add lockfile and package.json's of isolated subworkspace
FROM node:18-alpine AS installer

RUN apk add --no-cache libc6-compat
WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=deps /app/out/json/ .
COPY --from=deps /app/out/package-lock.json ./package-lock.json
RUN npm install

# Build the project
COPY --from=deps /app/out/full/ .
COPY turbo.json turbo.json

ARG NEXT_PUBLIC_API_BASE_URL=""
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

ARG NEXT_PUBLIC_AUTH_API_URL=""
ENV NEXT_PUBLIC_AUTH_API_URL=$NEXT_PUBLIC_AUTH_API_URL

ARG NEXT_PUBLIC_USER_API_URL=""
ENV NEXT_PUBLIC_USER_API_URL=$NEXT_PUBLIC_USER_API_URL

ARG NEXT_PUBLIC_WORKFLOW_API_URL=""
ENV NEXT_PUBLIC_WORKFLOW_API_URL=$NEXT_PUBLIC_WORKFLOW_API_URL

ARG NEXT_PUBLIC_DBMS_API_URL=""
ENV NEXT_PUBLIC_DBMS_API_URL=$NEXT_PUBLIC_DBMS_API_URL

ARG LOW_CODE_NO_AUTH=""
ENV LOW_CODE_NO_AUTH=$LOW_CODE_NO_AUTH


RUN npx turbo build --filter=web

# Production image, copy all the files and run next
FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=installer /app/web/next.config.js .
COPY --from=installer /app/web/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer /app/web/.next/standalone ./
COPY --from=installer /app/web/.next ./web/.next
COPY --from=installer /app/web/public ./web/public

ARG NEXT_PUBLIC_API_BASE_URL=""
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

ARG NEXT_PUBLIC_AUTH_API_URL=""
ENV NEXT_PUBLIC_AUTH_API_URL=$NEXT_PUBLIC_AUTH_API_URL

ARG NEXT_PUBLIC_USER_API_URL=""
ENV NEXT_PUBLIC_USER_API_URL=$NEXT_PUBLIC_USER_API_URL

ARG NEXT_PUBLIC_WORKFLOW_API_URL=""
ENV NEXT_PUBLIC_WORKFLOW_API_URL=$NEXT_PUBLIC_WORKFLOW_API_URL

ARG NEXT_PUBLIC_DBMS_API_URL=""
ENV NEXT_PUBLIC_DBMS_API_URL=$NEXT_PUBLIC_DBMS_API_URL

ARG LOW_CODE_NO_AUTH=""
ENV LOW_CODE_NO_AUTH=$LOW_CODE_NO_AUTH

EXPOSE 3000