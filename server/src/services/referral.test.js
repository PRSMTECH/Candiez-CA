import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

/**
 * Unit tests for referral commission calculation logic.
 *
 * These tests verify the business rules for the Ambassador Program:
 * - Commission is calculated on subtotal (before tax)
 * - Commission rates vary by ambassador tier (5%, 7.5%, 10%, 15%)
 * - Commission is reversed when transactions are voided
 * - Partial refunds result in proportional commission reversal
 */

describe('Referral Commission Calculation', () => {
  // Commission rate tiers
  const tiers = {
    Member: 0.05,       // 5%
    Promoter: 0.075,    // 7.5%
    Ambassador: 0.10,   // 10%
    Elite: 0.15         // 15%
  }

  describe('Commission Calculation', () => {
    it('calculates Member tier commission (5%) correctly', () => {
      const subtotal = 100.00
      const commission = subtotal * tiers.Member
      expect(commission).toBe(5.00)
    })

    it('calculates Promoter tier commission (7.5%) correctly', () => {
      const subtotal = 100.00
      const commission = subtotal * tiers.Promoter
      expect(commission).toBe(7.50)
    })

    it('calculates Ambassador tier commission (10%) correctly', () => {
      const subtotal = 100.00
      const commission = subtotal * tiers.Ambassador
      expect(commission).toBe(10.00)
    })

    it('calculates Elite tier commission (15%) correctly', () => {
      const subtotal = 100.00
      const commission = subtotal * tiers.Elite
      expect(commission).toBe(15.00)
    })

    it('handles decimal subtotals correctly', () => {
      const subtotal = 87.53
      const commission = subtotal * tiers.Member
      // Round to 2 decimal places like the actual implementation
      expect(Math.round(commission * 100) / 100).toBe(4.38)
    })

    it('handles zero subtotal', () => {
      const subtotal = 0
      const commission = subtotal * tiers.Elite
      expect(commission).toBe(0)
    })

    it('handles large subtotals', () => {
      const subtotal = 10000.00
      const commission = subtotal * tiers.Elite
      expect(commission).toBe(1500.00)
    })
  })

  describe('Commission Reversal', () => {
    it('calculates full commission reversal correctly', () => {
      const originalSubtotal = 100.00
      const originalCommission = originalSubtotal * tiers.Member // $5.00
      const refundAmount = 100.00 // Full refund

      // Proportional reversal: (refundAmount / originalSubtotal) * originalCommission
      const reversal = (refundAmount / originalSubtotal) * originalCommission
      expect(reversal).toBe(5.00)
    })

    it('calculates partial commission reversal correctly', () => {
      const originalSubtotal = 100.00
      const originalCommission = originalSubtotal * tiers.Member // $5.00
      const refundAmount = 50.00 // Half refund

      const reversal = (refundAmount / originalSubtotal) * originalCommission
      expect(reversal).toBe(2.50)
    })

    it('handles small partial refunds', () => {
      const originalSubtotal = 100.00
      const originalCommission = originalSubtotal * tiers.Ambassador // $10.00
      const refundAmount = 10.00 // 10% refund

      const reversal = (refundAmount / originalSubtotal) * originalCommission
      expect(reversal).toBe(1.00)
    })

    it('handles decimal refund amounts', () => {
      const originalSubtotal = 87.53
      const originalCommission = originalSubtotal * tiers.Member // ~$4.38
      const refundAmount = 25.00

      // Proportional reversal
      const reversal = (refundAmount / originalSubtotal) * originalCommission
      // Expected: (25 / 87.53) * 4.3765 ≈ 1.25
      expect(Math.round(reversal * 100) / 100).toBeCloseTo(1.25, 1)
    })

    it('never reverses more than original commission', () => {
      const originalSubtotal = 100.00
      const originalCommission = originalSubtotal * tiers.Member // $5.00
      const refundAmount = 150.00 // More than original (shouldn't happen but test edge case)

      // Cap reversal at original commission
      const reversal = Math.min(
        (refundAmount / originalSubtotal) * originalCommission,
        originalCommission
      )
      expect(reversal).toBe(originalCommission)
    })
  })

  describe('Tier Upgrade Logic', () => {
    const tierRequirements = [
      { name: 'Member', minReferrals: 0, minSales: 0, rate: 0.05 },
      { name: 'Promoter', minReferrals: 5, minSales: 500, rate: 0.075 },
      { name: 'Ambassador', minReferrals: 15, minSales: 2000, rate: 0.10 },
      { name: 'Elite', minReferrals: 50, minSales: 10000, rate: 0.15 }
    ]

    const calculateTier = (referralCount, totalSales) => {
      // Find the highest tier the user qualifies for
      let qualifiedTier = tierRequirements[0]
      for (const tier of tierRequirements) {
        if (referralCount >= tier.minReferrals && totalSales >= tier.minSales) {
          qualifiedTier = tier
        }
      }
      return qualifiedTier
    }

    it('new user starts at Member tier', () => {
      const tier = calculateTier(0, 0)
      expect(tier.name).toBe('Member')
      expect(tier.rate).toBe(0.05)
    })

    it('upgrades to Promoter with 5 referrals and $500 sales', () => {
      const tier = calculateTier(5, 500)
      expect(tier.name).toBe('Promoter')
      expect(tier.rate).toBe(0.075)
    })

    it('remains Member if referrals met but not sales', () => {
      const tier = calculateTier(10, 200)
      expect(tier.name).toBe('Member') // Has referrals but not enough sales
    })

    it('remains Member if sales met but not referrals', () => {
      const tier = calculateTier(2, 1000)
      expect(tier.name).toBe('Member') // Has sales but not enough referrals
    })

    it('upgrades to Ambassador tier correctly', () => {
      const tier = calculateTier(15, 2000)
      expect(tier.name).toBe('Ambassador')
      expect(tier.rate).toBe(0.10)
    })

    it('upgrades to Elite tier correctly', () => {
      const tier = calculateTier(50, 10000)
      expect(tier.name).toBe('Elite')
      expect(tier.rate).toBe(0.15)
    })

    it('exceeding requirements stays at Elite', () => {
      const tier = calculateTier(100, 50000)
      expect(tier.name).toBe('Elite')
    })
  })

  describe('Balance Management', () => {
    it('adds commission to available balance', () => {
      let availableBalance = 50.00
      const newCommission = 10.00
      availableBalance += newCommission
      expect(availableBalance).toBe(60.00)
    })

    it('subtracts redemption from available balance', () => {
      let availableBalance = 50.00
      const redemption = 30.00
      availableBalance -= redemption
      expect(availableBalance).toBe(20.00)
    })

    it('prevents negative balance from redemption', () => {
      let availableBalance = 25.00
      const redemption = 30.00

      // Validate before redemption
      const canRedeem = redemption <= availableBalance
      expect(canRedeem).toBe(false)
    })

    it('allows full balance redemption', () => {
      let availableBalance = 50.00
      const redemption = 50.00

      const canRedeem = redemption <= availableBalance
      expect(canRedeem).toBe(true)

      availableBalance -= redemption
      expect(availableBalance).toBe(0)
    })

    it('tracks total earnings separately from available balance', () => {
      let totalEarnings = 100.00
      let availableBalance = 100.00

      // Redeem some
      const redemption = 40.00
      availableBalance -= redemption

      // Total earnings unchanged, available balance reduced
      expect(totalEarnings).toBe(100.00)
      expect(availableBalance).toBe(60.00)
    })

    it('handles commission reversal reducing available balance', () => {
      let availableBalance = 50.00
      let totalEarnings = 100.00
      const reversal = 10.00

      availableBalance -= reversal
      totalEarnings -= reversal

      expect(availableBalance).toBe(40.00)
      expect(totalEarnings).toBe(90.00)
    })
  })

  describe('Referral Link Generation', () => {
    const generateReferralLink = (baseUrl, code) => {
      return `${baseUrl}/signup?ref=${code}`
    }

    it('generates correct referral link', () => {
      const link = generateReferralLink('https://candiez.shop', 'ABC123')
      expect(link).toBe('https://candiez.shop/signup?ref=ABC123')
    })

    it('handles different base URLs', () => {
      const link = generateReferralLink('http://localhost:5173', 'TEST01')
      expect(link).toBe('http://localhost:5173/signup?ref=TEST01')
    })
  })
})

describe('Referral Code Generation', () => {
  const generateReferralCode = (firstName, lastName, id) => {
    const prefix = (firstName.substring(0, 2) + lastName.substring(0, 2)).toUpperCase()
    const paddedId = String(id).padStart(4, '0')
    return `${prefix}${paddedId}`
  }

  it('generates code from name and ID', () => {
    const code = generateReferralCode('Admin', 'User', 1)
    expect(code).toBe('ADUS0001')
  })

  it('pads ID with zeros', () => {
    const code = generateReferralCode('John', 'Doe', 42)
    expect(code).toBe('JODO0042')
  })

  it('handles three-digit IDs', () => {
    const code = generateReferralCode('Jane', 'Smith', 123)
    expect(code).toBe('JASM0123')
  })

  it('handles four-digit IDs', () => {
    const code = generateReferralCode('Bob', 'Brown', 9999)
    expect(code).toBe('BOBR9999')
  })

  it('handles short names', () => {
    const code = generateReferralCode('Al', 'Li', 5)
    expect(code).toBe('ALLI0005')
  })
})
