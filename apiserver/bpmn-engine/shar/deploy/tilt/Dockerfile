# Top level Dockerfile building both SHAR server and SHAR telemetry images
FROM golang:1.19.3-alpine as build-stage
# default values (can be overridden with --build-arg option)
ARG BINARY_VERSION="0.1.0"
ARG COMMIT_HASH="12345abcd"

WORKDIR /work

# dep caching
COPY go.mod go.sum ./
RUN go mod download -x
RUN     go get -d google.golang.org/protobuf/cmd/protoc-gen-go@v1.28 && \
        go get -d google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.2 && \
        go get -d github.com/golangci/golangci-lint/cmd/golangci-lint@latest && \
        go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.28 && \
        go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.2

# go protobuf generation:
RUN apk add protoc
COPY . .
RUN cd proto; protoc --go_opt=M=gitlab.com --go_out=../model shar-workflow/models.proto
RUN ls model/gitlab.com/shar-workflow/shar/model && \
    mv model/gitlab.com/shar-workflow/shar/model/models.pb.go model && \
    rm -rf model/gitlab.com

# shar server construction:
FROM build-stage as build-shar-build
RUN CGO_ENABLED=0 go build -buildvcs=false -ldflags "-X 'main.ServerVersion=$BINARY_VERSION' -X 'main.CommitHash=$COMMIT_HASH' -X 'main.BuildDate=$(date)'"  -o build/server ./server/cmd/shar/main.go
FROM scratch as production-stage-server
WORKDIR /app
COPY --from=build-shar-build /work/build/server .
ENTRYPOINT ["/app/server"]

# shar telemetry construction:
FROM build-stage as build-telemetry-build
RUN CGO_ENABLED=0 go build -buildvcs=false -ldflags "-X 'main.ServerVersion=$BINARY_VERSION' -X 'main.CommitHash=$COMMIT_HASH' -X 'main.BuildDate=$(date)'"  -o build/telemetry ./telemetry/cmd/shar-telemetry/main.go
FROM scratch as production-stage-telemetry
WORKDIR /app
COPY --from=build-telemetry-build /work/build/telemetry .
ENTRYPOINT ["/app/telemetry"]