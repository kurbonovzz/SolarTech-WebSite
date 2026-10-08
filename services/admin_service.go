package services

import (
	"context"
	"errors"
	"strings"

	"golang.org/x/crypto/bcrypt"

	"solartech-energy/models"
	"solartech-energy/repositories"
)

type AdminService struct {
	repository *repositories.AdminRepository
}

func NewAdminService(
	repository *repositories.AdminRepository,
) *AdminService {
	return &AdminService{
		repository: repository,
	}
}

func (s *AdminService) Create(
	ctx context.Context,
	admin *models.Admin,
	password string,
) error {
	admin.Username = strings.TrimSpace(admin.Username)
	admin.Role = strings.TrimSpace(admin.Role)

	if admin.Username == "" {
		return errors.New("username is required")
	}

	if len(password) < 6 {
		return errors.New("password must be at least 6 characters")
	}

	if admin.Role == "" {
		admin.Role = "ADMIN"
	}

	passwordHash, err := bcrypt.GenerateFromPassword(
		[]byte(password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		return err
	}

	admin.PasswordHash = string(passwordHash)

	return s.repository.Create(ctx, admin)
}

func (s *AdminService) GetByUsername(
	ctx context.Context,
	username string,
) (*models.Admin, error) {
	username = strings.TrimSpace(username)

	if username == "" {
		return nil, errors.New("username is required")
	}

	return s.repository.GetByUsername(ctx, username)
}
