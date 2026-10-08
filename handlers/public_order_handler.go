package handlers

import (
	"database/sql"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"solartech-energy/models"
	"solartech-energy/services"
)

type PublicOrderHandler struct {
	service *services.PublicOrderService
}

func NewPublicOrderHandler(
	service *services.PublicOrderService,
) *PublicOrderHandler {
	return &PublicOrderHandler{
		service: service,
	}
}

func (h *PublicOrderHandler) Create(c *gin.Context) {
	var request models.PublicOrderRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	order, customer, err := h.service.Create(
		c.Request.Context(),
		&request,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "system package not found",
			})
			return
		}

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "order created successfully",
		"customer": customer,
		"order":    order,
	})
}
