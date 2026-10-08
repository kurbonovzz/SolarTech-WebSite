package repositories

import (
	"context"
	"database/sql"

	"solartech-energy/models"
)

type SystemPackageItemRepository struct {
	db *sql.DB
}

func NewSystemPackageItemRepository(db *sql.DB) *SystemPackageItemRepository {
	return &SystemPackageItemRepository{
		db: db,
	}
}

func (r *SystemPackageItemRepository) Create(
	ctx context.Context,
	item *models.SystemPackageItem,
) error {
	query := `
		INSERT INTO system_package_items (
			system_package_id,
			product_id,
			quantity
		)
		VALUES ($1, $2, $3)
		RETURNING id
	`

	return r.db.QueryRowContext(
		ctx,
		query,
		item.SystemPackageID,
		item.ProductID,
		item.Quantity,
	).Scan(&item.ID)
}

// //////
func (r *SystemPackageItemRepository) GetByPackageID(
	ctx context.Context,
	packageID int64,
) ([]models.SystemPackageItem, error) {
	query := `
		SELECT
			id,
			system_package_id,
			product_id,
			quantity
		FROM system_package_items
		WHERE system_package_id = $1
		ORDER BY id
	`

	rows, err := r.db.QueryContext(
		ctx,
		query,
		packageID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]models.SystemPackageItem, 0)

	for rows.Next() {
		var item models.SystemPackageItem

		if err := rows.Scan(
			&item.ID,
			&item.SystemPackageID,
			&item.ProductID,
			&item.Quantity,
		); err != nil {
			return nil, err
		}

		items = append(items, item)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return items, nil
}

// /////
func (r *SystemPackageItemRepository) GetDetailsByPackageID(
	ctx context.Context,
	packageID int64,
) ([]models.SystemPackageItemResponse, error) {
	query := `
		SELECT
			spi.id,
			p.id,
			p.name,
			c.name,
			spi.quantity,
			p.price,
			(spi.quantity * p.price)
		FROM system_package_items spi
		JOIN products p
			ON p.id = spi.product_id
		JOIN categories c
			ON c.id = p.category_id
		WHERE spi.system_package_id = $1
		ORDER BY spi.id
	`

	rows, err := r.db.QueryContext(
		ctx,
		query,
		packageID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]models.SystemPackageItemResponse, 0)

	for rows.Next() {
		var item models.SystemPackageItemResponse

		if err := rows.Scan(
			&item.ID,
			&item.ProductID,
			&item.ProductName,
			&item.Category,
			&item.Quantity,
			&item.UnitPrice,
			&item.TotalPrice,
		); err != nil {
			return nil, err
		}

		items = append(items, item)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return items, nil
}
