package common

// RemoveWhere removes an array element based upon a condition.
func RemoveWhere[T comparable](slice []T, fn func(T) bool) []T {
	for i, v := range slice {
		if fn(v) {
			slice = append(slice[:i], slice[i+1:]...)
			break
		}
	}
	return slice
}
