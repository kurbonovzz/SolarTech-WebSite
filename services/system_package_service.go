package services

import (
	"context"
	"errors"
	"strings"

	"solartech-energy/models"
	"solartech-energy/repositories"
)

type SystemPackageService struct {
	repository *repositories.SystemPackageRepository
}

func NewSystemPackageService(
	repository *repositories.SystemPackageRepository,
) *SystemPackageService {
	return &SystemPackageService{
		repository: repository,
	}
}

func (s *SystemPackageService) Create(
	ctx context.Context,
	pkg *models.SystemPackage,
) error {
	pkg.Name = strings.TrimSpace(pkg.Name)
	pkg.Description = strings.TrimSpace(pkg.Description)

	if pkg.Name == "" {
		return errors.New("package name is required")
	}

	if pkg.SystemPowerKW <= 0 {
		return errors.New("system power must be greater than zero")
	}

	if pkg.TotalPrice < 0 {
		return errors.New("total price cannot be negative")
	}

	return s.repository.Create(ctx, pkg)
}

func (s *SystemPackageService) GetAll(
	ctx context.Context,
) ([]models.SystemPackage, error) {
	return s.repository.GetAll(ctx)
}

func (s *SystemPackageService) GetByID(
	ctx context.Context,
	id int64,
) (*models.SystemPackage, error) {
	if id <= 0 {
		return nil, errors.New("invalid system package id")
	}

	return s.repository.GetByID(ctx, id)
}

func (s *SystemPackageService) GetByPower(
	ctx context.Context,
	powerKW float64,
) (*models.SystemPackage, error) {
	if powerKW <= 0 {
		return nil, errors.New("invalid system power")
	}

	return s.repository.GetByPower(ctx, powerKW)
}
