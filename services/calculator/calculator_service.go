package calculator

import "math"

type EquipmentInput struct {
	PowerW          int
	AveragePowerW   int
	HoursPerDay     float64
	Quantity        int
	CalculationType string

	// Для освещения:
	// например 1.0 = 1 kW
	SelectedPowerKW float64

	// Группа сезонности:
	// "all_year" — круглогодичная техника
	// "summer"   — летняя техника
	// "winter"   — зимняя техника
	SeasonGroup string
}

type CalculationResult struct {
	TotalPowerW         int     `json:"total_power_w"`
	TotalPowerKW        float64 `json:"total_power_kw"`
	RequiredPowerW      int     `json:"required_power_w"`
	RequiredPowerKW     float64 `json:"required_power_kw"`
	RecommendedSystemKW float64 `json:"recommended_system_kw"`

	DailyEnergyWh  float64 `json:"daily_energy_wh"`
	DailyEnergyKWh float64 `json:"daily_energy_kwh"`

	// Реалистичная расчётная нагрузка
	SimultaneousPowerW  int     `json:"simultaneous_power_w"`
	SimultaneousPowerKW float64 `json:"simultaneous_power_kw"`

	// Информация для клиента
	SeasonalAdjustment bool   `json:"seasonal_adjustment"`
	CalculationMessage string `json:"calculation_message"`
}

func Calculate(
	equipment []EquipmentInput,
) CalculationResult {

	// -------------------------------------------------
	// Полная установленная мощность всех выбранных
	// приборов.
	//
	// Это НЕ означает, что всё работает одновременно.
	// -------------------------------------------------

	totalPowerW := 0

	// -------------------------------------------------
	// Суточное энергопотребление
	// -------------------------------------------------

	dailyEnergyWh := 0.0

	// -------------------------------------------------
	// Отдельные группы нагрузки
	//
	// allYear = круглогодичная техника
	// summer  = летняя техника
	// winter  = зимняя техника
	// -------------------------------------------------

	allYearPowerW := 0
	summerPowerW := 0
	winterPowerW := 0

	for _, item := range equipment {

		// =============================================
		// ОСВЕЩЕНИЕ
		// =============================================

		if item.CalculationType == "power" {

			if item.SelectedPowerKW <= 0 {
				continue
			}

			powerW := int(
				math.Round(item.SelectedPowerKW * 1000),
			)

			totalPowerW += powerW

			hoursPerDay := item.HoursPerDay

			if hoursPerDay <= 0 {
				hoursPerDay = 5
			}

			dailyEnergyWh +=
				float64(powerW) *
					hoursPerDay

			// Освещение считаем круглогодичной
			// нагрузкой.
			allYearPowerW += powerW

			continue
		}

		// =============================================
		// ОБЫЧНАЯ ТЕХНИКА
		// =============================================

		if item.Quantity <= 0 {
			continue
		}

		quantity := item.Quantity

		averagePowerW := item.AveragePowerW

		if averagePowerW <= 0 {
			averagePowerW = item.PowerW
		}

		hoursPerDay := item.HoursPerDay

		if hoursPerDay <= 0 {
			hoursPerDay = 1
		}

		itemPowerW :=
			item.PowerW *
				quantity

		totalPowerW += itemPowerW

		// Суточное энергопотребление.
		dailyEnergyWh +=
			float64(averagePowerW) *
				hoursPerDay *
				float64(quantity)

		// =============================================
		// РАЗДЕЛЕНИЕ ПО СЕЗОНАМ
		// =============================================

		switch item.SeasonGroup {

		case "summer":
			summerPowerW += itemPowerW

		case "winter":
			winterPowerW += itemPowerW

		default:
			allYearPowerW += itemPowerW
		}
	}

	// =================================================
	// РЕАЛИСТИЧНАЯ ОДНОВРЕМЕННАЯ НАГРУЗКА
	// =================================================
	//
	// Не считаем, что клиент включает абсолютно
	// всё одновременно.
	//
	// Круглогодичная техника:
	// 65% одновременной нагрузки.
	//
	// Сезонная техника:
	// рассматривается отдельно.
	//
	// Это позволяет избежать ситуации:
	//
	// радиатор + кондиционер + тёплый пол +
	// керхер + духовка + утюг + пылесос
	//
	// одновременно на 100%.
	// =================================================

	const allYearFactor = 0.65
	const seasonalFactor = 0.65

	allYearLoad := float64(allYearPowerW) * allYearFactor

	summerLoad :=
		allYearLoad +
			float64(summerPowerW)*seasonalFactor

	winterLoad :=
		allYearLoad +
			float64(winterPowerW)*seasonalFactor

	// Берём наиболее тяжёлый реальный сезон.
	designPowerKW := math.Max(
		summerLoad,
		winterLoad,
	) / 1000

	// Если по какой-то причине сезонные группы
	// отсутствуют, используем круглогодичную нагрузку.
	if designPowerKW <= 0 && totalPowerW > 0 {
		designPowerKW =
			float64(totalPowerW) *
				allYearFactor /
				1000
	}

	// =================================================
	// ЗАПАС МОЩНОСТИ
	// =================================================

	const safetyFactor = 1.20

	requiredPowerKW :=
		designPowerKW *
			safetyFactor

	requiredPowerW :=
		int(math.Ceil(
			requiredPowerKW * 1000,
		))

	// =================================================
	// РЕКОМЕНДУЕМАЯ МОЩНОСТЬ ИНВЕРТОРА
	// =================================================

	recommendedSystemKW :=
		RecommendSystemPower(
			requiredPowerKW,
		)

	return CalculationResult{
		TotalPowerW: totalPowerW,

		TotalPowerKW: float64(totalPowerW) / 1000,

		RequiredPowerW: requiredPowerW,

		RequiredPowerKW: float64(requiredPowerW) / 1000,

		RecommendedSystemKW: recommendedSystemKW,

		DailyEnergyWh: dailyEnergyWh,

		DailyEnergyKWh: dailyEnergyWh / 1000,

		SimultaneousPowerW: int(math.Round(
			designPowerKW * 1000,
		)),

		SimultaneousPowerKW: designPowerKW,

		SeasonalAdjustment: summerPowerW > 0 ||
			winterPowerW > 0,

		CalculationMessage: "Расчёт учитывает сезонность и то, что бытовая техника обычно не работает одновременно.",
	}
}

func RecommendSystemPower(
	requiredPowerKW float64,
) float64 {

	switch {

	case requiredPowerKW <= 3.5:
		return 3.5

	case requiredPowerKW <= 5:
		return 5

	case requiredPowerKW <= 10:
		return 10

	case requiredPowerKW <= 15:
		return 15

	case requiredPowerKW <= 20:
		return 20

	case requiredPowerKW <= 25:
		return 25

	default:
		// Если требуется больше 25 kW,
		// сейчас не придумываем несуществующий
		// пакет.
		return 0
	}
}
