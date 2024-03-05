package storage

type publishOptions struct {
	Embargo int
	ID      string
}

// PublishOpt represents an option that can be used when publishing a workflow state
type PublishOpt interface {
	Apply(n *publishOptions)
}

type publishEmbargoOption struct {
	value int
}

// Apply adds the embargo value to the publishOptions type
func (o *publishEmbargoOption) Apply(n *publishOptions) { n.Embargo = o.value }

// WithEmbargo allows the specification of an embargo time on a workflow state message
func WithEmbargo(embargo int) *publishEmbargoOption { //nolint
	return &publishEmbargoOption{value: embargo}
}
