// Package base62 implements base62 encoding.
package base62

import (
	"math"
)

/*
 * Encodings
 */

// An Encoding is a radix 62 encoding/decoding scheme, defined by a 62-character alphabet.
type Encoding struct {
	encode    [62]byte
	decodeMap [256]byte
}

const encodeStd = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

// NewEncoding returns a new padded Encoding defined by the given alphabet,
// which must be a 62-byte string that does not contain the padding character
// or CR / LF ('\r', '\n').
func NewEncoding(encoder string) *Encoding {

	e := new(Encoding)
	copy(e.encode[:], encoder)

	for i := 0; i < len(e.decodeMap); i++ {
		e.decodeMap[i] = 0xFF
	}
	for i := 0; i < len(encoder); i++ {
		e.decodeMap[encoder[i]] = byte(i)
	}
	return e
}

// StdEncoding is the standard base62 encoding.
var StdEncoding = NewEncoding(encodeStd)

/*
 * Encoder
 */

// Encode encodes src using the encoding enc.
func (enc *Encoding) Encode(src []byte) []byte {
	if len(src) == 0 {
		return nil
	}

	// enc is a pointer receiver, so the use of enc.encode within the hot
	// loop below means a nil check at every operation. Lift that nil check
	// outside of the loop to speed up the encoder.
	_ = enc.encode

	rs := 0
	cs := int(math.Ceil(math.Log(256) / math.Log(62) * float64(len(src))))
	dst := make([]byte, cs)
	for i := range src {
		c := 0
		v := int(src[i])
		for j := cs - 1; j >= 0 && (v != 0 || c < rs); j-- {
			v += 256 * int(dst[j])
			dst[j] = byte(v % 62)
			v /= 62
			c++
		}
		rs = c
	}
	for i := range dst {
		dst[i] = enc.encode[dst[i]]
	}
	if cs > rs {
		return dst[cs-rs:]
	}
	return dst
}

// EncodeToString returns the base62 encoding of src.
func (enc *Encoding) EncodeToString(src []byte) string {
	buf := enc.Encode(src)
	return string(buf)
}
