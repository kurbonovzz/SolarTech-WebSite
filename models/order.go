package models

import "time"

type Order struct {
	ID              int64     `json:"id"`
	CustomerID      int64     `json:"customer_id"`
	SystemPackageID int64     `json:"system_package_id"`
	TotalPrice      float64   `json:"total_price"`
	Comment         string    `json:"comment"`
	Status          string    `json:"status"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}
