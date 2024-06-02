package mailersend

import (
	"context"
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
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
		ApiKey   string
		Subject  string
		Text     string
		Receiver map[string]string
		Vars     map[string]interface{}
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

		mailer.logger.Debugf("Sending email: %v", vars)

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

		receiverNameStr, ok := vars["receiverName"].(string)
		if !ok {
			return nil, fmt.Errorf("receiverName is required")
		}

		receiverEmailStr, ok := vars["receiverEmail"].(string)
		if !ok {
			return nil, fmt.Errorf("receiverEmail is required")
		}

		var receiverEmails []string
		convertedReceiverEmailStr := strings.Replace(receiverEmailStr, "'", "\"", -1)
		err = json.Unmarshal([]byte(convertedReceiverEmailStr), &receiverEmails)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal receiverEmail")
		}

		var receiverNames []string
		convertedReceiverNameStr := strings.Replace(receiverNameStr, "'", "\"", -1)
		err = json.Unmarshal([]byte(convertedReceiverNameStr), &receiverNames)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal receiverName")
		}

		// if length of receiverEmails and receiverNames is not equal, return error
		if len(receiverEmails) != len(receiverNames) {
			return nil, fmt.Errorf("receiverEmail and receiverName must have the same length")
		}

		receiver := make(map[string]string)
		for i, email := range receiverEmails {
			receiver[email] = receiverNames[i]
		}

		// create the request
		req := &SendMailRequest{
			ApiKey:   apiKey,
			Subject:  subject,
			Text:     text,
			Receiver: receiver,
			Vars:     vars,
		}

		mailer.logger.Debugf("Sending email with Req: %v", req)

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

	ms := mailersend.NewMailersend(req.ApiKey)

	from := mailersend.From{
		Name:  "YALC",
		Email: "tester@yalc.live",
	}

	tags := []string{"yalc"}

	bodyHtml := fmt.Sprintf("<h2>%s</h2>", req.Text)

	// Extract template variables from req.Text
	re := regexp.MustCompile(`{{(.*?)}}`)
	matches := re.FindAllStringSubmatch(req.Text, -1)

	// Prepare data for personalization
	data := make(map[string]interface{})
	for _, match := range matches {
		if len(match) > 1 {
			data[match[1]] = req.Vars[match[1]]
		}
	}

	// map each req.Receiver (map[string]string) to a slice of mailersend.Recipient
	var emailObjects []*mailersend.Message
	for email, name := range req.Receiver {
		data["name"] = name
		personalizations := []mailersend.Personalization{
			{
				Email: email,
				Data:  data,
			},
		}

		emailObjects = append(emailObjects, ms.Email.NewMessage())
		emailObjects[len(emailObjects)-1].SetFrom(from)
		emailObjects[len(emailObjects)-1].SetRecipients([]mailersend.Recipient{{Name: name, Email: email}})
		emailObjects[len(emailObjects)-1].SetSubject(req.Subject)
		emailObjects[len(emailObjects)-1].SetHTML(bodyHtml)
		emailObjects[len(emailObjects)-1].SetText(req.Text)
		emailObjects[len(emailObjects)-1].SetTags(tags)
		emailObjects[len(emailObjects)-1].SetPersonalization(personalizations)

		m.logger.Debugf("Email object: %v", emailObjects[len(emailObjects)-1])

	}

	m.logger.Debugf("Sending email message: %s", emailObjects)

	_, _, err := ms.BulkEmail.Send(ctx, emailObjects)
	if err != nil {
		m.logger.Error("Error sending email", "err", err)
		return err
	}

	return nil
}
