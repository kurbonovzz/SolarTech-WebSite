package services

import (
	"context"
	"errors"
	"os"
	"time"

	"golang.org/x/crypto/bcrypt"

	"solartech-energy/models"
	"solartech-energy/repositories"

	jwt "github.com/golang-jwt/jwt/v5"
)

type AuthService struct {
	adminRepository *repositories.AdminRepository
}

func NewAuthService(
	adminRepository *repositories.AdminRepository,
) *AuthService {
	return &AuthService{
		adminRepository: adminRepository,
	}
}

func (s *AuthService) Login(
	ctx context.Context,
	username string,
	password string,
) (*models.LoginResponse, error) {
	admin, err := s.adminRepository.GetByUsername(
		ctx,
		username,
	)
	if err != nil {
		return nil, errors.New("invalid username or password")
	}

	if err := bcrypt.CompareHashAndPassword(
		[]byte(admin.PasswordHash),
		[]byte(password),
	); err != nil {
		return nil, errors.New("invalid username or password")
	}

	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return nil, errors.New("JWT_SECRET is not configured")
	}

	token := jwt.NewWithClaims(
		jwt.SigningMethodHS256,
		jwt.MapClaims{
			"admin_id": admin.ID,
			"username": admin.Username,
			"role":     admin.Role,
			"exp":      time.Now().Add(24 * time.Hour).Unix(),
		},
	)

	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		return nil, err
	}

	return &models.LoginResponse{
		Token: tokenString,
		Admin: *admin,
	}, nil
}
