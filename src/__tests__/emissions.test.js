/**
 * Unit tests for emission calculation engine
 * Run with: npm test
 */
import {
  calculateEmission,
  getTotalMonthlyEmission,
  getCategoryBreakdown,
  compareToGlobalAverage,
} from '../utils/emissionFactors'
import { formatCO2 } from '../utils/formatters'

// ─── calculateEmission ────────────────────────────────────────────────────────

describe('calculateEmission()', () => {
  describe('transport category', () => {
    it('calculates petrol car emissions correctly', () => {
      // 100 km × 0.192 kg/km = 19.2 kg
      expect(calculateEmission('transport', 'car_petrol', 100)).toBeCloseTo(19.2)
    })

    it('calculates electric car emissions correctly', () => {
      expect(calculateEmission('transport', 'car_electric', 100)).toBeCloseTo(5.3)
    })

    it('returns 0 for bicycle', () => {
      expect(calculateEmission('transport', 'bicycle', 50)).toBe(0)
    })

    it('returns 0 for walking', () => {
      expect(calculateEmission('transport', 'walking', 10)).toBe(0)
    })

    it('calculates domestic flight correctly', () => {
      // 500 km × 0.255 = 127.5 kg
      expect(calculateEmission('transport', 'flight_domestic', 500)).toBeCloseTo(127.5)
    })
  })

  describe('food category', () => {
    it('calculates mutton meal correctly', () => {
      // 2 servings × 5.84 = 11.68 kg
      expect(calculateEmission('food', 'mutton', 2)).toBeCloseTo(11.68)
    })

    it('calculates vegan meal correctly', () => {
      // 3 servings × 0.22 = 0.66 kg
      expect(calculateEmission('food', 'vegan', 3)).toBeCloseTo(0.66)
    })

    it('calculates veg thali correctly', () => {
      // 1 serving × 0.40 = 0.40 kg
      expect(calculateEmission('food', 'veg_thali', 1)).toBeCloseTo(0.40)
    })
  })

  describe('energy category', () => {
    it('calculates India electricity correctly', () => {
      // 300 kWh × 0.82 = 246 kg
      expect(calculateEmission('energy', 'electricity_india', 300)).toBeCloseTo(246)
    })

    it('calculates LPG correctly', () => {
      // 10 L × 1.51 = 15.1 kg
      expect(calculateEmission('energy', 'lpg', 10)).toBeCloseTo(15.1)
    })
  })

  describe('shopping category', () => {
    it('calculates clothing item correctly', () => {
      // 2 items × 10.0 = 20 kg
      expect(calculateEmission('shopping', 'clothing_item', 2)).toBeCloseTo(20)
    })

    it('calculates large electronics correctly', () => {
      expect(calculateEmission('shopping', 'electronics_large', 1)).toBeCloseTo(200)
    })
  })

  describe('edge cases', () => {
    it('returns 0 for zero quantity', () => {
      expect(calculateEmission('transport', 'car_petrol', 0)).toBe(0)
    })

    it('returns 0 for negative quantity', () => {
      expect(calculateEmission('transport', 'car_petrol', -10)).toBe(0)
    })

    it('returns 0 for unknown category', () => {
      expect(calculateEmission('unknown', 'car_petrol', 100)).toBe(0)
    })

    it('returns 0 for unknown subcategory', () => {
      expect(calculateEmission('transport', 'hovercraft', 100)).toBe(0)
    })

    it('handles string quantity by parsing to float', () => {
      expect(calculateEmission('transport', 'car_petrol', '50')).toBeCloseTo(9.6)
    })

    it('returns 0 for non-numeric quantity', () => {
      expect(calculateEmission('transport', 'car_petrol', 'abc')).toBe(0)
    })
  })
})

// ─── getTotalMonthlyEmission ──────────────────────────────────────────────────

describe('getTotalMonthlyEmission()', () => {
  const now = new Date()
  const thisMonth = now.toISOString()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15).toISOString()

  it('sums current month logs only', () => {
    const logs = [
      { date: thisMonth, co2Kg: 10 },
      { date: thisMonth, co2Kg: 20 },
      { date: lastMonth, co2Kg: 100 }, // should be excluded
    ]
    expect(getTotalMonthlyEmission(logs)).toBeCloseTo(30)
  })

  it('returns 0 for empty array', () => {
    expect(getTotalMonthlyEmission([])).toBe(0)
  })

  it('returns 0 for non-array input', () => {
    expect(getTotalMonthlyEmission(null)).toBe(0)
    expect(getTotalMonthlyEmission(undefined)).toBe(0)
    expect(getTotalMonthlyEmission('string')).toBe(0)
  })

  it('handles missing co2Kg gracefully', () => {
    const logs = [
      { date: thisMonth, co2Kg: 5 },
      { date: thisMonth }, // no co2Kg
    ]
    expect(getTotalMonthlyEmission(logs)).toBeCloseTo(5)
  })
})

// ─── compareToGlobalAverage ──────────────────────────────────────────────────

describe('compareToGlobalAverage()', () => {
  it('correctly identifies above-average status', () => {
    const result = compareToGlobalAverage(500)
    expect(result.status).toBe('above')
    expect(result.isAboveAverage).toBe(true)
    expect(result.diff).toBeCloseTo(108.33)
  })

  it('correctly identifies below-average status', () => {
    const result = compareToGlobalAverage(200)
    expect(result.status).toBe('below')
    expect(result.isAboveAverage).toBe(false)
    expect(result.diff).toBeCloseTo(-191.67)
  })

  it('returns global average of 391.67', () => {
    const result = compareToGlobalAverage(0)
    expect(result.globalAverage).toBe(391.67)
  })

  it('returns India average of 230', () => {
    const result = compareToGlobalAverage(0)
    expect(result.indiaAverage).toBe(230)
  })

  it('returns correct percent for known inputs', () => {
    const result = compareToGlobalAverage(0)
    expect(parseFloat(result.percent)).toBeCloseTo(100)
  })

  it('handles non-numeric input', () => {
    const result = compareToGlobalAverage('abc')
    expect(result.total).toBe(0)
    expect(result.status).toBe('below')
  })
})

// ─── formatCO2 ───────────────────────────────────────────────────────────────

describe('formatCO2()', () => {
  it('formats values under 1000 kg correctly', () => {
    expect(formatCO2(123.456)).toBe('123.5 kg CO₂')
  })

  it('formats values >= 1000 as tonnes', () => {
    expect(formatCO2(1234)).toBe('1.23 t CO₂')
  })

  it('formats zero correctly', () => {
    expect(formatCO2(0)).toBe('0.0 kg CO₂')
  })

  it('formats exactly 1000 as tonnes', () => {
    expect(formatCO2(1000)).toBe('1.00 t CO₂')
  })

  it('handles non-numeric input gracefully', () => {
    expect(formatCO2(null)).toBe('0.0 kg CO₂')
    expect(formatCO2(undefined)).toBe('0.0 kg CO₂')
    expect(formatCO2('abc')).toBe('0.0 kg CO₂')
  })

  it('handles string numbers', () => {
    expect(formatCO2('250')).toBe('250.0 kg CO₂')
  })
})
