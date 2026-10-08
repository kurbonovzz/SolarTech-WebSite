package routes

import (
	"github.com/gin-gonic/gin"

	"solartech-energy/handlers"
	"solartech-energy/middleware"
)

func RegisterEquipmentTypeRoutes(
	router *gin.Engine,
	handler *handlers.EquipmentTypeHandler,
) {
	// Публичный список для калькулятора.
	router.GET(
		"/api/v1/equipment-types",
		handler.GetAll,
	)

	// Администратор.
	router.GET(
		"/api/v1/equipment-types/:id",
		middleware.AuthRequired(),
		handler.GetByID,
	)

	router.POST(
		"/api/v1/equipment-types",
		middleware.AuthRequired(),
		handler.Create,
	)

	router.PUT(
		"/api/v1/equipment-types/:id",
		middleware.AuthRequired(),
		handler.Update,
	)

	router.DELETE(
		"/api/v1/equipment-types/:id",
		middleware.AuthRequired(),
		handler.Delete,
	)
}
