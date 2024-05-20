package mailersend

import "go.uber.org/fx"

var Module = fx.Module(
	"mailersend",
	fx.Provide(NewMailerSend),
)
