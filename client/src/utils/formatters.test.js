import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatDate,
  formatPhone,
  calculateLoyaltyTier,
  getTierMultiplier,
} from './formatters'

describe('formatCurrency', () => {
  it('formats positive numbers correctly', () => {
    expect(formatCurrency(10)).toBe('$10.00')
    expect(formatCurrency(99.99)).toBe('$99.99')
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('handles invalid inputs', () => {
    expect(formatCurrency(null)).toBe('$0.00')
    expect(formatCurrency(undefined)).toBe('$0.00')
    expect(formatCurrency('not a number')).toBe('$0.00')
    expect(formatCurrency(NaN)).toBe('$0.00')
  })
})

describe('formatDate', () => {
  it('formats Date objects correctly', () => {
    // Use explicit time to avoid timezone issues
    const date = new Date(2025, 0, 15, 12, 0, 0) // Jan 15, 2025 at noon local time
    const formatted = formatDate(date)
    expect(formatted).toContain('Jan')
    expect(formatted).toContain('15')
    expect(formatted).toContain('2025')
  })

  it('formats date strings correctly', () => {
    // Use explicit time to avoid timezone issues
    const formatted = formatDate('2025-06-20T12:00:00')
    expect(formatted).toContain('Jun')
    expect(formatted).toContain('20')
    expect(formatted).toContain('2025')
  })

  it('handles empty/invalid inputs', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDate('')).toBe('')
    expect(formatDate('invalid-date')).toBe('')
  })
})

describe('formatPhone', () => {
  it('formats 10-digit phone numbers', () => {
    expect(formatPhone('5551234567')).toBe('(555) 123-4567')
    expect(formatPhone('555-123-4567')).toBe('(555) 123-4567')
    expect(formatPhone('(555) 123-4567')).toBe('(555) 123-4567')
  })

  it('returns original for non-10-digit numbers', () => {
    expect(formatPhone('123')).toBe('123')
    expect(formatPhone('12345678901')).toBe('12345678901')
  })

  it('handles empty inputs', () => {
    expect(formatPhone('')).toBe('')
    expect(formatPhone(null)).toBe('')
    expect(formatPhone(undefined)).toBe('')
  })
})

describe('calculateLoyaltyTier', () => {
  it('returns Bronze for low points', () => {
    expect(calculateLoyaltyTier(0)).toBe('Bronze')
    expect(calculateLoyaltyTier(500)).toBe('Bronze')
    expect(calculateLoyaltyTier(999)).toBe('Bronze')
  })

  it('returns Silver for 1000+ points', () => {
    expect(calculateLoyaltyTier(1000)).toBe('Silver')
    expect(calculateLoyaltyTier(4999)).toBe('Silver')
  })

  it('returns Gold for 5000+ points', () => {
    expect(calculateLoyaltyTier(5000)).toBe('Gold')
    expect(calculateLoyaltyTier(9999)).toBe('Gold')
  })

  it('returns Platinum for 10000+ points', () => {
    expect(calculateLoyaltyTier(10000)).toBe('Platinum')
    expect(calculateLoyaltyTier(50000)).toBe('Platinum')
  })

  it('handles invalid inputs', () => {
    expect(calculateLoyaltyTier(-100)).toBe('Bronze')
    expect(calculateLoyaltyTier(null)).toBe('Bronze')
    expect(calculateLoyaltyTier('not a number')).toBe('Bronze')
  })
})

describe('getTierMultiplier', () => {
  it('returns correct multipliers for each tier', () => {
    expect(getTierMultiplier('Bronze')).toBe(1)
    expect(getTierMultiplier('Silver')).toBe(1.25)
    expect(getTierMultiplier('Gold')).toBe(1.5)
    expect(getTierMultiplier('Platinum')).toBe(2)
  })

  it('returns 1 for unknown tiers', () => {
    expect(getTierMultiplier('Diamond')).toBe(1)
    expect(getTierMultiplier('')).toBe(1)
    expect(getTierMultiplier(null)).toBe(1)
  })
})
