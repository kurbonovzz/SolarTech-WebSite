package routes

import (
	"github.com/gin-gonic/gin"

	"solartech-energy/handlers"
)

func RegisterProductRoutes(
	router *gin.Engine,
	handler *handlers.ProductHandler,
) {
	router.POST("/api/v1/products", handler.Create)
	router.GET("/api/v1/products", handler.GetAll)
	router.GET("/api/v1/products/:id", handler.GetByID)
	router.PUT("/api/v1/products/:id", handler.Update)
	router.DELETE("/api/v1/products/:id", handler.Delete)

}
