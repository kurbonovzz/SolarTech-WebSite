package repositories

import (
	"context"
	"database/sql"

	"solartech-energy/models"
)

type OrderRepository struct {
	db *sql.DB
}

func NewOrderRepository(db *sql.DB) *OrderRepository {
	return &OrderRepository{
		db: db,
	}
}

func (r *OrderRepository) Create(
	ctx context.Context,
	order *models.Order,
) error {
	query := `
		INSERT INTO orders (
			customer_id,
			system_package_id,
			total_price,
			comment,
			status
		)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`

	return r.db.QueryRowContext(
		ctx,
		query,
		order.CustomerID,
		order.SystemPackageID,
		order.TotalPrice,
		order.Comment,
		order.Status,
	).Scan(
		&order.ID,
		&order.CreatedAt,
		&order.UpdatedAt,
	)
}

func (r *OrderRepository) GetByID(
	ctx context.Context,
	id int64,
) (*models.Order, error) {
	query := `
		SELECT
			id,
			customer_id,
			system_package_id,
			total_price,
			comment,
			status,
			created_at,
			updated_at
		FROM orders
		WHERE id = $1
	`

	var order models.Order

	err := r.db.QueryRowContext(
		ctx,
		query,
		id,
	).Scan(
		&order.ID,
		&order.CustomerID,
		&order.SystemPackageID,
		&order.TotalPrice,
		&order.Comment,
		&order.Status,
		&order.CreatedAt,
		&order.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &order, nil
}

// //////////////
func (r *OrderRepository) GetAll(
	ctx context.Context,
) ([]models.Order, error) {
	query := `
		SELECT
			id,
			customer_id,
			system_package_id,
			total_price,
			comment,
			status,
			created_at,
			updated_at
		FROM orders
		ORDER BY id ASC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []models.Order

	for rows.Next() {
		var order models.Order

		err := rows.Scan(
			&order.ID,
			&order.CustomerID,
			&order.SystemPackageID,
			&order.TotalPrice,
			&order.Comment,
			&order.Status,
			&order.CreatedAt,
			&order.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		orders = append(orders, order)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return orders, nil
}

// /////////
func (r *OrderRepository) UpdateStatus(
	ctx context.Context,
	id int64,
	status string,
) error {
	query := `
		UPDATE orders
		SET
			status = $1,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $2
	`

	result, err := r.db.ExecContext(
		ctx,
		query,
		status,
		id,
	)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}

// //////////////////////////////////////////////
func (r *OrderRepository) UpdateStatusTx(
	tx *sql.Tx,
	id int64,
	status string,
) error {
	query := `
		UPDATE orders
		SET
			status = $1,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $2
	`

	result, err := tx.Exec(
		query,
		status,
		id,
	)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return sql.ErrNoRows
	}

	return nil
}

// ////////////////
func (r *OrderRepository) GetByCustomerID(
	ctx context.Context,
	customerID int64,
) ([]models.Order, error) {
	query := `
		SELECT
			id,
			customer_id,
			system_package_id,
			total_price,
			comment,
			status,
			created_at,
			updated_at
		FROM orders
		WHERE customer_id = $1
		ORDER BY id ASC
	`

	rows, err := r.db.QueryContext(
		ctx,
		query,
		customerID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	orders := make([]models.Order, 0)

	for rows.Next() {
		var order models.Order

		if err := rows.Scan(
			&order.ID,
			&order.CustomerID,
			&order.SystemPackageID,
			&order.TotalPrice,
			&order.Comment,
			&order.Status,
			&order.CreatedAt,
			&order.UpdatedAt,
		); err != nil {
			return nil, err
		}

		orders = append(orders, order)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return orders, nil
}
