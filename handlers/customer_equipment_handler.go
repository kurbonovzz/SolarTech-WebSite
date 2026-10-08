package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"solartech-energy/models"
	"solartech-energy/services"
)

type CustomerEquipmentHandler struct {
	service *services.CustomerEquipmentService
}

func NewCustomerEquipmentHandler(
	service *services.CustomerEquipmentService,
) *CustomerEquipmentHandler {
	return &CustomerEquipmentHandler{
		service: service,
	}
}

func (h *CustomerEquipmentHandler) Create(c *gin.Context) {
	var equipment models.CustomerEquipment

	if err := c.ShouldBindJSON(&equipment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	if err := h.service.Create(
		c.Request.Context(),
		&equipment,
	); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":            "customer equipment created successfully",
		"customer_equipment": equipment,
	})
}
