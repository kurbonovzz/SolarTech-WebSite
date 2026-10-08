package models

type CalculatorEquipment struct {
	EquipmentTypeID int64   `json:"equipment_type_id"`
	Quantity        int     `json:"quantity"`
	SelectedPowerKW float64 `json:"selected_power_kw"`
}

type CalculatorRequest struct {
	Equipment []CalculatorEquipment `json:"equipment"`
}
