package routes

import (
	"github.com/gin-gonic/gin"

	"solartech-energy/handlers"
)

func RegisterDashboardRoutes(
	router *gin.Engine,
	handler *handlers.DashboardHandler,
) {
	router.GET("/api/v1/dashboard", handler.Get)
}
