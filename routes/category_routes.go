package routes

import (
	"github.com/gin-gonic/gin"

	"solartech-energy/handlers"
)

func RegisterCategoryRoutes(
	router *gin.Engine,
	handler *handlers.CategoryHandler,
) {
	router.POST("/api/v1/categories", handler.Create)
}
