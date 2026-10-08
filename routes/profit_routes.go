package routes

import (
	"github.com/gin-gonic/gin"

	"solartech-energy/handlers"
)

func RegisterProfitRoutes(
	router *gin.Engine,
	handler *handlers.ProfitHandler,
) {
	router.GET("/api/v1/profit", handler.Get)
}
