package task

import (
	"crypto/sha256"
	"fmt"
	"gitlab.com/shar-workflow/shar/common/base62"
	"gitlab.com/shar-workflow/shar/model"
)

// CreateUID creates a hash task UID given a task spec
func CreateUID(spec *model.TaskSpec) (string, error) {
	h := sha256.New()
	vals := []string{
		spec.Kind,
		spec.Version,
		spec.Metadata.Type,
		spec.Metadata.Version,
	}
	for _, v := range vals {
		_, err := h.Write([]byte(v))
		if err != nil {
			return "", fmt.Errorf("getting task hash: %w", err)
		}
	}
	if spec.Parameters != nil {
		if spec.Parameters.Input != nil {
			for _, v := range spec.Parameters.Input {
				vals = []string{
					v.Type,
					v.Name,
					fmt.Sprint(v.Collection),
					fmt.Sprint(v.Mandatory),
				}
				for _, v := range vals {
					_, err := h.Write([]byte(v))
					if err != nil {
						return "", fmt.Errorf("getting task hash: %w", err)
					}
				}
			}
		}
		if spec.Parameters.Output != nil {
			for _, v := range spec.Parameters.Output {
				vals = []string{
					v.Type,
					v.Name,
					fmt.Sprint(v.Collection),
				}
				for _, v := range vals {
					_, err := h.Write([]byte(v))
					if err != nil {
						return "", fmt.Errorf("getting task hash: %w", err)
					}
				}
			}
		}
	}
	return base62.StdEncoding.EncodeToString(h.Sum(nil)), nil
}
