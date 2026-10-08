package models

type CustomerEquipment struct {
	ID              int64 `json:"id"`
	EquipmentTypeID int64 `json:"equipment_type_id"`
	Quantity        int   `json:"quantity"`
}
