package services

import (
	"context"
	"errors"
	"strings"

	"solartech-energy/models"
	"solartech-energy/repositories"
)

type ProductService struct {
	repository *repositories.ProductRepository
}

// /////////////////////////////
func NewProductService(
	repository *repositories.ProductRepository,
) *ProductService {
	return &ProductService{
		repository: repository,
	}
}

// //////////////////////////////////
func (s *ProductService) Create(
	ctx context.Context,
	product *models.Product,
) error {
	product.Name = strings.TrimSpace(product.Name)
	product.Model = strings.TrimSpace(product.Model)
	product.Description = strings.TrimSpace(product.Description)

	if product.Name == "" {
		return errors.New("Необходимо указать название продукта.")
	}

	if product.ManufacturerID <= 0 {
		return errors.New("manufacturer_id is required")
	}

	if product.CategoryID <= 0 {
		return errors.New("category_id is required")
	}

	if product.Price < 0 {
		return errors.New("Цена не может быть отрицательной.")
	}

	if product.CostPrice < 0 {
		return errors.New("Себестоимость не может быть отрицательной.")
	}

	if product.StockQuantity < 0 {
		return errors.New("Количество товара на складе не может быть отрицательным.")
	}

	if product.MinStock < 0 {
		return errors.New("Минимальный запас не может быть отрицательным.")
	}

	return s.repository.Create(ctx, product)
}

// ///////////////////////////////////////
func (s *ProductService) GetAll(
	ctx context.Context,
) ([]models.Product, error) {
	return s.repository.GetAll(ctx)
}

// /////////////////////////
func (s *ProductService) GetByID(
	ctx context.Context,
	id int64,
) (*models.Product, error) {
	if id <= 0 {
		return nil, errors.New("invalid product id")
	}

	return s.repository.GetByID(ctx, id)
}

// ////////////////////////////
func (s *ProductService) Update(
	ctx context.Context,
	product *models.Product,
) error {
	if product.ID <= 0 {
		return errors.New("invalid product id")
	}

	product.Name = strings.TrimSpace(product.Name)
	product.Model = strings.TrimSpace(product.Model)
	product.Description = strings.TrimSpace(product.Description)

	if product.Name == "" {
		return errors.New("product name is required")
	}

	if product.ManufacturerID <= 0 {
		return errors.New("manufacturer_id is required")
	}

	if product.CategoryID <= 0 {
		return errors.New("category_id is required")
	}

	if product.Price < 0 {
		return errors.New("price cannot be negative")
	}

	if product.CostPrice < 0 {
		return errors.New("cost price cannot be negative")
	}

	if product.StockQuantity < 0 {
		return errors.New("stock quantity cannot be negative")
	}

	if product.MinStock < 0 {
		return errors.New("minimum stock cannot be negative")
	}

	return s.repository.Update(ctx, product)
}

// ///////////////////////////
func (s *ProductService) Delete(
	ctx context.Context,
	id int64,
) error {
	if id <= 0 {
		return errors.New("invalid product id")
	}

	return s.repository.Delete(ctx, id)
}
