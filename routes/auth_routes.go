package routes

import (
	"github.com/gin-gonic/gin"

	"solartech-energy/handlers"
)

func RegisterAuthRoutes(
	router *gin.Engine,
	handler *handlers.AuthHandler,
) {
	router.POST("/api/v1/auth/login", handler.Login)
}
