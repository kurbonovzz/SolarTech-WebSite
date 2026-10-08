package models

type OrderDetailsResponse struct {
	Customer      Customer                    `json:"customer"`
	Order         Order                       `json:"order"`
	SystemPackage *SystemPackage              `json:"system_package"`
	PackageItems  []SystemPackageItemResponse `json:"package_items"`
}
