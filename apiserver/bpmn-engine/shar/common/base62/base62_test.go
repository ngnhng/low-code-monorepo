package base62

import "testing"

func TestEncodeToString(t *testing.T) {
	for _, s := range SamplesStd {
		encoded := StdEncoding.EncodeToString([]byte(s.source))
		if len(encoded) == len(s.target) && encoded == s.target {
			t.Logf("source: %-15s\ttarget: %s", s.source, s.target)
		} else {
			t.Errorf("source: %-15s\texpected target: %s(%d)\tactual target: %s(%d)", s.source, s.target, len(s.target), encoded, len(encoded))
		}
	}
}

type Sample struct {
	source      string
	target      string
	sourceBytes []byte
	targetBytes []byte
}

func NewSample(source, target string) *Sample {
	return &Sample{source: source, target: target, sourceBytes: []byte(source), targetBytes: []byte(target)}
}

var SamplesStd = []*Sample{
	NewSample("", ""),
	NewSample("f", "1e"),
	NewSample("fo", "6ox"),
	NewSample("foo", "SAPP"),
	NewSample("foob", "1sIyuo"),
	NewSample("fooba", "7kENWa1"),
	NewSample("foobar", "VytN8Wjy"),

	NewSample("su", "7gj"),
	NewSample("sur", "VkRe"),
	NewSample("sure", "275mAn"),
	NewSample("sure.", "8jHquZ4"),
	NewSample("asure.", "UQPPAab8"),
	NewSample("easure.", "26h8PlupSA"),
	NewSample("leasure.", "9IzLUOIY2fe"),

	NewSample("=", "z"),
	NewSample(">", "10"),
	NewSample("?", "11"),
	NewSample("11", "3H7"),
	NewSample("111", "DWfh"),
	NewSample("1111", "tquAL"),
	NewSample("11111", "3icRuhV"),
	NewSample("111111", "FMElG7cn"),

	NewSample("Hello, World!", "1wJfrzvdbtXUOlUjUf"),
	NewSample("你好，世界！", "1ugmIChyMAcCbDRpROpAtpXdp"),
	NewSample("こんにちは", "1fyB0pNlcVqP3tfXZ1FmB"),
	NewSample("안녕하십니까", "1yl6dfHPaO9hroEXU9qFioFhM"),
}
