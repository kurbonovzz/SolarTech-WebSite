package models

type Manufacturer struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Country     string `json:"country"`
	Website     string `json:"website"`
	Description string `json:"description"`
}
