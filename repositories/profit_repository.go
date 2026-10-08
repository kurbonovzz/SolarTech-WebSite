package repositories

import (
	"context"
	"database/sql"

	"solartech-energy/models"
)

type ProfitRepository struct {
	db *sql.DB
}

func NewProfitRepository(db *sql.DB) *ProfitRepository {
	return &ProfitRepository{
		db: db,
	}
}

func (r *ProfitRepository) Get(
	ctx context.Context,
) (*models.ProfitResponse, error) {
	query := `
		SELECT
			COUNT(DISTINCT o.id) AS total_orders,
			COALESCE(SUM(spi.quantity * p.price), 0) AS total_revenue,
			COALESCE(SUM(spi.quantity * p.cost_price), 0) AS total_cost,
			COALESCE(
				SUM(spi.quantity * (p.price - p.cost_price)),
				0
			) AS total_profit
		FROM orders o
		JOIN system_package_items spi
			ON spi.system_package_id = o.system_package_id
		JOIN products p
			ON p.id = spi.product_id
		WHERE o.status IN ('CONFIRMED', 'COMPLETED')
	`

	var profit models.ProfitResponse

	err := r.db.QueryRowContext(
		ctx,
		query,
	).Scan(
		&profit.TotalOrders,
		&profit.TotalRevenue,
		&profit.TotalCost,
		&profit.TotalProfit,
	)

	if err != nil {
		return nil, err
	}

	return &profit, nil
}
