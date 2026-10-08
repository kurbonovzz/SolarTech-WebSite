package repositories

import (
	"context"
	"database/sql"
	"errors"
)

type InventoryRepository struct {
	db *sql.DB
}

func NewInventoryRepository(db *sql.DB) *InventoryRepository {
	return &InventoryRepository{
		db: db,
	}
}

func (r *InventoryRepository) DecreaseStock(
	ctx context.Context,
	tx *sql.Tx,
	productID int64,
	quantity int,
) error {
	if productID <= 0 {
		return errors.New("invalid product id")
	}

	if quantity <= 0 {
		return errors.New("quantity must be greater than zero")
	}

	query := `
		UPDATE products
		SET
			stock_quantity = stock_quantity - $1,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $2
		  AND stock_quantity >= $1
	`

	result, err := tx.ExecContext(
		ctx,
		query,
		quantity,
		productID,
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

// /////////////////////////////////
func (r *InventoryRepository) BeginTx(
	ctx context.Context,
) (*sql.Tx, error) {
	return r.db.BeginTx(ctx, nil)
}

func (r *InventoryRepository) DecreaseStockTx(
	tx *sql.Tx,
	productID int64,
	quantity int,
) error {
	if productID <= 0 {
		return errors.New("invalid product id")
	}

	if quantity <= 0 {
		return errors.New("quantity must be greater than zero")
	}

	query := `
		UPDATE products
		SET
			stock_quantity = stock_quantity - $1,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $2
		  AND stock_quantity >= $1
	`

	result, err := tx.Exec(
		query,
		quantity,
		productID,
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
