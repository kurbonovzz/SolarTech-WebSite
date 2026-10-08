package routes

import (
	"github.com/gin-gonic/gin"

	"solartech-energy/handlers"
	"solartech-energy/middleware"
)

func RegisterSystemPackageRoutes(
	router *gin.Engine,
	systemPackageHandler *handlers.SystemPackageHandler,
	systemPackageItemHandler *handlers.SystemPackageItemHandler,
) {
	api := router.Group("/api/v1")
	api.Use(middleware.AuthRequired())

	// =========================
	// System Packages
	// =========================

	api.GET(
		"/system-packages",
		systemPackageHandler.GetAll,
	)

	api.POST(
		"/system-packages",
		systemPackageHandler.Create,
	)

	api.GET(
		"/system-packages/:id",
		systemPackageHandler.GetByID,
	)

	// =========================
	// System Package Items
	// =========================

	api.POST(
		"/system-package-items",
		systemPackageItemHandler.Create,
	)

	api.GET(
		"/system-package-items/package/:package_id",
		systemPackageItemHandler.GetDetailsByPackageID,
	)
}
