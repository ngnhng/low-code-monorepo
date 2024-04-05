package health

import (
	"context"
	grpcHealth "google.golang.org/grpc/health/grpc_health_v1"
	"sync"
)

// Checker is a simple GRPC Health checker implemtation
type Checker struct {
	grpcHealth.UnimplementedHealthServer
	status grpcHealth.HealthCheckResponse_ServingStatus
	mx     sync.Mutex
}

// New creates a new instance of the health checker
func New() *Checker {
	return &Checker{
		status: grpcHealth.HealthCheckResponse_NOT_SERVING,
	}
}

// SetStatus sets the reported status for the health checker
func (c *Checker) SetStatus(status grpcHealth.HealthCheckResponse_ServingStatus) {
	c.mx.Lock()
	defer c.mx.Unlock()
	c.status = status
}

// Check returns the status of the health checker as a GRPC response
func (c *Checker) Check(context.Context, *grpcHealth.HealthCheckRequest) (*grpcHealth.HealthCheckResponse, error) {
	c.mx.Lock()
	defer c.mx.Unlock()
	return &grpcHealth.HealthCheckResponse{
		Status: c.status,
	}, nil
}

// GetStatus gets the current status of the health checker
func (c *Checker) GetStatus() grpcHealth.HealthCheckResponse_ServingStatus {
	c.mx.Lock()
	defer c.mx.Unlock()
	return c.status
}
