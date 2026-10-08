package repositories

import (
	"context"
	"database/sql"

	"solartech-energy/models"
)

type CategoryRepository struct {
	db *sql.DB
}

// //////////////////////////
func NewCategoryRepository(db *sql.DB) *CategoryRepository {
	return &CategoryRepository{
		db: db,
	}
}

// //////////////////////////
func (r *CategoryRepository) Create(
	ctx context.Context,
	category *models.Category,
) error {
	query := `
		INSERT INTO categories (
			name,
			description
		)
		VALUES ($1, $2)
		RETURNING id
	`

	return r.db.QueryRowContext(
		ctx,
		query,
		category.Name,
		category.Description,
	).Scan(&category.ID)
}
