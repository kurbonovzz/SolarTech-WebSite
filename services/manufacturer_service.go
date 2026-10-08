package services

import (
	"context"
	"errors"
	"strings"

	"solartech-energy/models"
	"solartech-energy/repositories"
)

type ManufacturerService struct {
	repository *repositories.ManufacturerRepository
}

func NewManufacturerService(
	repository *repositories.ManufacturerRepository,
) *ManufacturerService {
	return &ManufacturerService{
		repository: repository,
	}
}

func (s *ManufacturerService) Create(
	ctx context.Context,
	manufacturer *models.Manufacturer,
) error {
	manufacturer.Name = strings.TrimSpace(manufacturer.Name)
	manufacturer.Country = strings.TrimSpace(manufacturer.Country)
	manufacturer.Website = strings.TrimSpace(manufacturer.Website)
	manufacturer.Description = strings.TrimSpace(manufacturer.Description)

	if manufacturer.Name == "" {
		return errors.New("Необходимо указать наименование производителя.")
	}

	return s.repository.Create(ctx, manufacturer)
}

func (s *ManufacturerService) GetAll(
	ctx context.Context,
) ([]models.Manufacturer, error) {
	return s.repository.GetAll(ctx)
}
