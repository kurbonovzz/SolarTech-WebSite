package repositories

import (
	"context"
	"database/sql"

	"solartech-energy/models"
)

type EquipmentTypeRepository struct {
	db *sql.DB
}

func NewEquipmentTypeRepository(db *sql.DB) *EquipmentTypeRepository {
	return &EquipmentTypeRepository{
		db: db,
	}
}

// ============================================================
// CREATE
// ============================================================

func (r *EquipmentTypeRepository) Create(
	ctx context.Context,
	equipment *models.EquipmentType,
) error {
	query := `
		INSERT INTO equipment_types (
			name,
			default_power_w,
			average_power_w,
			default_hours_per_day,
			power_factor,
			description,
			is_active,
			calculation_type
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id
	`

	return r.db.QueryRowContext(
		ctx,
		query,
		equipment.Name,
		equipment.DefaultPowerW,
		equipment.AveragePowerW,
		equipment.DefaultHoursPerDay,
		equipment.PowerFactor,
		equipment.Description,
		equipment.IsActive,
		equipment.CalculationType,
	).Scan(&equipment.ID)
}

// ============================================================
// GET ALL
// ============================================================

func (r *EquipmentTypeRepository) GetAll(
	ctx context.Context,
) ([]models.EquipmentType, error) {
	query := `
		SELECT
			id,
			name,
			COALESCE(default_power_w, 0),
			COALESCE(average_power_w, 0),
			COALESCE(default_hours_per_day, 0),
			COALESCE(power_factor, 1),
			COALESCE(description, ''),
			is_active,
			COALESCE(calculation_type, 'quantity')
		FROM equipment_types
		WHERE is_active = TRUE
		ORDER BY id ASC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	equipmentTypes := make(
		[]models.EquipmentType,
		0,
	)

	for rows.Next() {
		var equipment models.EquipmentType

		err := rows.Scan(
			&equipment.ID,
			&equipment.Name,
			&equipment.DefaultPowerW,
			&equipment.AveragePowerW,
			&equipment.DefaultHoursPerDay,
			&equipment.PowerFactor,
			&equipment.Description,
			&equipment.IsActive,
			&equipment.CalculationType,
		)

		if err != nil {
			return nil, err
		}

		equipmentTypes = append(
			equipmentTypes,
			equipment,
		)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return equipmentTypes, nil
}

// ============================================================
// GET BY ID
// ============================================================

func (r *EquipmentTypeRepository) GetByID(
	ctx context.Context,
	id int64,
) (*models.EquipmentType, error) {
	query := `
		SELECT
			id,
			name,
			COALESCE(default_power_w, 0),
			COALESCE(average_power_w, 0),
			COALESCE(default_hours_per_day, 0),
			COALESCE(power_factor, 1),
			COALESCE(description, ''),
			is_active,
			COALESCE(calculation_type, 'quantity')
		FROM equipment_types
		WHERE id = $1
		  AND is_active = TRUE
	`

	var equipment models.EquipmentType

	err := r.db.QueryRowContext(
		ctx,
		query,
		id,
	).Scan(
		&equipment.ID,
		&equipment.Name,
		&equipment.DefaultPowerW,
		&equipment.AveragePowerW,
		&equipment.DefaultHoursPerDay,
		&equipment.PowerFactor,
		&equipment.Description,
		&equipment.IsActive,
		&equipment.CalculationType,
	)

	if err != nil {
		return nil, err
	}

	return &equipment, nil
}

// ============================================================
// UPDATE
// ============================================================

func (r *EquipmentTypeRepository) Update(
	ctx context.Context,
	equipment *models.EquipmentType,
) error {
	query := `
		UPDATE equipment_types
		SET
			name = $1,
			default_power_w = $2,
			average_power_w = $3,
			default_hours_per_day = $4,
			power_factor = $5,
			description = $6,
			is_active = $7,
			calculation_type = $8
		WHERE id = $9
	`

	result, err := r.db.ExecContext(
		ctx,
		query,
		equipment.Name,
		equipment.DefaultPowerW,
		equipment.AveragePowerW,
		equipment.DefaultHoursPerDay,
		equipment.PowerFactor,
		equipment.Description,
		equipment.IsActive,
		equipment.CalculationType,
		equipment.ID,
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

// ============================================================
// DELETE
// ============================================================

func (r *EquipmentTypeRepository) Delete(
	ctx context.Context,
	id int64,
) error {
	query := `
		UPDATE equipment_types
		SET is_active = FALSE
		WHERE id = $1
	`

	result, err := r.db.ExecContext(
		ctx,
		query,
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
