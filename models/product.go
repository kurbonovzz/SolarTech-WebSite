package models

type Product struct {
	ID             int64   `json:"id"`
	ManufacturerID int64   `json:"manufacturer_id"`
	CategoryID     int64   `json:"category_id"`
	Name           string  `json:"name"`
	Model          string  `json:"model"`
	Description    string  `json:"description"`
	PowerW         int     `json:"power_w"`
	CapacityKWh    float64 `json:"capacity_kwh"`
	Price          float64 `json:"price"`
	CostPrice      float64 `json:"cost_price"`
	StockQuantity  int     `json:"stock_quantity"`
	MinStock       int     `json:"min_stock"`
	WarrantyMonths int     `json:"warranty_months"`
	IsActive       bool    `json:"is_active"`
}
