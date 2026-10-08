package handlers

import (
	"database/sql"
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"solartech-energy/models"
	"solartech-energy/services"
	calculator "solartech-energy/services/calculator"
)

type CalculatorHandler struct {
	equipmentTypeService     *services.EquipmentTypeService
	systemPackageService     *services.SystemPackageService
	systemPackageItemService *services.SystemPackageItemService
}

func NewCalculatorHandler(
	equipmentTypeService *services.EquipmentTypeService,
	systemPackageService *services.SystemPackageService,
	systemPackageItemService *services.SystemPackageItemService,
) *CalculatorHandler {

	return &CalculatorHandler{
		equipmentTypeService:     equipmentTypeService,
		systemPackageService:     systemPackageService,
		systemPackageItemService: systemPackageItemService,
	}
}

func (h *CalculatorHandler) Calculate(c *gin.Context) {

	var request models.CalculatorRequest

	if err := c.ShouldBindJSON(&request); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})

		return
	}

	if len(request.Equipment) == 0 {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "equipment list cannot be empty",
		})

		return
	}

	equipment := make(
		[]calculator.EquipmentInput,
		0,
		len(request.Equipment),
	)

	for _, item := range request.Equipment {

		if item.EquipmentTypeID <= 0 {

			c.JSON(http.StatusBadRequest, gin.H{
				"error": "equipment_type_id must be greater than zero",
			})

			return
		}

		equipmentType, err :=
			h.equipmentTypeService.GetByID(
				c.Request.Context(),
				item.EquipmentTypeID,
			)

		if err != nil {

			if errors.Is(err, sql.ErrNoRows) {

				c.JSON(http.StatusNotFound, gin.H{
					"error": "equipment type not found",
				})

				return
			}

			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "failed to get equipment type",
			})

			return
		}

		calculationType :=
			strings.TrimSpace(
				equipmentType.CalculationType,
			)

		if calculationType == "" {
			calculationType = "quantity"
		}

		// =================================================
		// ОПРЕДЕЛЯЕМ СЕЗОННОСТЬ
		// =================================================

		seasonGroup :=
			getEquipmentSeason(
				equipmentType.Name,
				equipmentType.Description,
			)

		// =================================================
		// ОСВЕЩЕНИЕ
		// =================================================

		if calculationType == "power" {

			if item.SelectedPowerKW <= 0 {

				c.JSON(http.StatusBadRequest, gin.H{
					"error": "selected_power_kw must be greater than zero for power equipment",
				})

				return
			}

			equipment = append(
				equipment,
				calculator.EquipmentInput{
					PowerW: equipmentType.DefaultPowerW,

					AveragePowerW: equipmentType.AveragePowerW,

					HoursPerDay: equipmentType.DefaultHoursPerDay,

					Quantity: 1,

					CalculationType: "power",

					SelectedPowerKW: item.SelectedPowerKW,

					SeasonGroup: "all_year",
				},
			)

			continue
		}

		// =================================================
		// ОБЫЧНАЯ ТЕХНИКА
		// =================================================

		if item.Quantity <= 0 {

			c.JSON(http.StatusBadRequest, gin.H{
				"error": "quantity must be greater than zero",
			})

			return
		}

		equipment = append(
			equipment,
			calculator.EquipmentInput{

				PowerW: equipmentType.DefaultPowerW,

				AveragePowerW: equipmentType.AveragePowerW,

				HoursPerDay: equipmentType.DefaultHoursPerDay,

				Quantity: item.Quantity,

				CalculationType: "quantity",

				SelectedPowerKW: 0,

				SeasonGroup: seasonGroup,
			},
		)
	}

	// =================================================
	// РАСЧЁТ
	// =================================================

	result :=
		calculator.Calculate(
			equipment,
		)

	// =================================================
	// ПОЛУЧАЕМ ГОТОВЫЙ ПАКЕТ
	// =================================================

	systemPackage, err :=
		h.systemPackageService.GetByPower(
			c.Request.Context(),
			result.RecommendedSystemKW,
		)

	if err != nil {

		if errors.Is(err, sql.ErrNoRows) {

			c.JSON(http.StatusOK, gin.H{

				"total_power_w": result.TotalPowerW,

				"total_power_kw": result.TotalPowerKW,

				"required_power_w": result.RequiredPowerW,

				"required_power_kw": result.RequiredPowerKW,

				"recommended_system_kw": result.RecommendedSystemKW,

				"simultaneous_power_w": result.SimultaneousPowerW,

				"simultaneous_power_kw": result.SimultaneousPowerKW,

				"daily_energy_wh": result.DailyEnergyWh,

				"daily_energy_kwh": result.DailyEnergyKWh,

				"seasonal_adjustment": result.SeasonalAdjustment,

				"calculation_message": result.CalculationMessage,

				"system_package": nil,

				"package_items": nil,

				"package_total_price": 0,

				"message": "recommended system package is not available",
			})

			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to find system package",
		})

		return
	}

	// =================================================
	// ТОВАРЫ ПАКЕТА
	// =================================================

	packageItems, err :=
		h.systemPackageItemService.
			GetDetailsByPackageID(
				c.Request.Context(),
				systemPackage.ID,
			)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to get system package items",
		})

		return
	}

	// =================================================
	// ЦЕНА ПАКЕТА
	// =================================================

	packageTotalPrice, err :=
		h.systemPackageItemService.
			CalculateTotalPrice(
				c.Request.Context(),
				systemPackage.ID,
			)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to calculate package price",
		})

		return
	}

	// =================================================
	// ФИНАЛЬНЫЙ ОТВЕТ
	// =================================================

	c.JSON(http.StatusOK, gin.H{

		"total_power_w": result.TotalPowerW,

		"total_power_kw": result.TotalPowerKW,

		"required_power_w": result.RequiredPowerW,

		"required_power_kw": result.RequiredPowerKW,

		"recommended_system_kw": result.RecommendedSystemKW,

		"simultaneous_power_w": result.SimultaneousPowerW,

		"simultaneous_power_kw": result.SimultaneousPowerKW,

		"daily_energy_wh": result.DailyEnergyWh,

		"daily_energy_kwh": result.DailyEnergyKWh,

		"seasonal_adjustment": result.SeasonalAdjustment,

		"calculation_message": result.CalculationMessage,

		"system_package": systemPackage,

		"package_items": packageItems,

		"package_total_price": packageTotalPrice,
	})
}

// =====================================================
// ОПРЕДЕЛЕНИЕ СЕЗОННОСТИ
// =====================================================
//
// Здесь мы не заставляем клиента самому выбирать
// сезон каждой техники.
//
// Backend определяет его по названию и описанию.
//
// =====================================================

func getEquipmentSeason(
	name string,
	description string,
) string {

	text :=
		strings.ToLower(
			name + " " + description,
		)

	// -------------------------------------------------
	// ЗИМА
	// -------------------------------------------------

	winterWords := []string{
		"радиатор",
		"обогрев",
		"отоплен",
		"тёплый пол",
		"теплый пол",
		"heater",
		"heating",
	}

	for _, word := range winterWords {

		if strings.Contains(text, word) {
			return "winter"
		}
	}

	// -------------------------------------------------
	// ЛЕТО
	// -------------------------------------------------

	summerWords := []string{
		"кондиционер",
		"кондицион",
		"керхер",
		"мойка высокого давления",
		"air conditioner",
		"pressure washer",
	}

	for _, word := range summerWords {

		if strings.Contains(text, word) {
			return "summer"
		}
	}

	// -------------------------------------------------
	// ВСЕГДА / КРУГЛЫЙ ГОД
	// -------------------------------------------------

	return "all_year"
}
