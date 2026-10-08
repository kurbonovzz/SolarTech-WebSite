package services

import (
	"context"
	"errors"
	"strings"

	"solartech-energy/models"
	"solartech-energy/repositories"
)

type CustomerService struct {
	repository *repositories.CustomerRepository
}

func NewCustomerService(
	repository *repositories.CustomerRepository,
) *CustomerService {
	return &CustomerService{
		repository: repository,
	}
}

func (s *CustomerService) Create(
	ctx context.Context,
	customer *models.Customer,
) error {
	customer.Name = strings.TrimSpace(customer.Name)
	customer.Phone = strings.TrimSpace(customer.Phone)

	if customer.Name == "" {
		return errors.New("customer name is required")
	}

	if customer.Phone == "" {
		return errors.New("customer phone is required")
	}

	return s.repository.Create(ctx, customer)
}

func (s *CustomerService) GetByID(
	ctx context.Context,
	id int64,
) (*models.Customer, error) {
	if id <= 0 {
		return nil, errors.New("invalid customer id")
	}

	return s.repository.GetByID(ctx, id)
}
