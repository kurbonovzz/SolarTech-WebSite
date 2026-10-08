package routes

import (
	"solartech-energy/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterSystemPackageItemRoutes(
	router *gin.Engine,
	handler *handlers.SystemPackageItemHandler,
) {
	router.POST("/api/v1/system-package-items", handler.Create)

	router.GET(
		"/api/v1/system-package-items/package/:package_id",
		handler.GetDetailsByPackageID,
	)
}
