package controller

type (
	Controller interface {
		DatabaseManagerController
		DatabaseQuerierController
	}

	DatabaseManagerController interface {
		CreateDatabase(...any) error
	}

	DatabaseQuerierController interface {
		ListTables(...any) error
	}
)

var _ Controller = (*EchoController)(nil)
