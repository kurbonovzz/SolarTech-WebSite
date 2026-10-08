package repositories

import (
	"context"
	"database/sql"

	"solartech-energy/models"
)

type AdminRepository struct {
	db *sql.DB
}

func NewAdminRepository(db *sql.DB) *AdminRepository {
	return &AdminRepository{
		db: db,
	}
}

func (r *AdminRepository) Create(
	ctx context.Context,
	admin *models.Admin,
) error {
	query := `
		INSERT INTO admins (
			username,
			password_hash,
			role
		)
		VALUES ($1, $2, $3)
		RETURNING id, created_at
	`

	return r.db.QueryRowContext(
		ctx,
		query,
		admin.Username,
		admin.PasswordHash,
		admin.Role,
	).Scan(
		&admin.ID,
		&admin.CreatedAt,
	)
}

func (r *AdminRepository) GetByUsername(
	ctx context.Context,
	username string,
) (*models.Admin, error) {
	query := `
		SELECT
			id,
			username,
			password_hash,
			role,
			created_at
		FROM admins
		WHERE username = $1
	`

	var admin models.Admin

	err := r.db.QueryRowContext(
		ctx,
		query,
		username,
	).Scan(
		&admin.ID,
		&admin.Username,
		&admin.PasswordHash,
		&admin.Role,
		&admin.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &admin, nil
}
