package routes

import (
	"github.com/gin-gonic/gin"

	"solartech-energy/handlers"
)

func RegisterCustomerEquipmentRoutes(
	router *gin.Engine,
	handler *handlers.CustomerEquipmentHandler,
) {
	router.POST("/api/v1/customer-equipment", handler.Create)
}
