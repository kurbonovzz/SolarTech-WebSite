package repositories

import (
	"context"
	"database/sql"

	"solartech-energy/models"
)

type SystemPackageRepository struct {
	db *sql.DB
}

func NewSystemPackageRepository(db *sql.DB) *SystemPackageRepository {
	return &SystemPackageRepository{
		db: db,
	}
}

func (r *SystemPackageRepository) Create(
	ctx context.Context,
	pkg *models.SystemPackage,
) error {
	query := `
		INSERT INTO system_packages (
			name,
			system_power_kw,
			description,
			total_price,
			is_active
		)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`

	return r.db.QueryRowContext(
		ctx,
		query,
		pkg.Name,
		pkg.SystemPowerKW,
		pkg.Description,
		pkg.TotalPrice,
		pkg.IsActive,
	).Scan(&pkg.ID)
}

func (r *SystemPackageRepository) GetAll(
	ctx context.Context,
) ([]models.SystemPackage, error) {
	query := `
		SELECT
			id,
			name,
			system_power_kw,
			description,
			total_price,
			is_active
		FROM system_packages
		ORDER BY system_power_kw ASC, id ASC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	packages := make([]models.SystemPackage, 0)

	for rows.Next() {
		var pkg models.SystemPackage

		err := rows.Scan(
			&pkg.ID,
			&pkg.Name,
			&pkg.SystemPowerKW,
			&pkg.Description,
			&pkg.TotalPrice,
			&pkg.IsActive,
		)
		if err != nil {
			return nil, err
		}

		packages = append(packages, pkg)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return packages, nil
}

func (r *SystemPackageRepository) GetByID(
	ctx context.Context,
	id int64,
) (*models.SystemPackage, error) {
	query := `
		SELECT
			id,
			name,
			system_power_kw,
			description,
			total_price,
			is_active
		FROM system_packages
		WHERE id = $1
		  AND is_active = TRUE
	`

	var pkg models.SystemPackage

	err := r.db.QueryRowContext(
		ctx,
		query,
		id,
	).Scan(
		&pkg.ID,
		&pkg.Name,
		&pkg.SystemPowerKW,
		&pkg.Description,
		&pkg.TotalPrice,
		&pkg.IsActive,
	)

	if err != nil {
		return nil, err
	}

	return &pkg, nil
}

func (r *SystemPackageRepository) GetByPower(
	ctx context.Context,
	powerKW float64,
) (*models.SystemPackage, error) {
	query := `
		SELECT
			id,
			name,
			system_power_kw,
			description,
			total_price,
			is_active
		FROM system_packages
		WHERE system_power_kw >= $1
		  AND is_active = TRUE
		ORDER BY system_power_kw ASC
		LIMIT 1
	`

	var pkg models.SystemPackage

	err := r.db.QueryRowContext(
		ctx,
		query,
		powerKW,
	).Scan(
		&pkg.ID,
		&pkg.Name,
		&pkg.SystemPowerKW,
		&pkg.Description,
		&pkg.TotalPrice,
		&pkg.IsActive,
	)

	if err != nil {
		return nil, err
	}

	return &pkg, nil
}
