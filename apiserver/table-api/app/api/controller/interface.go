package controller

type (
	Controller interface {
		DatabaseManagerController
		DatabaseQuerierController
	}

	DatabaseManagerController interface {
		CreateDatabase(...any) error
		CreateTable(...any) error
	}

	DatabaseQuerierController interface {
		ListTables(...any) error
		QueryTable(...any) error
	}
)

var _ Controller = (*EchoController)(nil)
