package routes

import (
	"github.com/gin-gonic/gin"

	"solartech-energy/handlers"
)

func RegisterPublicOrderRoutes(
	router *gin.Engine,
	handler *handlers.PublicOrderHandler,
) {
	router.POST(
		"/api/v1/public/orders",
		handler.Create,
	)
}
