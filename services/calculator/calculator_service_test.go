package calculator

import "testing"

func TestCalculate(t *testing.T) {
	equipment := []EquipmentInput{
		{
			PowerW:          2500,
			Quantity:        2,
			CalculationType: "quantity",
		},
		{
			PowerW:          2000,
			Quantity:        1,
			CalculationType: "quantity",
		},
	}

	result := Calculate(equipment)

	expectedTotalPowerW := 7000
	expectedRequiredPowerW := 8400

	if result.TotalPowerW != expectedTotalPowerW {
		t.Errorf(
			"expected total power %d W, got %d W",
			expectedTotalPowerW,
			result.TotalPowerW,
		)
	}

	if result.RequiredPowerW != expectedRequiredPowerW {
		t.Errorf(
			"expected required power %d W, got %d W",
			expectedRequiredPowerW,
			result.RequiredPowerW,
		)
	}
}

func TestCalculateLighting(t *testing.T) {
	equipment := []EquipmentInput{
		{
			CalculationType: "power",
			SelectedPowerKW: 1.0,
			HoursPerDay:     5,
		},
	}

	result := Calculate(equipment)

	expectedTotalPowerW := 1000
	expectedRequiredPowerW := 1200

	if result.TotalPowerW != expectedTotalPowerW {
		t.Errorf(
			"expected lighting power %d W, got %d W",
			expectedTotalPowerW,
			result.TotalPowerW,
		)
	}

	if result.RequiredPowerW != expectedRequiredPowerW {
		t.Errorf(
			"expected required power %d W, got %d W",
			expectedRequiredPowerW,
			result.RequiredPowerW,
		)
	}

	if result.DailyEnergyKWh != 5 {
		t.Errorf(
			"expected daily energy %.2f kWh, got %.2f kWh",
			5.0,
			result.DailyEnergyKWh,
		)
	}
}

func TestCalculateMixedEquipment(t *testing.T) {
	equipment := []EquipmentInput{
		{
			PowerW:          250,
			Quantity:        1,
			CalculationType: "quantity",
		},
		{
			PowerW:          1500,
			Quantity:        2,
			CalculationType: "quantity",
		},
		{
			CalculationType: "power",
			SelectedPowerKW: 1.0,
			HoursPerDay:     5,
		},
	}

	result := Calculate(equipment)

	// 250 + (1500 × 2) + 1000 = 4250 W
	expectedTotalPowerW := 4250

	if result.TotalPowerW != expectedTotalPowerW {
		t.Errorf(
			"expected total power %d W, got %d W",
			expectedTotalPowerW,
			result.TotalPowerW,
		)
	}
}

func TestRecommendSystemPower(t *testing.T) {
	tests := []struct {
		name     string
		required float64
		expected float64
	}{
		{
			name:     "3.5 kW",
			required: 3.0,
			expected: 3.5,
		},
		{
			name:     "5 kW",
			required: 4.5,
			expected: 5,
		},
		{
			name:     "10 kW",
			required: 8.4,
			expected: 10,
		},
		{
			name:     "15 kW",
			required: 12,
			expected: 15,
		},
		{
			name:     "20 kW",
			required: 18,
			expected: 20,
		},
		{
			name:     "25 kW",
			required: 23,
			expected: 25,
		},
		{
			name:     "above 25 kW",
			required: 28,
			expected: 0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := RecommendSystemPower(tt.required)

			if result != tt.expected {
				t.Errorf(
					"expected %.1f kW, got %.1f kW",
					tt.expected,
					result,
				)
			}
		})
	}
}
