# This dockerfile builds multi-platform shar images according to what values are provided against the --platform flag in the build command.

# The following command sequence logs in to the registry, creates the builder, runs the build and pushes it to the registry: 

# docker login -u <username> -p <password>
# docker buildx create --use
# docker buildx build --platform linux/amd64,linux/arm64,linux/386 -t registry.gitlab.com/vitrifi/workflow/shar/server:latest --push --target server .
# docker buildx build --platform linux/amd64,linux/arm64,linux/386 -t registry.gitlab.com/vitrifi/workflow/shar/telemetry:latest --push --target telemetry .

# ^This will build a multi-platform image for linux/amd64,linux/arm64 and linux/386 platforms.
# Reference: https://www.docker.com/blog/faster-multi-platform-builds-dockerfile-cross-compilation-guide/

FROM --platform=$BUILDPLATFORM golang:1.22.0-alpine as build-stage
ARG BINARY_VERSION="0.1.0"
ARG COMMIT_HASH="12345abcd"
ARG TARGETPLATFORM
ARG BUILDPLATFORM
ARG TARGETOS TARGETARCH

RUN echo "I am running on $BUILDPLATFORM, building for $TARGETPLATFORM"
RUN echo "Target Operating System: $TARGETOS" 
RUN echo "Target Architecture: $TARGETARCH"

WORKDIR /work

RUN apk add protoc
# Dependency caching:
COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod go mod download -x
RUN --mount=type=cache,target=/go/pkg/mod go get -d google.golang.org/protobuf/cmd/protoc-gen-go@v1.28 && \
    	go get -d google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.2 && \
    	go get -d github.com/golangci/golangci-lint/cmd/golangci-lint@latest && \
    	go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.28 && \
    	go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.2

COPY . .
RUN --mount=type=cache,target=../model cd proto; protoc --go_opt=M=gitlab.com --go_out=../model shar-workflow/models.proto
RUN ls model/gitlab.com/shar-workflow/shar/model && \
    mv model/gitlab.com/shar-workflow/shar/model/models.pb.go model && \
    rm -rf model/gitlab.com

# Platform specific binary builds:
RUN GOOS=$TARGETOS GOARCH=$TARGETARCH CGO_ENABLED=0 go build -ldflags "-X 'main.ServerVersion=$BINARY_VERSION' -X 'main.CommitHash=$COMMIT_HASH' -X 'main.BuildDate=$(date)'" -o build/server/server ./server/cmd/shar/main.go
RUN GOOS=$TARGETOS GOARCH=$TARGETARCH CGO_ENABLED=0 go build -ldflags "-X 'main.ServerVersion=$BINARY_VERSION' -X 'main.CommitHash=$COMMIT_HASH' -X 'main.BuildDate=$(date)'" -o build/telemetry/telemetry ./telemetry/cmd/shar-telemetry/main.go

# Secure containerisation:
FROM --platform=$BUILDPLATFORM gcr.io/distroless/static:nonroot as server
WORKDIR /app
COPY --from=build-stage /work/build/server .
ENTRYPOINT ["/app/server"]

FROM --platform=$BUILDPLATFORM gcr.io/distroless/static:nonroot as telemetry
WORKDIR /app
COPY --from=build-stage /work/build/telemetry .
ENTRYPOINT ["/app/telemetry"]