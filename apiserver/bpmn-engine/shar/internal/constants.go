package internal

const (
	EmbargoNatsHeader = "embargo" // EmbargoNatsHeader is the header used to control message embargo.
	ErrorPrefix       = "ERR\x01" // ErrorPrefix ERR(Start of Heading) Denotes an API error.
	ErrorSeparator    = "\x02"    // ErrorSeparator (Start of Text) Denotes the start of the API error message.
)
