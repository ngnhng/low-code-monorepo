package mailersend

import (
	"context"
	"fmt"
	"yalc/bpmn-engine/modules/config"
	"yalc/bpmn-engine/modules/logger"

	"github.com/mailersend/mailersend-go"
	"gitlab.com/shar-workflow/shar/client"
	"gitlab.com/shar-workflow/shar/model"
	"go.uber.org/fx"
)

type (
	MailerSend struct {
		config config.Config
		logger logger.Logger
	}

	SendMailRequest struct {
		ApiKey        string
		Subject       string
		Text          string
		ReceiverName  string
		ReceiverEmail string
	}
)

var (
	MailerSendSendMailFn func(
		ctx context.Context,
		cl client.JobClient,
		vars model.Vars,
	) (model.Vars, error)
)

func MailerSendSendMailFnAssign(fn func(
	ctx context.Context,
	cl client.JobClient,
	vars model.Vars,
) (model.Vars, error)) {
	MailerSendSendMailFn = fn
}

func NewMailerSendSendMailFn(mailer *MailerSend) func(
	ctx context.Context,
	cl client.JobClient,
	vars model.Vars,
) (model.Vars, error) {
	return func(
		ctx context.Context,
		cl client.JobClient,
		vars model.Vars,
	) (model.Vars, error) {

		// extract the required variables from the vars
		apiKey, err := vars.GetString("apiKey")
		if err != nil {
			return nil, fmt.Errorf("apiKey is required")
		}

		subject, ok := vars["mailSubject"].(string)
		if !ok {
			return nil, fmt.Errorf("subject is required")
		}

		text, ok := vars["mailText"].(string)
		if !ok {
			return nil, fmt.Errorf("text is required")
		}

		receiverName, ok := vars["receiverName"].(string)
		if !ok {
			return nil, fmt.Errorf("receiverName is required")
		}

		receiverEmail, ok := vars["receiverEmail"].(string)
		if !ok {
			return nil, fmt.Errorf("receiverEmail is required")
		}

		// create the request
		req := &SendMailRequest{
			ApiKey:        apiKey,
			Subject:       subject,
			Text:          text,
			ReceiverName:  receiverName,
			ReceiverEmail: receiverEmail,
		}

		// send the email
		err = mailer.SendMail(ctx, req)
		if err != nil {
			return nil, err
		}

		vars["mailSent"] = true

		return vars, nil

	}
}

type Params struct {
	fx.In

	Config config.Config
	Logger logger.Logger
}

func NewMailerSend(p Params) *MailerSend {
	return &MailerSend{
		config: p.Config,
		logger: p.Logger,
	}
}

func (m *MailerSend) SendMail(ctx context.Context, req *SendMailRequest) error {
	m.logger.Debug("Sending email")

	ms := mailersend.NewMailersend(req.ApiKey)

	from := mailersend.From{
		Name:  "YALC",
		Email: "tester@yalc.live",
	}

	recipients := []mailersend.Recipient{
		{
			Name:  req.ReceiverName,
			Email: req.ReceiverEmail,
		},
	}

	tags := []string{"yalc"}

	bodyHtml := fmt.Sprintf("<h1>%s</h1>", req.Text)

	message := ms.Email.NewMessage()

	message.SetFrom(from)
	message.SetRecipients(recipients)
	message.SetSubject(req.Subject)
	message.SetHTML(bodyHtml)
	message.SetText(req.Text)
	message.SetTags(tags)
	message.SetInReplyTo("client-id")

	res, err := ms.Email.Send(ctx, message)
	if err != nil {
		m.logger.Error("Error sending email", "err", err)
		return err
	}

	m.logger.Debug("Email sent", "res", res)

	return nil

}
