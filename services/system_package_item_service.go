package services

import (
	"context"
	"errors"

	"solartech-energy/models"
	"solartech-energy/repositories"
)

type SystemPackageItemService struct {
	repository *repositories.SystemPackageItemRepository
}

func NewSystemPackageItemService(
	repository *repositories.SystemPackageItemRepository,
) *SystemPackageItemService {
	return &SystemPackageItemService{
		repository: repository,
	}
}

func (s *SystemPackageItemService) Create(
	ctx context.Context,
	item *models.SystemPackageItem,
) error {
	if item.SystemPackageID <= 0 {
		return errors.New("system_package_id is required")
	}

	if item.ProductID <= 0 {
		return errors.New("product_id is required")
	}

	if item.Quantity <= 0 {
		return errors.New("quantity must be greater than zero")
	}

	return s.repository.Create(ctx, item)
}

// /////
func (s *SystemPackageItemService) GetByPackageID(
	ctx context.Context,
	packageID int64,
) ([]models.SystemPackageItem, error) {
	if packageID <= 0 {
		return nil, errors.New("invalid system package id")
	}

	return s.repository.GetByPackageID(ctx, packageID)
}

// /////
func (s *SystemPackageItemService) GetDetailsByPackageID(
	ctx context.Context,
	packageID int64,
) ([]models.SystemPackageItemResponse, error) {
	if packageID <= 0 {
		return nil, errors.New("invalid system package id")
	}

	return s.repository.GetDetailsByPackageID(ctx, packageID)
}

// //////
func (s *SystemPackageItemService) CalculateTotalPrice(
	ctx context.Context,
	packageID int64,
) (float64, error) {
	if packageID <= 0 {
		return 0, errors.New("invalid system package id")
	}

	items, err := s.GetDetailsByPackageID(ctx, packageID)
	if err != nil {
		return 0, err
	}

	var total float64

	for _, item := range items {
		total += item.TotalPrice
	}

	return total, nil
}
