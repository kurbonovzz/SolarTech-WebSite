package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"solartech-energy/models"
	"solartech-energy/services"
)

type CategoryHandler struct {
	service *services.CategoryService
}

func NewCategoryHandler(
	service *services.CategoryService,
) *CategoryHandler {
	return &CategoryHandler{
		service: service,
	}
}

func (h *CategoryHandler) Create(c *gin.Context) {
	var category models.Category

	if err := c.ShouldBindJSON(&category); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	if err := h.service.Create(c.Request.Context(), &category); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "category created successfully",
		"category": category,
	})
}
