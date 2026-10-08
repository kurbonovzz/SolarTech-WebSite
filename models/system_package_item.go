package models

type SystemPackageItem struct {
	ID              int64 `json:"id"`
	SystemPackageID int64 `json:"system_package_id"`
	ProductID       int64 `json:"product_id"`
	Quantity        int   `json:"quantity"`
}

type SystemPackageItemResponse struct {
	ID          int64   `json:"id"`
	ProductID   int64   `json:"product_id"`
	ProductName string  `json:"product_name"`
	Category    string  `json:"category"`
	Quantity    int     `json:"quantity"`
	UnitPrice   float64 `json:"unit_price"`
	TotalPrice  float64 `json:"total_price"`
}
