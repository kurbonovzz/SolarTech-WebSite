package services

import (
	"context"
	"database/sql"
	"errors"
	"strings"

	"solartech-energy/models"
	"solartech-energy/repositories"
)

type OrderService struct {
	repository               *repositories.OrderRepository
	systemPackageItemService *SystemPackageItemService
	inventoryRepository      *repositories.InventoryRepository
}

// //////////////////////////////////
func NewOrderService(
	repository *repositories.OrderRepository,
	systemPackageItemService *SystemPackageItemService,
	inventoryRepository *repositories.InventoryRepository,
) *OrderService {
	return &OrderService{
		repository:               repository,
		systemPackageItemService: systemPackageItemService,
		inventoryRepository:      inventoryRepository,
	}
}

// ///////////////////
func (s *OrderService) Create(
	ctx context.Context,
	order *models.Order,
) error {
	if order.CustomerID <= 0 {
		return errors.New("invalid customer id")
	}

	if order.SystemPackageID <= 0 {
		return errors.New("invalid system package id")
	}

	order.Comment = strings.TrimSpace(order.Comment)
	order.Status = "NEW"

	// Получаем реальную цену пакета из базы.
	totalPrice, err := s.systemPackageItemService.CalculateTotalPrice(
		ctx,
		order.SystemPackageID,
	)
	if err != nil {
		return err
	}

	if totalPrice <= 0 {
		return errors.New("system package price is invalid")
	}

	// Не доверяем цене от клиента.
	order.TotalPrice = totalPrice

	return s.repository.Create(ctx, order)
}

func (s *OrderService) GetByID(
	ctx context.Context,
	id int64,
) (*models.Order, error) {
	if id <= 0 {
		return nil, errors.New("invalid order id")
	}

	return s.repository.GetByID(ctx, id)
}

// //////////////////
func (s *OrderService) GetAll(
	ctx context.Context,
) ([]models.Order, error) {
	return s.repository.GetAll(ctx)
}

// /////////
func (s *OrderService) UpdateStatus(
	ctx context.Context,
	id int64,
	status string,
) error {
	if id <= 0 {
		return errors.New("invalid order id")
	}

	status = strings.TrimSpace(status)

	switch status {
	case "NEW", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED":
		// valid status
	default:
		return errors.New("invalid order status")
	}

	// Для остальных изменений статуса используем обычное обновление.
	if status != "CONFIRMED" {
		return s.repository.UpdateStatus(ctx, id, status)
	}

	// Получаем заказ.
	order, err := s.repository.GetByID(ctx, id)
	if err != nil {
		return err
	}

	// Уже подтверждённый заказ повторно не подтверждаем.
	if order.Status == "CONFIRMED" {
		return errors.New("order is already confirmed")
	}

	// Получаем товары выбранного пакета.
	items, err := s.systemPackageItemService.GetByPackageID(
		ctx,
		order.SystemPackageID,
	)
	if err != nil {
		return err
	}

	if len(items) == 0 {
		return errors.New("system package has no items")
	}

	// Начинаем транзакцию.
	tx, err := s.inventoryRepository.BeginTx(ctx)
	if err != nil {
		return err
	}

	defer tx.Rollback()

	// Списываем каждый товар пакета.
	for _, item := range items {
		if err := s.inventoryRepository.DecreaseStockTx(
			tx,
			item.ProductID,
			item.Quantity,
		); err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				return errors.New("not enough product stock")
			}

			return err
		}
	}

	// Меняем статус заказа внутри той же транзакции.
	if err := s.repository.UpdateStatusTx(
		tx,
		id,
		"CONFIRMED",
	); err != nil {
		return err
	}

	// Всё прошло успешно.
	if err := tx.Commit(); err != nil {
		return err
	}

	return nil
}

// ///////////
func (s *OrderService) GetByCustomerID(
	ctx context.Context,
	customerID int64,
) ([]models.Order, error) {
	if customerID <= 0 {
		return nil, errors.New("invalid customer id")
	}

	return s.repository.GetByCustomerID(
		ctx,
		customerID,
	)
}

// ////////////////////////////////////////
func (s *OrderService) GetOrderDetails(
	ctx context.Context,
	orderID int64,
	customerService *CustomerService,
	systemPackageService *SystemPackageService,
) (*models.OrderDetailsResponse, error) {
	if orderID <= 0 {
		return nil, errors.New("invalid order id")
	}

	order, err := s.repository.GetByID(ctx, orderID)
	if err != nil {
		return nil, err
	}

	customer, err := customerService.GetByID(
		ctx,
		order.CustomerID,
	)
	if err != nil {
		return nil, err
	}

	systemPackage, err := systemPackageService.GetByID(
		ctx,
		order.SystemPackageID,
	)
	if err != nil {
		return nil, err
	}

	packageItems, err := s.systemPackageItemService.GetDetailsByPackageID(
		ctx,
		order.SystemPackageID,
	)
	if err != nil {
		return nil, err
	}

	return &models.OrderDetailsResponse{
		Customer:      *customer,
		Order:         *order,
		SystemPackage: systemPackage,
		PackageItems:  packageItems,
	}, nil
}
