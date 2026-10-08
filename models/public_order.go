package models

type PublicOrderRequest struct {
	Name            string `json:"name"`
	Phone           string `json:"phone"`
	SystemPackageID int64  `json:"system_package_id"`
	Comment         string `json:"comment"`
}
