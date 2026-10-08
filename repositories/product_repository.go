package repositories

import (
	"context"
	"database/sql"
	"errors"

	"solartech-energy/models"
)

type ProductRepository struct {
	db *sql.DB
}

// //////////////////////////////
func NewProductRepository(db *sql.DB) *ProductRepository {
	return &ProductRepository{
		db: db,
	}
}

// ///////////////////////////////
func (r *ProductRepository) Create(
	ctx context.Context,
	product *models.Product,
) error {
	query := `
		INSERT INTO products (
			manufacturer_id,
			category_id,
			name,
			model,
			description,
			power_w,
			capacity_kwh,
			price,
			cost_price,
			stock_quantity,
			min_stock,
			warranty_months,
			is_active
		)
		VALUES (
			$1, $2, $3, $4, $5, $6, $7,
			$8, $9, $10, $11, $12, $13
		)
		RETURNING id
	`

	return r.db.QueryRowContext(
		ctx,
		query,
		product.ManufacturerID,
		product.CategoryID,
		product.Name,
		product.Model,
		product.Description,
		product.PowerW,
		product.CapacityKWh,
		product.Price,
		product.CostPrice,
		product.StockQuantity,
		product.MinStock,
		product.WarrantyMonths,
		product.IsActive,
	).Scan(&product.ID)
}

// ////////////////////////////////////////////
func (r *ProductRepository) GetAll(
	ctx context.Context,
) ([]models.Product, error) {
	query := `
		SELECT
			id,
			manufacturer_id,
			category_id,
			name,
			model,
			description,
			power_w,
			capacity_kwh,
			price,
			cost_price,
			stock_quantity,
			min_stock,
			warranty_months,
			is_active
		FROM products
		ORDER BY id ASC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []models.Product

	for rows.Next() {
		var product models.Product

		err := rows.Scan(
			&product.ID,
			&product.ManufacturerID,
			&product.CategoryID,
			&product.Name,
			&product.Model,
			&product.Description,
			&product.PowerW,
			&product.CapacityKWh,
			&product.Price,
			&product.CostPrice,
			&product.StockQuantity,
			&product.MinStock,
			&product.WarrantyMonths,
			&product.IsActive,
		)
		if err != nil {
			return nil, err
		}

		products = append(products, product)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return products, nil
}

// /////////////////////////////////////////////
func (r *ProductRepository) GetByID(
	ctx context.Context,
	id int64,
) (*models.Product, error) {
	query := `
		SELECT
			id,
			manufacturer_id,
			category_id,
			name,
			model,
			description,
			power_w,
			capacity_kwh,
			price,
			cost_price,
			stock_quantity,
			min_stock,
			warranty_months,
			is_active
		FROM products
		WHERE id = $1
	`

	var product models.Product

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&product.ID,
		&product.ManufacturerID,
		&product.CategoryID,
		&product.Name,
		&product.Model,
		&product.Description,
		&product.PowerW,
		&product.CapacityKWh,
		&product.Price,
		&product.CostPrice,
		&product.StockQuantity,
		&product.MinStock,
		&product.WarrantyMonths,
		&product.IsActive,
	)

	if err != nil {
		return nil, err
	}

	return &product, nil
}

// //////////////////////////
func (r *ProductRepository) Update(
	ctx context.Context,
	product *models.Product,
) error {
	query := `
		UPDATE products
		SET
			manufacturer_id = $1,
			category_id = $2,
			name = $3,
			model = $4,
			description = $5,
			power_w = $6,
			capacity_kwh = $7,
			price = $8,
			cost_price = $9,
			stock_quantity = $10,
			min_stock = $11,
			warranty_months = $12,
			is_active = $13,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $14
	`

	result, err := r.db.ExecContext(
		ctx,
		query,
		product.ManufacturerID,
		product.CategoryID,
		product.Name,
		product.Model,
		product.Description,
		product.PowerW,
		product.CapacityKWh,
		product.Price,
		product.CostPrice,
		product.StockQuantity,
		product.MinStock,
		product.WarrantyMonths,
		product.IsActive,
		product.ID,
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

// //////////////////////////////////
func (r *ProductRepository) Delete(
	ctx context.Context,
	id int64,
) error {
	query := `
		DELETE FROM products
		WHERE id = $1
	`

	result, err := r.db.ExecContext(ctx, query, id)
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

// ///////////////
func (r *ProductRepository) DecreaseStock(
	ctx context.Context,
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

	result, err := r.db.ExecContext(
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
