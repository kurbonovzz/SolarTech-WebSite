package routes

import (
	"solartech-energy/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterCustomerRoutes(
	router *gin.Engine,
	handler *handlers.CustomerHandler,
) {
	api := router.Group("/api/v1")

	api.POST("/customers", handler.Create)
	api.GET("/customers/:id", handler.GetByID)
}
