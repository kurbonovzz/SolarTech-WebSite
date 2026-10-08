package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"solartech-energy/services"
)

type ProfitHandler struct {
	service *services.ProfitService
}

func NewProfitHandler(
	service *services.ProfitService,
) *ProfitHandler {
	return &ProfitHandler{
		service: service,
	}
}

func (h *ProfitHandler) Get(c *gin.Context) {
	profit, err := h.service.Get(
		c.Request.Context(),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to get profit",
		})
		return
	}

	c.JSON(http.StatusOK, profit)
}
