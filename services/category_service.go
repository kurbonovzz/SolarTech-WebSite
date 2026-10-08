package services

import (
	"context"
	"errors"
	"strings"

	"solartech-energy/models"
	"solartech-energy/repositories"
)

type CategoryService struct {
	repository *repositories.CategoryRepository
}

func NewCategoryService(
	repository *repositories.CategoryRepository,
) *CategoryService {
	return &CategoryService{
		repository: repository,
	}
}

func (s *CategoryService) Create(
	ctx context.Context,
	category *models.Category,
) error {
	category.Name = strings.TrimSpace(category.Name)
	category.Description = strings.TrimSpace(category.Description)

	if category.Name == "" {
		return errors.New("Необходимо указать название категории.")
	}

	return s.repository.Create(ctx, category)
}
