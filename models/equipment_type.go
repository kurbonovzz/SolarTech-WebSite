package models

type EquipmentType struct {
	ID                 int64   `json:"id"`
	Name               string  `json:"name"`
	DefaultPowerW      int     `json:"default_power_w"`
	AveragePowerW      int     `json:"average_power_w"`
	DefaultHoursPerDay float64 `json:"default_hours_per_day"`
	Description        string  `json:"description"`
	IsActive           bool    `json:"is_active"`
	PowerFactor        float64 `json:"power_factor"`

	// quantity = обычная техника: мощность × количество
	// power = мощность выбирает клиент, например освещение
	CalculationType string `json:"calculation_type"`
}
