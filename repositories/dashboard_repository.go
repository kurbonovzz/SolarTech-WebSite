package repositories

import (
	"context"
	"database/sql"

	"solartech-energy/models"
)

type DashboardRepository struct {
	db *sql.DB
}

func NewDashboardRepository(db *sql.DB) *DashboardRepository {
	return &DashboardRepository{
		db: db,
	}
}

func (r *DashboardRepository) Get(
	ctx context.Context,
) (*models.DashboardResponse, error) {
	query := `
		SELECT
			COUNT(*) AS total_orders,
			COUNT(*) FILTER (WHERE status = 'NEW') AS new_orders,
			COUNT(*) FILTER (WHERE status = 'CONFIRMED') AS confirmed_orders,
			COUNT(*) FILTER (WHERE status = 'COMPLETED') AS completed_orders,
			COUNT(*) FILTER (WHERE status = 'CANCELLED') AS cancelled_orders,
			COALESCE(
				SUM(total_price) FILTER (
					WHERE status IN ('CONFIRMED', 'COMPLETED')
				),
				0
			) AS total_revenue
		FROM orders
	`

	var dashboard models.DashboardResponse

	err := r.db.QueryRowContext(
		ctx,
		query,
	).Scan(
		&dashboard.TotalOrders,
		&dashboard.NewOrders,
		&dashboard.ConfirmedOrders,
		&dashboard.CompletedOrders,
		&dashboard.CancelledOrders,
		&dashboard.TotalRevenue,
	)

	if err != nil {
		return nil, err
	}

	err = r.db.QueryRowContext(
		ctx,
		`SELECT COUNT(*) FROM products WHERE stock_quantity <= min_stock AND is_active = TRUE`,
	).Scan(&dashboard.LowStockProducts)

	if err != nil {
		return nil, err
	}

	return &dashboard, nil
}
