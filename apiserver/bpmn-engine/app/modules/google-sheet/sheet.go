package googlesheet

import (
	"context"

	"golang.org/x/oauth2"
	"google.golang.org/api/option"
	"google.golang.org/api/sheets/v4"
)

type (
	GoogleSheetClient struct {
		// GetSheetData(ctx context.Context, sheetID string, range_ string) ([][]interface{}, error)

		// UpdateSheetData(ctx context.Context, sheetID string, range_ string, data [][]interface{}) error

		// AppendSheetData appends data to the end of the sheet
		//AppendSheetData(ctx context.Context, sheetID string, range_ string, data [][]interface{}) error

		// ClearSheetData(ctx context.Context, sheetID string, range_ string) error
		// CreateSheet(ctx context.Context, title string) (string, error)
		// DeleteSheet(ctx context.Context, sheetID string) error

		// CreateRow(ctx context.Context, sheetID string, range_ string, data []interface{}) error

		*sheets.Service
	}
)

// NewGoogleSheetServiceWithToken creates a new google sheet service with the given token
func NewGoogleSheetServiceWithToken(at string) (*GoogleSheetClient, error) {
	tokenSource := oauth2.StaticTokenSource(&oauth2.Token{AccessToken: at})
	sheetsService, err := sheets.NewService(context.Background(), option.WithTokenSource(tokenSource))

	if err != nil {
		return nil, err
	}

	return &GoogleSheetClient{Service: sheetsService}, nil

}

// GetSheetData returns the data from the given sheet
// _range is the range of the sheet to get the data from. It should be in the format "Sheet1!A1:B2"
// The returned data is a 2D array of interface{} where each element is a cell value
//
// Example:
// [[1, 2], [3, 4]]
// This represents a 2x2 sheet with the values 1, 2, 3, 4
func (g *GoogleSheetClient) GetSheetData(ctx context.Context, sheetID string, range_ string) ([][]interface{}, error) {
	resp, err := g.Spreadsheets.Values.Get(sheetID, range_).Context(ctx).Do()
	if err != nil {
		return nil, err
	}

	return resp.Values, nil
}

// AppendSheetData appends data to the end of the sheet
// only required fields is values
// _range is the range of the sheet to append the data to. It should be in the format "Sheet1!A1:B2"
// The data is a 2D array of interface{} where each element is a cell value
func (g *GoogleSheetClient) AppendSheetData(ctx context.Context, sheetID string, range_ string, data [][]interface{}) error {
	valueRange := &sheets.ValueRange{
		Values: data,
	}

	_, err := g.Spreadsheets.Values.Append(sheetID, range_, valueRange).ValueInputOption("RAW").Context(ctx).Do()
	if err != nil {
		return err
	}

	return nil
}
