package services

import (
	"context"
	"errors"
	"strings"

	"solartech-energy/models"
	"solartech-energy/repositories"
)

type EquipmentTypeService struct {
	repository *repositories.EquipmentTypeRepository
}

func NewEquipmentTypeService(
	repository *repositories.EquipmentTypeRepository,
) *EquipmentTypeService {
	return &EquipmentTypeService{
		repository: repository,
	}
}

func (s *EquipmentTypeService) validate(
	equipment *models.EquipmentType,
) error {
	equipment.Name = strings.TrimSpace(equipment.Name)
	equipment.Description = strings.TrimSpace(equipment.Description)
	equipment.CalculationType = strings.TrimSpace(
		equipment.CalculationType,
	)

	if equipment.Name == "" {
		return errors.New("equipment type name is required")
	}

	if equipment.DefaultPowerW <= 0 {
		return errors.New("default power must be greater than zero")
	}

	if equipment.AveragePowerW < 0 {
		return errors.New("average power cannot be negative")
	}

	if equipment.DefaultHoursPerDay < 0 {
		return errors.New("hours per day cannot be negative")
	}

	if equipment.DefaultHoursPerDay > 24 {
		return errors.New("hours per day cannot be greater than 24")
	}

	if equipment.PowerFactor <= 0 {
		return errors.New("power factor must be greater than zero")
	}

	if equipment.CalculationType == "" {
		equipment.CalculationType = "quantity"
	}

	if equipment.CalculationType != "quantity" &&
		equipment.CalculationType != "power" {
		return errors.New(
			"calculation type must be quantity or power",
		)
	}

	return nil
}

func (s *EquipmentTypeService) Create(
	ctx context.Context,
	equipment *models.EquipmentType,
) error {
	if err := s.validate(equipment); err != nil {
		return err
	}

	return s.repository.Create(ctx, equipment)
}

func (s *EquipmentTypeService) GetAll(
	ctx context.Context,
) ([]models.EquipmentType, error) {
	return s.repository.GetAll(ctx)
}

func (s *EquipmentTypeService) GetByID(
	ctx context.Context,
	id int64,
) (*models.EquipmentType, error) {
	if id <= 0 {
		return nil, errors.New("invalid equipment type id")
	}

	return s.repository.GetByID(ctx, id)
}

func (s *EquipmentTypeService) Update(
	ctx context.Context,
	equipment *models.EquipmentType,
) error {
	if equipment.ID <= 0 {
		return errors.New("invalid equipment type id")
	}

	if err := s.validate(equipment); err != nil {
		return err
	}

	return s.repository.Update(ctx, equipment)
}

func (s *EquipmentTypeService) Delete(
	ctx context.Context,
	id int64,
) error {
	if id <= 0 {
		return errors.New("invalid equipment type id")
	}

	return s.repository.Delete(ctx, id)
}
