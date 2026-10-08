package models

type CalculatorResponse struct {
	TotalPowerW         int                         `json:"total_power_w"`
	TotalPowerKW        float64                     `json:"total_power_kw"`
	RequiredPowerW      int                         `json:"required_power_w"`
	RequiredPowerKW     float64                     `json:"required_power_kw"`
	RecommendedSystemKW int                         `json:"recommended_system_kw"`
	SystemPackage       *SystemPackage              `json:"system_package,omitempty"`
	PackageItems        []SystemPackageItemResponse `json:"package_items,omitempty"`
	PackageTotalPrice   float64                     `json:"package_total_price,omitempty"`
}
