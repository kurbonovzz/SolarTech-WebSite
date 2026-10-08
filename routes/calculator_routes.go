package routes

import (
	"github.com/gin-gonic/gin"

	"solartech-energy/handlers"
)

func RegisterCalculatorRoutes(
	router *gin.Engine,
	handler *handlers.CalculatorHandler,
) {
	router.POST("/api/v1/calculator/calculate", handler.Calculate)
}
