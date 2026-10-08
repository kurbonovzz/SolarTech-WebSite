package services

import (
	"context"
	"errors"

	"solartech-energy/models"
	"solartech-energy/repositories"
)

type CustomerEquipmentService struct {
	repository *repositories.CustomerEquipmentRepository
}

func NewCustomerEquipmentService(
	repository *repositories.CustomerEquipmentRepository,
) *CustomerEquipmentService {
	return &CustomerEquipmentService{
		repository: repository,
	}
}

func (s *CustomerEquipmentService) Create(
	ctx context.Context,
	equipment *models.CustomerEquipment,
) error {
	if equipment.EquipmentTypeID <= 0 {
		return errors.New("equipment_type_id is required")
	}

	if equipment.Quantity <= 0 {
		return errors.New("quantity must be greater than zero")
	}

	return s.repository.Create(ctx, equipment)
}
