package workflow

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"gitlab.com/shar-workflow/shar/model"
)

// GetHash - will return a hash of a workflow definition without the GZipped source field/
func GetHash(wf *model.Workflow) ([]byte, error) {
	b2 := wf.GzipSource
	wf.GzipSource = nil
	md := map[string]*model.Metadata{}
	for k, v := range wf.Process {
		md[k] = v.Metadata
		v.Metadata = nil
	}
	defer func(wf *model.Workflow) {
		wf.GzipSource = b2
		for k, v := range wf.Process {
			v.Metadata = md[k]
		}
	}(wf)
	b, err := json.Marshal(wf)
	if err != nil {
		return nil, fmt.Errorf("marshal the workflow definition: %w", err)
	}
	h := sha256.New()
	if _, err := h.Write(b); err != nil {
		return nil, fmt.Errorf("write the workflow definitino to the hash provider: %s", wf.Name)
	}
	hash := h.Sum(nil)
	return hash, nil
}
