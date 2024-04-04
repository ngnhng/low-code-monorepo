default: clean configure proto server tracing cli zen-shar

configure:
	@echo "\033[92mConfigure\033[0m"
	go version
	go get -d google.golang.org/protobuf/cmd/protoc-gen-go@v1.32.0
	go get -d google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.3.0
	go get -d github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	go get -d github.com/vektra/mockery/v2@v2.41.0
	go install google.golang.org/protobuf/cmd/protoc-gen-go@v1.32.0
	go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.3.0
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	go install github.com/vektra/mockery/v2@v2.41.0
	go install gotest.tools/gotestsum@latest
	mkdir -p build
	curl --insecure https://gitlab.com/shar-workflow/nats-proto-gen-go/-/archive/main/nats-proto-gen-go-main.tar.gz --output build/nats-proto-gen-go-main.tar.gz
	cd build && rm -rf nats-proto-gen-go-main protogen
	cd build && tar -zxvf nats-proto-gen-go-main.tar.gz #&& rm nats-proto-gen-go-main.tar.gz
	cd build && mv nats-proto-gen-go-main protogen
	cd build/protogen/cmd/nats-proto-gen-go && go build && cp nats-proto-gen-go ../../../
	#rm -rf nats-proto-gen-go

all: proto server tracing cli zen-shar

proto: .FORCE
	@echo "\033[92mBuild proto\033[0m"
	cd proto; protoc --experimental_allow_proto3_optional --go_opt=M=gitlab.com --go_out=../model shar-workflow/models.proto;
	@echo "\033[92mCopy model\033[0m"
	mv model/gitlab.com/shar-workflow/shar/model/models.pb.go model/
	@echo "\033[92mRemove proto working directories\033[0m"
	rm -rf model/gitlab.com
	build/nats-proto-gen-go proto/shar-workflow/models.proto --module-namespace="gitlab.com/shar-workflow/shar" --output-package="internal/natsrpc" --message-prefix "WORKFLOW.Api."
	cd model/protodoc && go build
	model/protodoc/protodoc
server: .FORCE proto
	@echo "\033[92mCopying files\033[0m"
	mkdir -p build/server
	cd server/cmd/shar; CGO_ENABLED=0 go build
	cp server/cmd/shar/shar build/server/
	cp server/cmd/shar/shar server/
	cp server/Dockerfile build/server/
tracing: .FORCE
	mkdir -p build/telemetry
	@echo "\033[92mBuilding Telemetry\033[0m"
	cd telemetry/cmd/shar-telemetry; CGO_ENABLED=0 go build
	cp telemetry/cmd/shar-telemetry/shar-telemetry build/telemetry/
	cp telemetry/cmd/shar-telemetry/shar-telemetry server/
	cp telemetry/Dockerfile build/telemetry/
cli: .FORCE proto
	mkdir -p build/cli
	@echo "\033[92mBuilding CLI\033[0m"
	cd cli/cmd/shar; CGO_ENABLED=0 go build
	cp cli/cmd/shar/shar build/cli/
zen-shar: .FORCE proto
	mkdir -p build/zen-shar
	@echo "\033[92mBuilding Zen\033[0m"
	cd zen-shar/cmd/zen-shar; CGO_ENABLED=0 go build
	cp zen-shar/cmd/zen-shar/zen-shar build/zen-shar/
docker: proto server tracing .FORCE
	cd build/server; docker build -t shar .
	cd build/telemetry; docker build -t shar-telemetry .
clean: .FORCE
	@echo "\033[92mCleaning build directory\033[0m"
	cd server/cmd/shar; go clean
	rm -f server/cmd/shar/shar
	cd telemetry/cmd/shar-telemetry; go clean
	rm -f telemetry/cmd/shar-telemetry/shar-telemetry
	rm -f model/*.pb.go
	rm -rf build
	mkdir -p build
generated-code: proto .FORCE
	go generate server/workflow/nats-service.go
ci-pipeline-test: clean configure test .FORCE
test: proto generated-code server tracing examples .FORCE
	golangci-lint cache clean
	@echo "\033[92mLinting\033[0m"
	golangci-lint run -v -E gosec -E revive -E ireturn --timeout 5m0s
	@echo "\033[92mCleaning test cache\033[0m"
	go clean -testcache
	@echo "\033[92mRunning tests\033[0m"
	CGO_ENABLED=0 gotestsum --junitfile report.xml --format testname
race: proto server tracing .FORCE
	@echo "\033[92mCleaning test cache\033[0m"
	go clean -testcache
	@echo "\033[92mRunning tests\033[0m"
	CGO_ENABLED=0 go test ./... --race
mod-upgrade: .FORCE
	#go list -u -m $(go list -m -f '{{.Indirect}} {{.}}' all | grep '^false' | cut -d ' ' -f2) | grep '\['
	go get -u ./...
	go mod tidy
wasm: .FORCE
	cd validator && GOOS=js GOARCH=wasm go CGO_ENABLED=0 build -o json.wasm
examples: .FORCE
	cd examples/message && go build  -o ../../build/examples/message main.go
	cd examples/message-manual && go build  -o ../../build/examples/message-manual main.go
	cd examples/sub-workflow && go build  -o ../../build/examples/sub-workflow main.go
	cd examples/simple && go build  -o ../../build/examples/simple main.go
	cd examples/usertask && go build  -o ../../build/examples/usertask main.go
update:
	go get -u ./...
	go mod tidy
.FORCE:
