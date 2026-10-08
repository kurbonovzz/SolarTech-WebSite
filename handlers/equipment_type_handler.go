package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"solartech-energy/models"
	"solartech-energy/services"
)

type EquipmentTypeHandler struct {
	service *services.EquipmentTypeService
}

func NewEquipmentTypeHandler(
	service *services.EquipmentTypeService,
) *EquipmentTypeHandler {
	return &EquipmentTypeHandler{
		service: service,
	}
}

// ============================================================
// CREATE
// ============================================================

func (h *EquipmentTypeHandler) Create(c *gin.Context) {
	var equipment models.EquipmentType

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
		"message":        "equipment type created successfully",
		"equipment_type": equipment,
	})
}

// ============================================================
// GET ALL
// ============================================================

func (h *EquipmentTypeHandler) GetAll(c *gin.Context) {
	equipmentTypes, err := h.service.GetAll(
		c.Request.Context(),
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to get equipment types",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"equipment_types": equipmentTypes,
	})
}

// ============================================================
// GET BY ID
// ============================================================

func (h *EquipmentTypeHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseInt(
		c.Param("id"),
		10,
		64,
	)

	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid equipment type id",
		})
		return
	}

	equipment, err := h.service.GetByID(
		c.Request.Context(),
		id,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "equipment type not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"equipment_type": equipment,
	})
}

// ============================================================
// UPDATE
// ============================================================

func (h *EquipmentTypeHandler) Update(c *gin.Context) {
	id, err := strconv.ParseInt(
		c.Param("id"),
		10,
		64,
	)

	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid equipment type id",
		})
		return
	}

	var equipment models.EquipmentType

	if err := c.ShouldBindJSON(&equipment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	equipment.ID = id

	if err := h.service.Update(
		c.Request.Context(),
		&equipment,
	); err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "equipment type not found",
			})
			return
		}

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":        "equipment type updated successfully",
		"equipment_type": equipment,
	})
}

// ============================================================
// DELETE
// ============================================================

func (h *EquipmentTypeHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseInt(
		c.Param("id"),
		10,
		64,
	)

	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid equipment type id",
		})
		return
	}

	if err := h.service.Delete(
		c.Request.Context(),
		id,
	); err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "equipment type not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "equipment type deleted successfully",
	})
}
