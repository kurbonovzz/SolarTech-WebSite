package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"solartech-energy/services"
)

type DashboardHandler struct {
	service *services.DashboardService
}

func NewDashboardHandler(
	service *services.DashboardService,
) *DashboardHandler {
	return &DashboardHandler{
		service: service,
	}
}

func (h *DashboardHandler) Get(c *gin.Context) {
	dashboard, err := h.service.Get(
		c.Request.Context(),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to get dashboard",
		})
		return
	}

	c.JSON(http.StatusOK, dashboard)
}
