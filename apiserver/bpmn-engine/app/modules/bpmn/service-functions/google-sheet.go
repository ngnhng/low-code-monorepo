package servicefn

import (
	"context"
	"fmt"

	"gitlab.com/shar-workflow/shar/client"
	"gitlab.com/shar-workflow/shar/model"
)

func googleSheetFn(
	ctx context.Context,
	cl client.JobClient,
	vars model.Vars,
) (model.Vars, error) {

	// log the context
	//fmt.Println("GoogleSheetFn context: ", ctx)
	// log the vars
	fmt.Println("GoogleSheetFn vars: ", vars)
	user, err := vars.GetString("_localContext_user")
	if err != nil {
		return vars, err
	}

	fmt.Println("GoogleSheetFn user: ", user)

	ctx = context.WithValue(ctx, "user", user)

	//

	return vars, nil
}
