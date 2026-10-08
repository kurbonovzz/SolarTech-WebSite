package handlers

import (
	"database/sql"
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"solartech-energy/models"
	"solartech-energy/services"
)

type SystemPackageHandler struct {
	service *services.SystemPackageService
}

func NewSystemPackageHandler(
	service *services.SystemPackageService,
) *SystemPackageHandler {
	return &SystemPackageHandler{
		service: service,
	}
}

func (h *SystemPackageHandler) Create(c *gin.Context) {
	var pkg models.SystemPackage

	if err := c.ShouldBindJSON(&pkg); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	if err := h.service.Create(
		c.Request.Context(),
		&pkg,
	); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":        "system package created successfully",
		"system_package": pkg,
	})
}

func (h *SystemPackageHandler) GetAll(c *gin.Context) {
	packages, err := h.service.GetAll(
		c.Request.Context(),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to get system packages",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"system_packages": packages,
	})
}

func (h *SystemPackageHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid system package id",
		})
		return
	}

	pkg, err := h.service.GetByID(
		c.Request.Context(),
		id,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "system package not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to get system package",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"system_package": pkg,
	})
}
