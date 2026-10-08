package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"solartech-energy/models"
	"solartech-energy/services"
)

type SystemPackageItemHandler struct {
	service *services.SystemPackageItemService
}

func NewSystemPackageItemHandler(
	service *services.SystemPackageItemService,
) *SystemPackageItemHandler {
	return &SystemPackageItemHandler{
		service: service,
	}
}

func (h *SystemPackageItemHandler) Create(c *gin.Context) {
	var item models.SystemPackageItem

	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	if err := h.service.Create(
		c.Request.Context(),
		&item,
	); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":             "system package item created successfully",
		"system_package_item": item,
	})
}

// //////////
func (h *SystemPackageItemHandler) GetDetailsByPackageID(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid system package id",
		})
		return
	}

	items, err := h.service.GetDetailsByPackageID(
		c.Request.Context(),
		id,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to get package items",
		})
		return
	}

	totalPrice, err := h.service.CalculateTotalPrice(
		c.Request.Context(),
		id,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to calculate package price",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"items":       items,
		"total_price": totalPrice,
	})
}
