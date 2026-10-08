package models

type SystemPackage struct {
	ID            int64   `json:"id"`
	Name          string  `json:"name"`
	SystemPowerKW float64 `json:"system_power_kw"`
	Description   string  `json:"description"`
	TotalPrice    float64 `json:"total_price"`
	IsActive      bool    `json:"is_active"`
}
