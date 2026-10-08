package repositories

import (
	"context"
	"database/sql"

	"solartech-energy/models"
)

type CustomerEquipmentRepository struct {
	db *sql.DB
}

func NewCustomerEquipmentRepository(db *sql.DB) *CustomerEquipmentRepository {
	return &CustomerEquipmentRepository{
		db: db,
	}
}

func (r *CustomerEquipmentRepository) Create(
	ctx context.Context,
	equipment *models.CustomerEquipment,
) error {
	query := `
		INSERT INTO customer_equipment (
			equipment_type_id,
			quantity
		)
		VALUES ($1, $2)
		RETURNING id
	`

	return r.db.QueryRowContext(
		ctx,
		query,
		equipment.EquipmentTypeID,
		equipment.Quantity,
	).Scan(&equipment.ID)
}
