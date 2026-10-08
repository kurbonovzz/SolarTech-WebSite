package repositories

import (
	"context"
	"database/sql"

	"solartech-energy/models"
)

type CustomerRepository struct {
	db *sql.DB
}

func NewCustomerRepository(db *sql.DB) *CustomerRepository {
	return &CustomerRepository{
		db: db,
	}
}

func (r *CustomerRepository) Create(
	ctx context.Context,
	customer *models.Customer,
) error {
	query := `
		INSERT INTO customers (
			name,
			phone
		)
		VALUES ($1, $2)
		RETURNING id, created_at
	`

	return r.db.QueryRowContext(
		ctx,
		query,
		customer.Name,
		customer.Phone,
	).Scan(
		&customer.ID,
		&customer.CreatedAt,
	)
}

func (r *CustomerRepository) GetByID(
	ctx context.Context,
	id int64,
) (*models.Customer, error) {
	query := `
		SELECT
			id,
			name,
			phone,
			created_at
		FROM customers
		WHERE id = $1
	`

	var customer models.Customer

	err := r.db.QueryRowContext(
		ctx,
		query,
		id,
	).Scan(
		&customer.ID,
		&customer.Name,
		&customer.Phone,
		&customer.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &customer, nil
}
