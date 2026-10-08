package repositories

import (
	"context"
	"database/sql"

	"solartech-energy/models"
)

type ManufacturerRepository struct {
	db *sql.DB
}

// /////////////////////////
func NewManufacturerRepository(db *sql.DB) *ManufacturerRepository {
	return &ManufacturerRepository{
		db: db,
	}
}

// /////////////////////////
func (r *ManufacturerRepository) Create(
	ctx context.Context,
	manufacturer *models.Manufacturer,
) error {
	query := `
		INSERT INTO manufacturers (
			name,
			country,
			website,
			description
		)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`

	return r.db.QueryRowContext(
		ctx,
		query,
		manufacturer.Name,
		manufacturer.Country,
		manufacturer.Website,
		manufacturer.Description,
	).Scan(&manufacturer.ID)
}

// ///////////////////////////
func (r *ManufacturerRepository) GetAll(
	ctx context.Context,
) ([]models.Manufacturer, error) {
	query := `
		SELECT
			id,
			name,
			country,
			website,
			description
		FROM manufacturers
		ORDER BY id ASC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var manufacturers []models.Manufacturer

	for rows.Next() {
		var manufacturer models.Manufacturer

		err := rows.Scan(
			&manufacturer.ID,
			&manufacturer.Name,
			&manufacturer.Country,
			&manufacturer.Website,
			&manufacturer.Description,
		)
		if err != nil {
			return nil, err
		}

		manufacturers = append(manufacturers, manufacturer)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return manufacturers, nil
}
