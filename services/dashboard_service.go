package services

import (
	"context"

	"solartech-energy/models"
	"solartech-energy/repositories"
)

type DashboardService struct {
	repository *repositories.DashboardRepository
}

func NewDashboardService(
	repository *repositories.DashboardRepository,
) *DashboardService {
	return &DashboardService{
		repository: repository,
	}
}

func (s *DashboardService) Get(
	ctx context.Context,
) (*models.DashboardResponse, error) {
	return s.repository.Get(ctx)
}
