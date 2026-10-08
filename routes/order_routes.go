package routes

import (
	"solartech-energy/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterOrderRoutes(
	router *gin.Engine,
	handler *handlers.OrderHandler,
) {
	api := router.Group("/api/v1")

	api.POST("/orders", handler.Create)
	api.GET("/orders", handler.GetAll)
	api.PATCH("/orders/:id/status", handler.UpdateStatus)
	api.GET("/orders/:id", handler.GetByID)
	api.GET("/orders/:id/details", handler.GetOrderDetails)
	api.GET("/customers/:id/orders", handler.GetByCustomerID)

}
