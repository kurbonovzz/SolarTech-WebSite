package routes

import (
	"github.com/gin-gonic/gin"

	"solartech-energy/handlers"
)

func RegisterManufacturerRoutes(
	router *gin.Engine,
	handler *handlers.ManufacturerHandler,
) {
	router.POST("/api/v1/manufacturers", handler.Create)
	router.GET("/api/v1/manufacturers", handler.GetAll)
}
