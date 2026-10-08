package models

type DashboardResponse struct {
	TotalOrders      int     `json:"total_orders"`
	NewOrders        int     `json:"new_orders"`
	ConfirmedOrders  int     `json:"confirmed_orders"`
	CompletedOrders  int     `json:"completed_orders"`
	CancelledOrders  int     `json:"cancelled_orders"`
	TotalRevenue     float64 `json:"total_revenue"`
	LowStockProducts int     `json:"low_stock_products"`
}
