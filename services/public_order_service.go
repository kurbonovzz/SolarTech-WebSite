package services

import (
	"context"
	"errors"
	"strings"

	"solartech-energy/models"
	"solartech-energy/repositories"
)

type PublicOrderService struct {
	customerRepository       *repositories.CustomerRepository
	orderRepository          *repositories.OrderRepository
	systemPackageItemService *SystemPackageItemService
}

func NewPublicOrderService(
	customerRepository *repositories.CustomerRepository,
	orderRepository *repositories.OrderRepository,
	systemPackageItemService *SystemPackageItemService,
) *PublicOrderService {
	return &PublicOrderService{
		customerRepository:       customerRepository,
		orderRepository:          orderRepository,
		systemPackageItemService: systemPackageItemService,
	}
}

func (s *PublicOrderService) Create(
	ctx context.Context,
	request *models.PublicOrderRequest,
) (*models.Order, *models.Customer, error) {
	request.Name = strings.TrimSpace(request.Name)
	request.Phone = strings.TrimSpace(request.Phone)
	request.Comment = strings.TrimSpace(request.Comment)

	if request.Name == "" {
		return nil, nil, errors.New("customer name is required")
	}

	if request.Phone == "" {
		return nil, nil, errors.New("customer phone is required")
	}

	if request.SystemPackageID <= 0 {
		return nil, nil, errors.New("invalid system package id")
	}

	// Проверяем, что пакет существует и получаем реальную цену.
	totalPrice, err := s.systemPackageItemService.CalculateTotalPrice(
		ctx,
		request.SystemPackageID,
	)
	if err != nil {
		return nil, nil, err
	}

	if totalPrice <= 0 {
		return nil, nil, errors.New("system package price is invalid")
	}

	// Создаём клиента.
	customer := &models.Customer{
		Name:  request.Name,
		Phone: request.Phone,
	}

	if err := s.customerRepository.Create(
		ctx,
		customer,
	); err != nil {
		return nil, nil, err
	}

	// Создаём заказ.
	order := &models.Order{
		CustomerID:      customer.ID,
		SystemPackageID: request.SystemPackageID,
		TotalPrice:      totalPrice,
		Comment:         request.Comment,
		Status:          "NEW",
	}

	if err := s.orderRepository.Create(
		ctx,
		order,
	); err != nil {
		return nil, nil, err
	}

	return order, customer, nil
}
