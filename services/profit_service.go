package services

import (
	"context"

	"solartech-energy/models"
	"solartech-energy/repositories"
)

type ProfitService struct {
	repository *repositories.ProfitRepository
}

func NewProfitService(
	repository *repositories.ProfitRepository,
) *ProfitService {
	return &ProfitService{
		repository: repository,
	}
}

func (s *ProfitService) Get(
	ctx context.Context,
) (*models.ProfitResponse, error) {
	return s.repository.Get(ctx)
}
