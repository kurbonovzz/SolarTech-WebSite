package main

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"solartech-energy/database"
	"solartech-energy/handlers"
	"solartech-energy/middleware"
	"solartech-energy/repositories"
	"solartech-energy/routes"
	"solartech-energy/services"
)

func main() {
	db, err := database.Connect()
	if err != nil {
		panic(err)
	}
	defer db.Close()

	router := gin.Default()

	// =========================
	// CORS
	// =========================
	router.Use(func(c *gin.Context) {
		origin := c.GetHeader("Origin")

		if origin != "" {
			c.Writer.Header().Set(
				"Access-Control-Allow-Origin",
				origin,
			)
		}

		c.Writer.Header().Set(
			"Access-Control-Allow-Credentials",
			"true",
		)

		c.Writer.Header().Set(
			"Access-Control-Allow-Headers",
			"Content-Type, Authorization",
		)

		c.Writer.Header().Set(
			"Access-Control-Allow-Methods",
			"GET, POST, PUT, PATCH, DELETE, OPTIONS",
		)

		c.Writer.Header().Set(
			"Access-Control-Expose-Headers",
			"Content-Length, Content-Type",
		)

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	})

	// =========================
	// Manufacturer
	// =========================
	manufacturerRepository := repositories.NewManufacturerRepository(db)

	manufacturerService := services.NewManufacturerService(
		manufacturerRepository,
	)

	manufacturerHandler := handlers.NewManufacturerHandler(
		manufacturerService,
	)

	routes.RegisterManufacturerRoutes(
		router,
		manufacturerHandler,
	)

	// =========================
	// Category
	// =========================
	categoryRepository := repositories.NewCategoryRepository(db)

	categoryService := services.NewCategoryService(
		categoryRepository,
	)

	categoryHandler := handlers.NewCategoryHandler(
		categoryService,
	)

	routes.RegisterCategoryRoutes(
		router,
		categoryHandler,
	)

	// =========================
	// Product
	// =========================
	productRepository := repositories.NewProductRepository(db)

	productService := services.NewProductService(
		productRepository,
	)

	productHandler := handlers.NewProductHandler(
		productService,
	)

	// -------------------------
	// PUBLIC PRODUCTS
	// -------------------------
	// Клиенты могут смотреть
	// товары без авторизации.
	router.GET(
		"/api/v1/products",
		productHandler.GetAll,
	)

	router.GET(
		"/api/v1/products/:id",
		productHandler.GetByID,
	)

	// -------------------------
	// ADMIN PRODUCTS
	// -------------------------
	// Добавление, изменение
	// и удаление — только ADMIN.
	productAdminRoutes := router.Group("/api/v1")

	productAdminRoutes.Use(
		middleware.AuthRequired(),
	)

	productAdminRoutes.Use(
		middleware.RequireRole("ADMIN"),
	)

	productAdminRoutes.POST(
		"/products",
		productHandler.Create,
	)

	productAdminRoutes.PUT(
		"/products/:id",
		productHandler.Update,
	)

	productAdminRoutes.DELETE(
		"/products/:id",
		productHandler.Delete,
	)

	// =========================
	// Equipment Types
	// =========================
	equipmentTypeRepository :=
		repositories.NewEquipmentTypeRepository(db)

	equipmentTypeService :=
		services.NewEquipmentTypeService(
			equipmentTypeRepository,
		)

	equipmentTypeHandler :=
		handlers.NewEquipmentTypeHandler(
			equipmentTypeService,
		)

	routes.RegisterEquipmentTypeRoutes(
		router,
		equipmentTypeHandler,
	)

	// =========================
	// Customer Equipment
	// =========================
	customerEquipmentRepository :=
		repositories.NewCustomerEquipmentRepository(db)

	customerEquipmentService :=
		services.NewCustomerEquipmentService(
			customerEquipmentRepository,
		)

	customerEquipmentHandler :=
		handlers.NewCustomerEquipmentHandler(
			customerEquipmentService,
		)

	routes.RegisterCustomerEquipmentRoutes(
		router,
		customerEquipmentHandler,
	)

	// =========================
	// Customer
	// =========================
	customerRepository :=
		repositories.NewCustomerRepository(db)

	customerService :=
		services.NewCustomerService(
			customerRepository,
		)

	customerHandler :=
		handlers.NewCustomerHandler(
			customerService,
		)

	routes.RegisterCustomerRoutes(
		router,
		customerHandler,
	)

	// =========================
	// System Package
	// =========================
	systemPackageRepository :=
		repositories.NewSystemPackageRepository(db)

	systemPackageService :=
		services.NewSystemPackageService(
			systemPackageRepository,
		)

	systemPackageHandler :=
		handlers.NewSystemPackageHandler(
			systemPackageService,
		)

	// =========================
	// System Package Items
	// =========================
	systemPackageItemRepository :=
		repositories.NewSystemPackageItemRepository(db)

	systemPackageItemService :=
		services.NewSystemPackageItemService(
			systemPackageItemRepository,
		)

	systemPackageItemHandler :=
		handlers.NewSystemPackageItemHandler(
			systemPackageItemService,
		)

	// Регистрируем System Package
	// и System Package Items только один раз.
	routes.RegisterSystemPackageRoutes(
		router,
		systemPackageHandler,
		systemPackageItemHandler,
	)

	// =========================
	// Inventory
	// =========================
	inventoryRepository :=
		repositories.NewInventoryRepository(db)

	// =========================
	// Order
	// =========================
	orderRepository :=
		repositories.NewOrderRepository(db)

	orderService :=
		services.NewOrderService(
			orderRepository,
			systemPackageItemService,
			inventoryRepository,
		)

	orderHandler :=
		handlers.NewOrderHandler(
			orderService,
			customerService,
			systemPackageService,
		)

	orderRoutes := router.Group("/api/v1")

	orderRoutes.Use(
		middleware.AuthRequired(),
	)

	orderRoutes.POST(
		"/orders",
		orderHandler.Create,
	)

	orderRoutes.GET(
		"/orders",
		orderHandler.GetAll,
	)

	orderRoutes.GET(
		"/orders/:id",
		orderHandler.GetByID,
	)

	orderRoutes.GET(
		"/orders/:id/details",
		orderHandler.GetOrderDetails,
	)

	orderRoutes.PATCH(
		"/orders/:id/status",
		orderHandler.UpdateStatus,
	)

	orderRoutes.GET(
		"/customers/:id/orders",
		orderHandler.GetByCustomerID,
	)

	// =========================
	// Public Order
	// =========================
	publicOrderService :=
		services.NewPublicOrderService(
			customerRepository,
			orderRepository,
			systemPackageItemService,
		)

	publicOrderHandler :=
		handlers.NewPublicOrderHandler(
			publicOrderService,
		)

	routes.RegisterPublicOrderRoutes(
		router,
		publicOrderHandler,
	)

	// =========================
	// Dashboard
	// =========================
	dashboardRepository :=
		repositories.NewDashboardRepository(db)

	dashboardService :=
		services.NewDashboardService(
			dashboardRepository,
		)

	dashboardHandler :=
		handlers.NewDashboardHandler(
			dashboardService,
		)

	dashboardRoutes :=
		router.Group("/api/v1")

	dashboardRoutes.Use(
		middleware.AuthRequired(),
	)

	dashboardRoutes.Use(
		middleware.RequireRole("ADMIN"),
	)

	dashboardRoutes.GET(
		"/dashboard",
		dashboardHandler.Get,
	)

	// =========================
	// Profit
	// =========================
	profitRepository :=
		repositories.NewProfitRepository(db)

	profitService :=
		services.NewProfitService(
			profitRepository,
		)

	profitHandler :=
		handlers.NewProfitHandler(
			profitService,
		)

	profitRoutes :=
		router.Group("/api/v1")

	profitRoutes.Use(
		middleware.AuthRequired(),
	)

	profitRoutes.Use(
		middleware.RequireRole("ADMIN"),
	)

	profitRoutes.GET(
		"/profit",
		profitHandler.Get,
	)

	// =========================
	// Admin / Auth
	// =========================
	adminRepository :=
		repositories.NewAdminRepository(db)

	authService :=
		services.NewAuthService(
			adminRepository,
		)

	authHandler :=
		handlers.NewAuthHandler(
			authService,
		)

	routes.RegisterAuthRoutes(
		router,
		authHandler,
	)

	// =========================
	// Calculator
	// =========================
	calculatorHandler :=
		handlers.NewCalculatorHandler(
			equipmentTypeService,
			systemPackageService,
			systemPackageItemService,
		)

	calculatorRoutes :=
		router.Group("/api/v1")

	// Публичный Calculator.
	calculatorRoutes.POST(
		"/calculator/calculate",
		calculatorHandler.Calculate,
	)

	// =========================
	// Health Check
	// =========================
	router.GET(
		"/health",
		func(c *gin.Context) {
			c.JSON(
				http.StatusOK,
				gin.H{
					"status":   "ok",
					"message":  "SolarTech API is running",
					"database": "connected",
				},
			)
		},
	)

	// =========================
	// Server
	// =========================
	if err := router.Run(":8080"); err != nil {
		panic(err)
	}
}
