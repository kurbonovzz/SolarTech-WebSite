package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"solartech-energy/models"
	"solartech-energy/services"
)

type ManufacturerHandler struct {
	service *services.ManufacturerService
}

func NewManufacturerHandler(
	service *services.ManufacturerService,
) *ManufacturerHandler {
	return &ManufacturerHandler{
		service: service,
	}
}

func (h *ManufacturerHandler) Create(c *gin.Context) {
	var manufacturer models.Manufacturer

	if err := c.ShouldBindJSON(&manufacturer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	if err := h.service.Create(c.Request.Context(), &manufacturer); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":      "manufacturer created successfully",
		"manufacturer": manufacturer,
	})
}

func (h *ManufacturerHandler) GetAll(c *gin.Context) {
	manufacturers, err := h.service.GetAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to get manufacturers",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"manufacturers": manufacturers,
	})
}
