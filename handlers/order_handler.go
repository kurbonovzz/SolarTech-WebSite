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

type OrderHandler struct {
	service              *services.OrderService
	customerService      *services.CustomerService
	systemPackageService *services.SystemPackageService
}

func NewOrderHandler(
	service *services.OrderService,
	customerService *services.CustomerService,
	systemPackageService *services.SystemPackageService,
) *OrderHandler {
	return &OrderHandler{
		service:              service,
		customerService:      customerService,
		systemPackageService: systemPackageService,
	}
}

func (h *OrderHandler) Create(c *gin.Context) {
	var order models.Order

	if err := c.ShouldBindJSON(&order); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	if err := h.service.Create(
		c.Request.Context(),
		&order,
	); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "order created successfully",
		"order":   order,
	})
}

func (h *OrderHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseInt(
		c.Param("id"),
		10,
		64,
	)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid order id",
		})
		return
	}

	order, err := h.service.GetByID(
		c.Request.Context(),
		id,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "order not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to get order",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"order": order,
	})
}

// /////////////////
func (h *OrderHandler) GetAll(c *gin.Context) {
	orders, err := h.service.GetAll(
		c.Request.Context(),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to get orders",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"orders": orders,
	})
}

// //////////////////
func (h *OrderHandler) UpdateStatus(c *gin.Context) {
	id, err := strconv.ParseInt(
		c.Param("id"),
		10,
		64,
	)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid order id",
		})
		return
	}

	var request struct {
		Status string `json:"status"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	if err := h.service.UpdateStatus(
		c.Request.Context(),
		id,
		request.Status,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "order not found",
			})
			return
		}

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "order status updated successfully",
		"order_id": id,
		"status":   request.Status,
	})
}

// ////////////////////////
func (h *OrderHandler) GetByCustomerID(c *gin.Context) {
	customerID, err := strconv.ParseInt(
		c.Param("id"),
		10,
		64,
	)
	if err != nil || customerID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid customer id",
		})
		return
	}

	customer, err := h.customerService.GetByID(
		c.Request.Context(),
		customerID,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "customer not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to get customer",
		})
		return
	}

	orders, err := h.service.GetByCustomerID(
		c.Request.Context(),
		customerID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to get customer orders",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"customer": customer,
		"orders":   orders,
	})
}

// ///////////////////////////////
func (h *OrderHandler) GetOrderDetails(c *gin.Context) {
	orderID, err := strconv.ParseInt(
		c.Param("id"),
		10,
		64,
	)
	if err != nil || orderID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid order id",
		})
		return
	}

	details, err := h.service.GetOrderDetails(
		c.Request.Context(),
		orderID,
		h.customerService,
		h.systemPackageService,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "order details not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to get order details",
		})
		return
	}

	c.JSON(http.StatusOK, details)
}
